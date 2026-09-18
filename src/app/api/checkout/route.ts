/**
 * Checkout API proxy route
 *
 * Proxies checkout requests to WooCommerce Store API
 * This avoids CORS issues by making server-to-server requests
 *
 * GET /api/checkout - Get current checkout state (cart with totals)
 * POST /api/checkout - Various checkout operations
 */

import { NextRequest, NextResponse } from 'next/server'
import { buildWpApiUrl } from '@/lib/wp-api-url'
import { shippingRestrictionError } from '@/lib/restricted-states'

// Using buildWpApiUrl for compatibility with subdirectory multisite
function getStoreApiUrl(path: string) { return buildWpApiUrl(`/wc/store/v1${path}`) }

const CART_KEY_COOKIE = 'yum_cart_key'
const CART_KEY_HEADER = 'x-cart-key'

/**
 * Mirror the CoCart cart into the WC Store API session before placing an order.
 *
 * The storefront cart lives in CoCart (keyed by cart_key), but order placement
 * goes through the Store API /checkout, which has a SEPARATE session. Without
 * this sync the Store API cart is empty and checkout fails with
 * "Cannot place an order, your cart is empty."
 *
 * The Store API session persists via its wp_woocommerce_session_* cookie (the
 * Cart-Token alone does NOT persist on this backend — verified), so we carry
 * the cookies it hands back through every hop and return them for the final
 * /checkout POST.
 *
 * Best-effort: any failure returns null and the caller falls through to the
 * previous behavior rather than blocking checkout in a new way.
 */
async function syncCartToStoreApi(
  request: NextRequest,
): Promise<{ cookie: string; cartToken?: string; nonce?: string } | null> {
  try {
    const cartKey =
      request.headers.get(CART_KEY_HEADER) ||
      request.cookies.get(CART_KEY_COOKIE)?.value
    if (!cartKey) return null

    // 1) Read the CoCart cart (items + applied coupons).
    const coCartUrl = buildWpApiUrl('/cocart/v2/cart', { cart_key: cartKey })
    const coRes = await fetch(coCartUrl, { method: 'GET' })
    if (!coRes.ok) return null
    const coCart = await coRes.json()
    const items: Array<{ id: number; quantity: number }> = (coCart?.items || [])
      .map((i: { id?: number; quantity?: { value?: number } | number }) => ({
        id: Number(i.id),
        quantity:
          typeof i.quantity === 'object'
            ? Number(i.quantity?.value ?? 0)
            : Number(i.quantity ?? 0),
      }))
      .filter((i: { id: number; quantity: number }) => i.id > 0 && i.quantity > 0)
    if (items.length === 0) return null
    const coupons: string[] = (coCart?.coupons || [])
      .map((c: { coupon?: string; code?: string }) => c.coupon || c.code)
      .filter(Boolean)

    // 2) Prime a Store API session; carry its cookies + token + nonce forward.
    let cookie = ''
    let cartToken: string | undefined
    let nonce: string | undefined
    const absorb = (res: Response) => {
      const set = (res.headers as Headers & { getSetCookie?: () => string[] }).getSetCookie?.() ?? []
      const session = set.filter(c => /^wp_woocommerce_session_/i.test(c.trim()))
      if (session.length > 0) cookie = session.map(c => c.split(';')[0]).join('; ')
      const ct = res.headers.get('Cart-Token'); if (ct) cartToken = ct
      const nc = res.headers.get('Nonce'); if (nc) nonce = nc
    }
    const hdrs = () => {
      const h: Record<string, string> = { 'Content-Type': 'application/json' }
      if (cookie) h.Cookie = cookie
      if (cartToken) h['Cart-Token'] = cartToken
      if (nonce) h.Nonce = nonce
      return h
    }

    absorb(await fetch(getStoreApiUrl('/cart'), { method: 'GET' }))

    // 3) Clear anything stale, then add each item.
    const existing = await fetch(getStoreApiUrl('/cart'), { headers: hdrs() })
    absorb(existing)
    const existingCart = await existing.json().catch(() => null)
    if (existingCart?.items?.length) {
      for (const it of existingCart.items) {
        const r = await fetch(getStoreApiUrl('/cart/remove-item'), {
          method: 'POST', headers: hdrs(), body: JSON.stringify({ key: it.key }),
        })
        absorb(r)
      }
    }
    for (const item of items) {
      const r = await fetch(getStoreApiUrl('/cart/add-item'), {
        method: 'POST', headers: hdrs(),
        body: JSON.stringify({ id: item.id, quantity: item.quantity }),
      })
      absorb(r)
      if (!r.ok) {
        console.error('[checkout sync] add-item failed', r.status, await r.text().catch(() => ''))
        return null
      }
    }
    // 4) Re-apply coupons (non-fatal — order proceeds at full price if refused).
    for (const code of coupons) {
      const r = await fetch(getStoreApiUrl('/cart/apply-coupon'), {
        method: 'POST', headers: hdrs(), body: JSON.stringify({ code }),
      })
      absorb(r)
      if (!r.ok) console.error('[checkout sync] coupon failed', code, r.status)
    }

    if (!cookie) return null
    return { cookie, cartToken, nonce }
  } catch (err) {
    console.error('[checkout sync] threw', err)
    return null
  }
}

// Forward headers from client to WooCommerce
function getForwardHeaders(request: NextRequest): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }

  // Forward cookies for session persistence (CoCart uses WC session cookies)
  const cookie = request.headers.get('Cookie')
  if (cookie) {
    headers['Cookie'] = cookie
  }

  // Forward cart token if present
  const cartToken = request.headers.get('Cart-Token')
  if (cartToken) {
    headers['Cart-Token'] = cartToken
  }

  // Forward nonce if present
  const nonce = request.headers.get('Nonce')
  if (nonce) {
    headers['Nonce'] = nonce
  }

  // Forward tracking headers for server-side analytics (GA4 MP + Meta CAPI)
  const trackingHeaders = ['X-Client-ID', 'X-Session-ID', 'X-FBP', 'X-FBC', 'X-Event-ID']
  for (const header of trackingHeaders) {
    const value = request.headers.get(header)
    if (value) {
      headers[header] = value
    }
  }

  return headers
}

// Copy response headers from WooCommerce to our response
function buildResponse(wcResponse: Response, data: unknown, status?: number): NextResponse {
  const response = NextResponse.json(data, { status: status || wcResponse.status })

  // Forward Cart-Token and Nonce headers
  const cartToken = wcResponse.headers.get('Cart-Token')
  if (cartToken) {
    response.headers.set('Cart-Token', cartToken)
  }

  const nonce = wcResponse.headers.get('Nonce')
  if (nonce) {
    response.headers.set('Nonce', nonce)
  }

  return response
}

/**
 * GET /api/checkout - Get current checkout state
 * Returns cart data with calculated shipping and totals
 */
export async function GET(request: NextRequest) {
  try {
    // Get cart data (which includes checkout-ready info)
    const wcResponse = await fetch(getStoreApiUrl("/cart"), {
      method: 'GET',
      headers: getForwardHeaders(request),
    })

    const data = await wcResponse.json()

    if (!wcResponse.ok) {
      return NextResponse.json(data, { status: wcResponse.status })
    }

    return buildResponse(wcResponse, data)
  } catch (error) {
    console.error('[Checkout API] Error fetching checkout state:', error)
    return NextResponse.json(
      { error: 'Failed to fetch checkout state' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/checkout - Handle checkout operations
 *
 * Actions:
 * - update-customer: Update billing/shipping address and email
 * - select-shipping-rate: Select a shipping method
 * - complete: Process payment and complete checkout
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...payload } = body

    let endpoint = '/checkout'
    let method = 'POST'
    // Session handed back by syncCartToStoreApi() on the complete path, so the
    // final /checkout POST runs against the session that actually holds items.
    let syncedSession: { cookie: string; cartToken?: string; nonce?: string } | null = null

    switch (action) {
      case 'update-customer':
        // Update customer info (email, addresses) via cart endpoint
        endpoint = '/cart/update-customer'
        break

      case 'select-shipping-rate':
        // Select shipping method
        endpoint = '/cart/select-shipping-rate'
        break

      case 'complete': {
        // Complete checkout - this is the main checkout endpoint
        // WooCommerce Store API expects payment data in the request
        // Server-side geo-block: refuse orders shipping to restricted states,
        // even if the client-side check was bypassed. ZIP-level.
        const shipTo = payload.shipping_address || payload.billing_address
        if (shipTo) {
          const restriction = shippingRestrictionError(
            shipTo.state || '',
            shipTo.postcode || shipTo.postal_code || ''
          )
          if (restriction) {
            return NextResponse.json(
              { code: 'restricted_shipping_destination', message: restriction },
              { status: 400 }
            )
          }
        }
        // Mirror the CoCart cart into the Store API session so /checkout sees
        // the items. Best-effort: on failure we proceed exactly as before.
        syncedSession = await syncCartToStoreApi(request)
        if (!syncedSession) {
          console.warn('[checkout] cart sync unavailable — placing order on the forwarded session')
        }
        endpoint = '/checkout'
        break
      }

      case 'get-payment-gateways':
        // List available payment gateways
        const gatewaysResponse = await fetch(getStoreApiUrl("/payment-gateways"), {
          method: 'GET',
          headers: getForwardHeaders(request),
        })
        const gateways = await gatewaysResponse.json()
        return buildResponse(gatewaysResponse, gateways)

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }

    const forwardHeaders = getForwardHeaders(request) as Record<string, string>
    if (syncedSession) {
      // Override with the session that holds the synced cart — the browser's
      // own cookies point at a different (empty) Store API session.
      forwardHeaders['Cookie'] = syncedSession.cookie
      if (syncedSession.cartToken) forwardHeaders['Cart-Token'] = syncedSession.cartToken
      if (syncedSession.nonce) forwardHeaders['Nonce'] = syncedSession.nonce
    }
    const fullUrl = getStoreApiUrl(endpoint)

    const wcResponse = await fetch(fullUrl, {
      method,
      headers: forwardHeaders,
      body: JSON.stringify(payload),
    })

    const data = await wcResponse.json()

    if (!wcResponse.ok) {
      console.error('[Checkout API] WooCommerce error:', {
        status: wcResponse.status,
        code: data?.code,
        message: data?.message,
        fullError: JSON.stringify(data, null, 2),
      })
      // Return detailed error for debugging
      return NextResponse.json({
        ...data,
        _debug: {
          endpoint: fullUrl,
          status: wcResponse.status,
        }
      }, { status: wcResponse.status })
    }

    return buildResponse(wcResponse, data)
  } catch (error) {
    console.error('[Checkout API] Error:', error)
    return NextResponse.json(
      { error: 'Checkout operation failed' },
      { status: 500 }
    )
  }
}
