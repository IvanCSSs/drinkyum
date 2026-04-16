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

/**
 * Merge Store API subscription extension data into transformed CoCart data.
 * CoCart doesn't expose WC session data like subscribe_save, but the Store API does
 * via the registered 'subscribe-save' endpoint extension.
 */
/**
 * Single Store API fetch that merges both subscription extensions and shipping rates.
 * Replaces the previous separate mergeStoreApiData + mergeShippingRates calls.
 */
async function mergeStoreApiData(wcFormatData: WCStoreCartFormat, request: NextRequest): Promise<WCStoreCartFormat> {
  try {
    const storeCartUrl = buildWpApiUrl('/wc/store/v1/cart')
    const resp = await fetch(storeCartUrl, {
      method: 'GET',
      headers: getForwardHeaders(request),
    })
    if (!resp.ok) return wcFormatData

    const storeCart = await resp.json()

    // --- Merge subscription extensions ---
    if (storeCart.items && Array.isArray(storeCart.items)) {
      const extensionsByProductId = new Map<number, Record<string, unknown>>()
      for (const item of storeCart.items) {
        if (item.extensions?.['subscribe-save']?.is_subscription) {
          extensionsByProductId.set(item.id, item.extensions)
        }
      }

      if (extensionsByProductId.size > 0 && Array.isArray(wcFormatData.items)) {
        for (const item of wcFormatData.items as Array<Record<string, unknown>>) {
          const productId = item.id as number
          const storeExt = extensionsByProductId.get(productId)
          if (storeExt) {
            item.extensions = storeExt
            const ssData = storeExt['subscribe-save'] as Record<string, unknown>
            const existingItemData = (item.item_data || []) as Array<{key: string, value: string}>
            existingItemData.push(
              { key: 'subscribe_save_period', value: String(ssData.period || '') },
              { key: 'subscribe_save_interval', value: String(ssData.interval || '1') },
              { key: 'subscribe_save_discount', value: String(ssData.discount_percent || '0') },
            )
            item.item_data = existingItemData
            const storeItem = storeCart.items.find((si: Record<string, unknown>) => si.id === productId)
            if (storeItem?.prices) {
              item.prices = storeItem.prices
            }
          }
        }
      }
    }

    // --- Merge shipping rates ---
    if (storeCart.shipping_rates && Array.isArray(storeCart.shipping_rates)) {
      wcFormatData.shipping_rates = storeCart.shipping_rates
      wcFormatData.has_calculated_shipping = storeCart.has_calculated_shipping || wcFormatData.has_calculated_shipping
      if (storeCart.totals?.total_shipping) {
        const totals = wcFormatData.totals as Record<string, unknown>
        totals.total_shipping = storeCart.totals.total_shipping
        totals.currency_minor_unit = storeCart.totals.currency_minor_unit || 2
      }
    }

    return wcFormatData
  } catch (e) {
    console.error('[Cart API] Failed to merge Store API data:', e)
    return wcFormatData
  }
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
    has_calculated_shipping: !!coCartData.shipping?.has_calculated_shipping || 
      !!(coCartData.customer?.shipping_address?.shipping_address_1) ||
      parseFloat(coCartData.totals?.shipping_total || '0') > 0,
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
    let wcFormatData = transformCoCartToWCFormat(coCartData)

    // Merge subscription extensions + shipping rates from WC Store API in one fetch
    wcFormatData = await mergeStoreApiData(wcFormatData, request)

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
        endpoint = '/cart/add-item'
        // CoCart uses 'id' and 'quantity' directly
        requestBody = {
          id: String(payload.id),
          quantity: String(payload.quantity || 1),
        }
        break

      case 'add-subscription': {
        // Use Subscribe & Save REST endpoint (CoCart doesn't trigger WC subscription hooks)
        const ssUrl = buildWpApiUrl('/subscribe-save/v1/add-to-cart')
        const ssResp = await fetch(ssUrl, {
          method: 'POST',
          headers: getForwardHeaders(request),
          credentials: 'include',
          body: JSON.stringify({
            product_id: parseInt(String(payload.id), 10),
            quantity: parseInt(String(payload.quantity || 1), 10),
            subscribe_save_period: payload.subscribe_save_period,
            subscribe_save_interval: payload.subscribe_save_interval || 1,
          }),
        })
        const ssData = await ssResp.json()
        if (ssData.code || !ssData.success) {
          return buildResponse(ssResp, ssData, ssResp.status)
        }
        // Subscription added — now fetch the full cart via CoCart to return normalized format
        const cartAfterSs = await fetch(getCoCartUrl('/cart'), {
          method: 'GET',
          headers: getForwardHeaders(request),
          credentials: 'include',
        })
        const coCartAfterSs = await cartAfterSs.json()
        if (coCartAfterSs.code) {
          return buildResponse(cartAfterSs, coCartAfterSs, cartAfterSs.status)
        }
        const wcFormatAfterSs = transformCoCartToWCFormat(coCartAfterSs)
        // Merge Store API subscription extensions into the transformed cart
        const mergedCart = await mergeStoreApiData(wcFormatAfterSs, request)
        return buildResponse(cartAfterSs, mergedCart, cartAfterSs.status)
      }
        
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

        // Custom coupon endpoint can return sparse/partial cart payloads.
        // Re-fetch the full CoCart cart so the frontend transform always gets
        // a complete billing_address/customer shape.
        const cartAfterCoupon = await fetch(getCoCartUrl('/cart'), {
          method: 'GET',
          headers: getForwardHeaders(request),
          credentials: 'include',
        })
        const coCartAfterCoupon = await cartAfterCoupon.json()
        if (coCartAfterCoupon.code) {
          return buildResponse(cartAfterCoupon, coCartAfterCoupon, cartAfterCoupon.status)
        }
        let wcFormatAfterCoupon = transformCoCartToWCFormat(coCartAfterCoupon)
        wcFormatAfterCoupon = await mergeStoreApiData(wcFormatAfterCoupon, request)
        return buildResponse(cartAfterCoupon, wcFormatAfterCoupon, cartAfterCoupon.status)
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
        // Re-fetch full CoCart cart so billing_address and all fields are present
        const cartAfterRemove = await fetch(getCoCartUrl('/cart'), {
          method: 'GET',
          headers: getForwardHeaders(request),
          credentials: 'include',
        })
        const coCartAfterRemove = await cartAfterRemove.json()
        if (coCartAfterRemove.code) {
          return buildResponse(cartAfterRemove, coCartAfterRemove, cartAfterRemove.status)
        }
        let wcFormatAfterRemove = transformCoCartToWCFormat(coCartAfterRemove)
        wcFormatAfterRemove = await mergeStoreApiData(wcFormatAfterRemove, request)
        return buildResponse(cartAfterRemove, wcFormatAfterRemove, cartAfterRemove.status)
      }
        
      case 'clear-cart':
        endpoint = '/cart/clear'
        requestBody = {}
        break

      case 'select-shipping-rate': {
        // Set the shipping method via CoCart, then re-fetch full cart with shipping_rates
        const shippingResp = await fetch(getCoCartUrl('/cart/shipping-method'), {
          method: 'POST',
          headers: getForwardHeaders(request),
          credentials: 'include',
          body: JSON.stringify({ rate_id: payload.rate_id, package_id: payload.package_id || 0 }),
        })
        const shippingData = await shippingResp.json()
        if (shippingData.code) {
          return buildResponse(shippingResp, shippingData, shippingResp.status)
        }
        // Re-fetch full cart so shipping_total and shipping_rates are updated
        const cartAfterShipping = await fetch(getCoCartUrl('/cart'), {
          method: 'GET',
          headers: getForwardHeaders(request),
          credentials: 'include',
        })
        const coCartAfterShipping = await cartAfterShipping.json()
        if (coCartAfterShipping.code) {
          return buildResponse(cartAfterShipping, coCartAfterShipping, cartAfterShipping.status)
        }
        let wcFormatAfterShipping = transformCoCartToWCFormat(coCartAfterShipping)
        wcFormatAfterShipping = await mergeStoreApiData(wcFormatAfterShipping, request)
        return buildResponse(cartAfterShipping, wcFormatAfterShipping, cartAfterShipping.status)
      }
        
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
