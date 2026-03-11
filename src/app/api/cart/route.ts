import { buildWpApiUrl } from "@/lib/wp-api-url"
/**
 * Cart API proxy route
 *
 * Proxies cart requests to CoCart API (not WC Store API)
 * Uses cookies for session persistence (CoCart ignores Cart-Token headers)
 *
 * GET /api/cart - Get current cart
 * POST /api/cart - Various cart operations (add, update, remove)
 */

import { NextRequest, NextResponse } from 'next/server'

// Using buildWpApiUrl for compatibility
function getCoCartUrl(path: string) { return buildWpApiUrl(`/cocart/v2${path}`) }

// Forward cookies from client to WooCommerce
function getForwardHeaders(request: NextRequest): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }

  // Forward cookies for session persistence (this is what CoCart actually uses)
  const cookie = request.headers.get('Cookie')
  if (cookie) {
    headers['Cookie'] = cookie
  }

  return headers
}

// Transform CoCart response to WC Store API format (so wc-cart.ts doesn't need changes)
function transformCoCartToWCFormat(coCartData: CoCartResponse): WCStoreCartFormat {
  const items = coCartData.items || []
  
  return {
    items: items.map((item: CoCartItem) => {
      // Handle quantity being either a number or an object
      const qty = typeof item.quantity === 'number' 
        ? item.quantity 
        : (item.quantity?.value || 1)
      const qtyMin = typeof item.quantity === 'object' ? (item.quantity?.min_purchase || 1) : 1
      const qtyMax = typeof item.quantity === 'object' ? (item.quantity?.max_purchase || -1) : -1
      
      return {
      key: item.item_key,
      id: item.id,
      quantity: qty,
      quantity_limits: {
        minimum: qtyMin,
        maximum: qtyMax,
        multiple_of: 1,
        editable: true,
      },
      name: item.name || item.title || '',
      short_description: '',
      description: '',
      sku: item.meta?.sku || '',
      low_stock_remaining: null,
      backorders_allowed: false,
      show_backorder_badge: false,
      sold_individually: false,
      permalink: `/products/${item.slug || ''}`,
      images: item.featured_image ? [{
        id: 0,
        src: item.featured_image,
        thumbnail: item.featured_image,
        srcset: '',
        sizes: '',
        name: item.name || '',
        alt: item.name || '',
      }] : [],
      variation: [],
      item_data: Object.entries(item.cart_item_data || {}).map(([key, value]) => ({
        key,
        value: String(value),
      })),
      prices: {
        // CoCart v2 returns prices in cents (3699 = $36.99), no conversion needed
        price: String(item.price || '0'),
        regular_price: String(item.price || '0'),
        sale_price: String(item.price || '0'),
        price_range: null,
        currency_code: coCartData.currency?.currency_code || 'USD',
        currency_symbol: coCartData.currency?.currency_symbol || '$',
        currency_minor_unit: 2,
        currency_decimal_separator: '.',
        currency_thousand_separator: ',',
        currency_prefix: '$',
        currency_suffix: '',
        raw_prices: {
          precision: 2,
          // CoCart v2 returns prices in cents already (3699 = $36.99)
          price: String(item.price || '0'),
          regular_price: String(item.price || '0'),
          sale_price: String(item.price || '0'),
        },
      },
      totals: {
        line_subtotal: String(item.totals?.subtotal || 0),
        line_subtotal_tax: String(item.totals?.subtotal_tax || 0),
        // CoCart v2 returns totals in cents already
        line_total: String(item.totals?.total || 0),
        line_total_tax: String(item.totals?.tax || 0),
        currency_code: coCartData.currency?.currency_code || 'USD',
        currency_symbol: coCartData.currency?.currency_symbol || '$',
        currency_minor_unit: 2,
        currency_decimal_separator: '.',
        currency_thousand_separator: ',',
        currency_prefix: '$',
        currency_suffix: '',
      },
      catalog_visibility: 'visible',
      extensions: item.cart_item_data || {},
    }}),
    coupons: (coCartData.coupons || []).map((coupon: CoCartCoupon) => ({
      code: coupon.coupon,
      discount_type: coupon.discount_type || 'fixed_cart',
      totals: {
        // CoCart v2 returns discount in cents already
        total_discount: String(coupon.saving || 0),
        total_discount_tax: '0',
        currency_code: coCartData.currency?.currency_code || 'USD',
      },
    })),
    fees: [],
    totals: {
      total_items: String(Math.round(parseFloat(coCartData.totals?.subtotal || '0'))),
      total_items_tax: '0',
      total_fees: '0',
      total_fees_tax: '0',
      total_discount: String(Math.round(parseFloat(coCartData.totals?.discount_total || '0'))),
      total_discount_tax: '0',
      total_shipping: coCartData.totals?.shipping_total || '0',
      total_shipping_tax: '0',
      total_price: String(Math.round(parseFloat(coCartData.totals?.total || '0'))),
      total_tax: '0',
      tax_lines: [],
      currency_code: coCartData.currency?.currency_code || 'USD',
      currency_symbol: coCartData.currency?.currency_symbol || '$',
      currency_minor_unit: 2,
      currency_decimal_separator: '.',
      currency_thousand_separator: ',',
      currency_prefix: '$',
      currency_suffix: '',
    },
    shipping_address: {
      first_name: coCartData.customer?.shipping_address?.shipping_first_name || '',
      last_name: coCartData.customer?.shipping_address?.shipping_last_name || '',
      company: '',
      address_1: coCartData.customer?.shipping_address?.shipping_address_1 || '',
      address_2: coCartData.customer?.shipping_address?.shipping_address_2 || '',
      city: coCartData.customer?.shipping_address?.shipping_city || '',
      state: coCartData.customer?.shipping_address?.shipping_state || '',
      postcode: coCartData.customer?.shipping_address?.shipping_postcode || '',
      country: coCartData.customer?.shipping_address?.shipping_country || 'US',
      phone: '',
    },
    billing_address: {
      first_name: coCartData.customer?.billing_address?.billing_first_name || '',
      last_name: coCartData.customer?.billing_address?.billing_last_name || '',
      company: '',
      address_1: coCartData.customer?.billing_address?.billing_address_1 || '',
      address_2: coCartData.customer?.billing_address?.billing_address_2 || '',
      city: coCartData.customer?.billing_address?.billing_city || '',
      state: coCartData.customer?.billing_address?.billing_state || '',
      postcode: coCartData.customer?.billing_address?.billing_postcode || '',
      country: coCartData.customer?.billing_address?.billing_country || 'US',
      phone: coCartData.customer?.billing_address?.billing_phone || '',
      email: coCartData.customer?.billing_address?.billing_email || '',
    },
    needs_payment: parseFloat(coCartData.totals?.total || '0') > 0,
    needs_shipping: (coCartData.items || []).length > 0,
    payment_requirements: ['products'],
    has_calculated_shipping: !!coCartData.shipping?.has_calculated_shipping,
    shipping_rates: [],
    items_count: (coCartData.items || []).reduce((sum: number, item: CoCartItem) => 
      sum + (typeof item.quantity === 'number' ? item.quantity : (item.quantity?.value || 1)), 0),
    items_weight: 0,
    cross_sells: [],
    errors: [],
    payment_methods: [],
    extensions: {},
  }
}

// Copy response headers from WooCommerce to our response (especially Set-Cookie)
function buildResponse(wcResponse: Response, data: unknown, status: number = 200): NextResponse {
  const response = NextResponse.json(data, { status })

  // Forward Set-Cookie headers from WooCommerce (critical for session persistence!)
  const setCookieHeaders = wcResponse.headers.getSetCookie()
  setCookieHeaders.forEach(cookie => {
    // Modify cookie to work with the frontend domain
    // Remove Domain attribute to let browser set it automatically
    const modifiedCookie = cookie
      .replace(/Domain=[^;]+;?\s*/gi, '')
      .replace(/Path=[^;]+/gi, 'Path=/')
    response.headers.append('Set-Cookie', modifiedCookie)
  })

  // Also keep Cart-Token and Nonce for backwards compatibility
  const cartToken = wcResponse.headers.get('Cart-Token')
  if (cartToken) {
    response.headers.set('Cart-Token', cartToken)
  }
  const nonce = wcResponse.headers.get('Nonce')
  if (nonce) {
    response.headers.set('Nonce', nonce)
  }

  response.headers.set('Access-Control-Expose-Headers', 'Cart-Token, Nonce, Set-Cookie')

  return response
}

// CoCart types (simplified)
interface CoCartItem {
  item_key: string
  id: number
  name?: string
  title?: string
  slug?: string
  price?: string
  quantity?: { value: number; min_purchase?: number; max_purchase?: number } | number
  totals?: { subtotal?: number; subtotal_tax?: number; total?: number; tax?: number }
  meta?: { sku?: string }
  featured_image?: string
  cart_item_data?: Record<string, unknown>
}

interface CoCartCoupon {
  coupon: string
  discount_type?: string
  saving?: number
}

interface CoCartResponse {
  cart_key?: string
  items?: CoCartItem[]
  coupons?: CoCartCoupon[]
  totals?: {
    subtotal?: string
    discount_total?: string
    shipping_total?: string
    total?: string
  }
  currency?: {
    currency_code?: string
    currency_symbol?: string
  }
  customer?: {
    billing_address?: Record<string, string>
    shipping_address?: Record<string, string>
  }
  shipping?: {
    has_calculated_shipping?: boolean
  }
}

interface WCStoreCartFormat {
  items: unknown[]
  coupons: unknown[]
  fees: unknown[]
  totals: unknown
  shipping_address: unknown
  billing_address: unknown
  needs_payment: boolean
  needs_shipping: boolean
  payment_requirements: string[]
  has_calculated_shipping: boolean
  shipping_rates: unknown[]
  items_count: number
  items_weight: number
  cross_sells: unknown[]
  errors: unknown[]
  payment_methods: string[]
  extensions: Record<string, unknown>
}

// Fetch a WC Store API nonce+cart-token (needed for checkout)
async function fetchStoreApiNonce(request: NextRequest): Promise<{ nonce?: string; cartToken?: string }> {
  try {
    const storeCartUrl = buildWpApiUrl('/wc/store/v1/cart')
    const resp = await fetch(storeCartUrl, {
      method: 'GET',
      headers: getForwardHeaders(request),
    })
    return {
      nonce: resp.headers.get('Nonce') || undefined,
      cartToken: resp.headers.get('Cart-Token') || undefined,
    }
  } catch {
    return {}
  }
}

export async function GET(request: NextRequest) {
  try {
    // Fetch CoCart data and WC Store API nonce in parallel
    const [wcResponse, storeNonce] = await Promise.all([
      fetch(getCoCartUrl("/cart"), {
        method: 'GET',
        headers: getForwardHeaders(request),
        credentials: 'include',
      }),
      fetchStoreApiNonce(request),
    ])

    const coCartData = await wcResponse.json()
    
    // Check if it's an error response
    if (coCartData.code) {
      return buildResponse(wcResponse, coCartData, wcResponse.status)
    }

    // Transform CoCart response to WC Store API format
    const wcFormatData = transformCoCartToWCFormat(coCartData)
    
    // Build response and inject WC Store API nonce so checkout works
    const response = buildResponse(wcResponse, wcFormatData, wcResponse.status)
    if (storeNonce.nonce) {
      response.headers.set('Nonce', storeNonce.nonce)
    }
    // Do NOT set Cart-Token from WC Store API — it's a different session than CoCart
    // CoCart uses cookies for session, WC Store API uses Cart-Token JWT
    // Setting a Store API Cart-Token would create an empty cart session
    return response
  } catch (error) {
    console.error('[Cart API] Error fetching cart:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...payload } = body

    let endpoint = '/cart'
    let method = 'POST'
    let requestBody: Record<string, unknown> = payload

    switch (action) {
      case 'add-item':
      case 'add-subscription':
        endpoint = '/cart/add-item'
        // CoCart uses 'id' and 'quantity' directly
        requestBody = {
          id: String(payload.id),
          quantity: String(payload.quantity || 1),
        }
        // Include subscription data in cart_item_data if present
        if (payload.subscribe_save_period) {
          requestBody.cart_item_data = {
            subscribe_save_period: payload.subscribe_save_period,
            subscribe_save_interval: payload.subscribe_save_interval || 1,
          }
        }
        break
        
      case 'update-item':
        // CoCart uses POST to /cart/item/{item_key} with quantity param
        endpoint = `/cart/item/${payload.key}`
        requestBody = { quantity: String(payload.quantity) }
        break
        
      case 'remove-item':
        // CoCart uses DELETE to /cart/item/{item_key}
        endpoint = `/cart/item/${payload.key}`
        method = 'DELETE'
        requestBody = {}
        break
        
      case 'update-customer':
        // CoCart uses /cart/update for customer data
        endpoint = '/cart/update'
        requestBody = {
          billing_address: payload.billing_address,
          shipping_address: payload.shipping_address,
        }
        break
        
      case 'apply-coupon': {
        // Use custom mu-plugin endpoint (CoCart has no coupon support)
        const applyUrl = buildWpApiUrl('/store/v1/cart/coupon')
        const applyResp = await fetch(applyUrl, {
          method: 'POST',
          headers: getForwardHeaders(request),
          credentials: 'include',
          body: JSON.stringify({ code: payload.code }),
        })
        const applyData = await applyResp.json()
        if (applyData.code) {
          return buildResponse(applyResp, applyData, applyResp.status)
        }
        return buildResponse(applyResp, applyData, applyResp.status)
      }
        
      case 'remove-coupon': {
        // Use custom mu-plugin endpoint
        const removeUrl = buildWpApiUrl(`/store/v1/cart/coupon/${payload.code}`)
        const removeResp = await fetch(removeUrl, {
          method: 'DELETE',
          headers: getForwardHeaders(request),
          credentials: 'include',
        })
        const removeData = await removeResp.json()
        if (removeData.code) {
          return buildResponse(removeResp, removeData, removeResp.status)
        }
        return buildResponse(removeResp, removeData, removeResp.status)
      }
        
      case 'select-shipping-rate':
        endpoint = '/cart/shipping-method'
        requestBody = {
          rate_id: payload.rate_id,
          package_id: payload.package_id || 0,
        }
        break
        
      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }

    const wcResponse = await fetch(getCoCartUrl(endpoint), {
      method,
      headers: getForwardHeaders(request),
      credentials: 'include',
      body: method !== 'DELETE' || Object.keys(requestBody).length > 0 
        ? JSON.stringify(requestBody) 
        : undefined,
    })

    const coCartData = await wcResponse.json()

    // Check if it's an error response
    if (coCartData.code) {
      return buildResponse(wcResponse, coCartData, wcResponse.status)
    }

    // Transform CoCart response to WC Store API format
    const wcFormatData = transformCoCartToWCFormat(coCartData)

    return buildResponse(wcResponse, wcFormatData, wcResponse.status)
  } catch (error) {
    console.error('[Cart API] Error:', error)
    return NextResponse.json(
      { error: 'Cart operation failed' },
      { status: 500 }
    )
  }
}
