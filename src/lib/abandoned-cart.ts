/**
 * Abandoned Cart API
 * 
 * Saves cart state to the backend for recovery via Klaviyo abandoned cart flows.
 * The backend mu-plugin (headless-abandoned-carts.php) handles:
 * - Storing cart data with a unique recovery token
 * - Detecting abandoned carts after 1 hour
 * - Sending "Started Checkout" events to Klaviyo
 * - Generating recovery URLs (drinkyum.com/cart/recover/{token})
 */

import { buildWpApiUrl } from './wp-api-url'

interface AbandonedCartItem {
  product_id: number | string
  name: string
  quantity: number
  price: number
  image?: string
  permalink?: string
  sku?: string
}

interface SaveCartParams {
  cart: AbandonedCartItem[]
  cart_total: number
  email?: string
  first_name?: string
  last_name?: string
  phone?: string
}

interface SaveCartResponse {
  success: boolean
  action: 'created' | 'updated'
  recovery_token: string
  recovery_url: string
}

interface RecoverCartResponse {
  success: boolean
  cart: AbandonedCartItem[]
  cart_total: number
  currency: string
  email: string | null
  first_name: string | null
  last_name: string | null
  status: string
  created_at: string
}

// Persistent session token for cart tracking
function getSessionToken(): string {
  const key = 'hac_session_token'
  if (typeof window === 'undefined') return ''
  let token = localStorage.getItem(key)
  if (!token) {
    token = crypto.randomUUID?.() || Math.random().toString(36).slice(2) + Date.now().toString(36)
    localStorage.setItem(key, token)
  }
  return token
}

// Get GA4 client_id from cookie
function getClientId(): string {
  if (typeof document === 'undefined') return ''
  const gaCookie = document.cookie.split(';').find(c => c.trim().startsWith('_ga='))
  if (gaCookie) {
    const parts = gaCookie.split('.')
    if (parts.length >= 4) return `${parts[2]}.${parts[3]}`
  }
  return localStorage.getItem('client_id') || ''
}

// Get UTM params from URL or sessionStorage
function getUtmParams() {
  if (typeof window === 'undefined') return {}
  const params = new URLSearchParams(window.location.search)
  return {
    utm_source: params.get('utm_source') || sessionStorage.getItem('utm_source') || '',
    utm_medium: params.get('utm_medium') || sessionStorage.getItem('utm_medium') || '',
    utm_campaign: params.get('utm_campaign') || sessionStorage.getItem('utm_campaign') || '',
  }
}

/**
 * Save or update abandoned cart on the backend.
 * Call this when checkout page loads and when customer updates their info.
 */
export async function saveAbandonedCart(params: SaveCartParams): Promise<SaveCartResponse | null> {
  try {
    const utm = getUtmParams()
    const res = await fetch(buildWpApiUrl('/abandoned-cart/v1/save'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_token: getSessionToken(),
        client_id: getClientId(),
        currency: 'USD',
        ...utm,
        ...params,
      }),
    })

    if (!res.ok) {
      console.error('[AbandonedCart] Save failed:', res.status)
      return null
    }

    const data = await res.json()
    
    // Store recovery token for reference
    if (data.recovery_token) {
      localStorage.setItem('hac_recovery_token', data.recovery_token)
    }
    
    return data
  } catch (err) {
    console.error('[AbandonedCart] Save error:', err)
    return null
  }
}

/**
 * Recover a cart by its recovery token.
 * Returns the saved cart data for rehydration.
 */
export async function recoverCart(token: string): Promise<RecoverCartResponse | null> {
  try {
    const res = await fetch(buildWpApiUrl(`/abandoned-cart/v1/recover/${token}`))
    
    if (res.status === 404 || res.status === 410) {
      return null
    }
    
    if (!res.ok) {
      console.error('[AbandonedCart] Recover failed:', res.status)
      return null
    }

    return await res.json()
  } catch (err) {
    console.error('[AbandonedCart] Recover error:', err)
    return null
  }
}

/**
 * Mark a cart as recovered (call after rehydrating items).
 */
export async function markCartRecovered(token: string): Promise<boolean> {
  try {
    const res = await fetch(buildWpApiUrl(`/abandoned-cart/v1/recovered/${token}`), {
      method: 'POST',
    })
    return res.ok
  } catch {
    return false
  }
}
