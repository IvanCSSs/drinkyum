/**
 * WooCommerce Store API Cart Client
 *
 * Handles shopping cart operations using WooCommerce's native Store API.
 * Uses Cart-Token (JWT) for session persistence across requests.
 *
 * API Docs: https://github.com/woocommerce/woocommerce/blob/trunk/plugins/woocommerce/src/StoreApi/docs/cart.md
 */

import { wpImageUrl } from './wordpress-images'

// Use local API proxy to avoid CORS issues with WooCommerce Store API
const CART_API_BASE = '/api/cart'

/**
 * Decode HTML entities in strings from WooCommerce
 * e.g., "Test &#8211; Product" → "Test – Product"
 */
function decodeHtmlEntities(text: string): string {
  if (typeof window === 'undefined') {
    // Server-side: use basic replacements for common entities
    return text
      .replace(/&#8211;/g, '\u2013')  // en-dash
      .replace(/&#8212;/g, '\u2014')  // em-dash
      .replace(/&#8216;/g, '\u2018')  // left single quote
      .replace(/&#8217;/g, '\u2019')  // right single quote
      .replace(/&#8220;/g, '\u201C')  // left double quote
      .replace(/&#8221;/g, '\u201D')  // right double quote
      .replace(/&#38;/g, '&')         // ampersand
      .replace(/&amp;/g, '&')
      .replace(/&#60;/g, '<')         // less than
      .replace(/&lt;/g, '<')
      .replace(/&#62;/g, '>')         // greater than
      .replace(/&gt;/g, '>')
      .replace(/&#39;/g, "'")         // apostrophe
      .replace(/&apos;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&nbsp;/g, ' ')
  }
  // Client-side: use DOM to decode all entities
  const doc = new DOMParser().parseFromString(text, 'text/html')
  return doc.documentElement.textContent || text
}

// Note: Cart sessions are now managed via cookies (not localStorage)
// The API route forwards cookies to/from CoCart
const CART_TOKEN_KEY = 'wc_cart_token' // kept for backwards compat, but cookies are primary
const CART_NONCE_KEY = 'wc_cart_nonce'

// Types matching WooCommerce Store API response

export interface WCStoreCartItem {
  key: string
  id: number
  quantity: number
  quantity_limits: {
    minimum: number
    maximum: number
    multiple_of: number
    editable: boolean
  }
  name: string
  short_description: string
  description: string
  sku: string
  low_stock_remaining: number | null
  backorders_allowed: boolean
  show_backorder_badge: boolean
  sold_individually: boolean
  permalink: string
  images: Array<{
    id: number
    src: string
    thumbnail: string
    srcset: string
    sizes: string
    name: string
    alt: string
  }>
  variation: Array<{
    attribute: string
    value: string
  }>
  item_data: Array<{
    key: string
    value: string
  }>
  prices: {
    price: string
    regular_price: string
    sale_price: string
    price_range: null | { min_amount: string; max_amount: string }
    currency_code: string
    currency_symbol: string
    currency_minor_unit: number
    currency_decimal_separator: string
    currency_thousand_separator: string
    currency_prefix: string
    currency_suffix: string
    raw_prices: {
      precision: number
      price: string
      regular_price: string
      sale_price: string
    }
  }
  totals: {
    line_subtotal: string
    line_subtotal_tax: string
    line_total: string
    line_total_tax: string
    currency_code: string
    currency_symbol: string
    currency_minor_unit: number
    currency_decimal_separator: string
    currency_thousand_separator: string
    currency_prefix: string
    currency_suffix: string
  }
  catalog_visibility: string
  extensions: Record<string, unknown>
}

export interface WCStoreCartTotals {
  total_items: string
  total_items_tax: string
  total_fees: string
  total_fees_tax: string
  total_discount: string
  total_discount_tax: string
  total_shipping: string | null
  total_shipping_tax: string | null
  total_price: string
  total_tax: string
  tax_lines: Array<{
    name: string
    price: string
    rate: string
  }>
  currency_code: string
  currency_symbol: string
  currency_minor_unit: number
  currency_decimal_separator: string
  currency_thousand_separator: string
  currency_prefix: string
  currency_suffix: string
}

export interface WCStoreCartAddress {
  first_name: string
  last_name: string
  company: string
  address_1: string
  address_2: string
  city: string
  state: string
  postcode: string
  country: string
  phone: string
  email?: string
}

export interface WCStoreCart {
  items: WCStoreCartItem[]
  coupons: Array<{
    code: string
    discount_type: string
    totals: {
      total_discount: string
      total_discount_tax: string
      currency_code: string
    }
  }>
  fees: Array<{
    id: string
    name: string
    totals: {
      total: string
      total_tax: string
    }
  }>
  totals: WCStoreCartTotals
  shipping_address: WCStoreCartAddress
  billing_address: WCStoreCartAddress & { email: string }
  needs_payment: boolean
  needs_shipping: boolean
  payment_requirements: string[]
  has_calculated_shipping: boolean
  shipping_rates: Array<{
    package_id: number
    name: string
    destination: WCStoreCartAddress
    items: Array<{ key: string; name: string; quantity: number }>
    shipping_rates: Array<{
      rate_id: string
      name: string
      description: string
      delivery_time: string
      price: string
      taxes: string
      instance_id: number
      method_id: string
      meta_data: Array<{ key: string; value: string }>
      selected: boolean
      currency_code: string
      currency_symbol: string
      currency_minor_unit: number
    }>
  }>
  items_count: number
  items_weight: number
  cross_sells: Array<{
    id: number
    name: string
    slug: string
    permalink: string
    images: Array<{ src: string; alt: string }>
    prices: {
      price: string
      currency_code: string
    }
  }>
  errors: Array<{
    code: string
    message: string
  }>
  payment_methods: string[]
  extensions: Record<string, unknown>
}

// Normalized cart types for the app (matching existing Medusa structure)
export interface CartItem {
  id: string // WC uses 'key' as the line item identifier
  cart_id: string
  variant_id: string
  quantity: number
  unit_price: number
  subtotal: number
  total: number
  title: string
  description?: string
  thumbnail?: string
  variant: {
    id: string
    title: string
    sku?: string
    product: {
      id: string
      title: string
      handle: string
    }
  }
  metadata?: Record<string, unknown>
  // Subscription info (if applicable)
  is_subscription?: boolean
  subscription_interval?: string // e.g., "month", "week"
  subscription_interval_count?: number // e.g., 1 for "every 1 month"
  subscription_discount?: number // discount percentage
}

export interface CartCoupon {
  code: string
  discount_type: string
  discount: number
  label: string
}

export interface ShippingRate {
  id: string
  name: string
  price: number
  currency: string
  method_id: string
  delivery_time?: string
  selected: boolean
}

export interface Cart {
  id: string
  email?: string
  customer_id?: string
  region_id: string
  currency_code: string
  items: CartItem[]
  coupons: CartCoupon[]
  subtotal: number
  discount_total: number
  shipping_total: number
  tax_total: number
  total: number
  shipping_address?: Address
  billing_address?: Address
  shipping_methods?: ShippingMethod[]
  available_shipping_rates: ShippingRate[]
  has_calculated_shipping: boolean
  needs_shipping: boolean
}

export interface Address {
  first_name: string
  last_name: string
  address_1: string
  address_2?: string
  city: string
  province: string
  postal_code: string
  country_code: string
  phone?: string
}

export interface ShippingMethod {
  id: string
  shipping_option_id: string
  price: number
}

/**
 * Get stored cart token from localStorage
 */
function getStoredCartToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(CART_TOKEN_KEY)
}

/**
 * Store cart token in localStorage
 */
function setStoredCartToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CART_TOKEN_KEY, token)
  }
}

/**
 * Get stored nonce from localStorage
 */
function getStoredNonce(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(CART_NONCE_KEY)
}

/**
 * Store nonce in localStorage
 */
function setStoredNonce(nonce: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CART_NONCE_KEY, nonce)
  }
}

/**
 * Clear stored cart data
 */
export function clearStoredCartId(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(CART_TOKEN_KEY)
    localStorage.removeItem(CART_NONCE_KEY)
  }
}

/**
 * Build headers for Store API requests
 */
function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }

  const cartToken = getStoredCartToken()
  if (cartToken) {
    headers['Cart-Token'] = cartToken
  }

  const nonce = getStoredNonce()
  if (nonce) {
    headers['Nonce'] = nonce
  }

  return headers
}

/**
 * Update stored tokens from response headers
 */
function updateTokensFromResponse(response: Response): void {
  const newToken = response.headers.get('Cart-Token')
  if (newToken) {
    setStoredCartToken(newToken)
  }

  const newNonce = response.headers.get('Nonce')
  if (newNonce) {
    setStoredNonce(newNonce)
  }
}

/**
 * Convert WooCommerce price string to number
 * WC Store API returns prices as strings in minor units (cents)
 */
function parsePrice(priceString: string, minorUnit: number = 2): number {
  const value = parseInt(priceString, 10)
  // Ensure minorUnit is valid (default to 2 for USD cents if 0/undefined)
  const effectiveMinorUnit = minorUnit || 2
  return value / Math.pow(10, effectiveMinorUnit)
}

/**
 * Transform WC Store API cart to normalized Cart format
 */
function transformCart(wcCart: WCStoreCart): Cart {
  const minorUnit = wcCart.totals.currency_minor_unit

  return {
    id: getStoredCartToken() || 'guest-cart',
    email: wcCart.billing_address.email || undefined,
    customer_id: undefined,
    region_id: 'default',
    currency_code: wcCart.totals.currency_code.toLowerCase(),
    items: wcCart.items.map((item) => {
      // Extract subscription info from item_data or extensions
      const itemData = item.item_data.reduce((acc, d) => {
        acc[d.key] = d.value
        return acc
      }, {} as Record<string, string>)

      // Check for subscription data in Store API extensions (subscribe-save namespace)
      const subscriptionData = item.extensions?.['subscribe-save'] as {
        is_subscription?: boolean
        period?: string
        interval?: number
        discount_percent?: number
      } | undefined

      const isSubscription = Boolean(
        subscriptionData?.is_subscription ||
        itemData['subscription_interval'] ||
        itemData['_subscription_interval'] ||
        itemData['subscribe_save_period'] ||
        itemData['subscribe_save_interval']
      )

      return {
        id: item.key,
        cart_id: getStoredCartToken() || 'guest-cart',
        variant_id: String(item.id),
        quantity: item.quantity,
        unit_price: parsePrice(item.prices.price, item.prices.currency_minor_unit),
        subtotal: parsePrice(item.totals.line_subtotal, item.totals.currency_minor_unit),
        total: parsePrice(item.totals.line_total, item.totals.currency_minor_unit),
        title: decodeHtmlEntities(item.name),
        description: item.short_description ? decodeHtmlEntities(item.short_description) : undefined,
        thumbnail: item.images[0] ? wpImageUrl(item.images[0].src) : undefined,
        variant: {
          id: String(item.id),
          title: item.variation.map((v) => decodeHtmlEntities(v.value)).join(' / ') || 'Default',
          sku: item.sku || undefined,
          product: {
            id: String(item.id),
            title: decodeHtmlEntities(item.name),
            handle: item.permalink.split('/').filter(Boolean).pop() || '',
          },
        },
        metadata: itemData as Record<string, unknown>,
        // Subscription info from Store API extensions or item_data
        is_subscription: isSubscription,
        subscription_interval: subscriptionData?.period ||
          itemData['subscription_interval'] ||
          itemData['_subscription_interval'] ||
          itemData['subscribe_save_period'] ||
          undefined,
        subscription_interval_count: subscriptionData?.interval ||
          (itemData['subscription_interval_count'] ? parseInt(itemData['subscription_interval_count'], 10) : undefined) ||
          (itemData['_subscription_interval_count'] ? parseInt(itemData['_subscription_interval_count'], 10) : undefined) ||
          (itemData['subscribe_save_interval'] ? parseInt(itemData['subscribe_save_interval'], 10) : undefined),
        subscription_discount: subscriptionData?.discount_percent ||
          (itemData['subscription_discount'] ? parseFloat(itemData['subscription_discount']) : undefined) ||
          (itemData['_subscription_discount'] ? parseFloat(itemData['_subscription_discount']) : undefined),
      }
    }),
    coupons: wcCart.coupons.map((coupon) => ({
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount: parsePrice(coupon.totals.total_discount, minorUnit),
      label: coupon.code.toUpperCase(),
    })),
    subtotal: parsePrice(wcCart.totals.total_items, minorUnit),
    discount_total: parsePrice(wcCart.totals.total_discount, minorUnit),
    shipping_total: wcCart.totals.total_shipping ? parsePrice(wcCart.totals.total_shipping, minorUnit) : 0,
    tax_total: parsePrice(wcCart.totals.total_tax, minorUnit),
    total: parsePrice(wcCart.totals.total_price, minorUnit),
    shipping_address: wcCart.shipping_address.address_1
      ? {
          first_name: wcCart.shipping_address.first_name,
          last_name: wcCart.shipping_address.last_name,
          address_1: wcCart.shipping_address.address_1,
          address_2: wcCart.shipping_address.address_2 || undefined,
          city: wcCart.shipping_address.city,
          province: wcCart.shipping_address.state,
          postal_code: wcCart.shipping_address.postcode,
          country_code: wcCart.shipping_address.country,
          phone: wcCart.shipping_address.phone || undefined,
        }
      : undefined,
    billing_address: wcCart.billing_address.address_1
      ? {
          first_name: wcCart.billing_address.first_name,
          last_name: wcCart.billing_address.last_name,
          address_1: wcCart.billing_address.address_1,
          address_2: wcCart.billing_address.address_2 || undefined,
          city: wcCart.billing_address.city,
          province: wcCart.billing_address.state,
          postal_code: wcCart.billing_address.postcode,
          country_code: wcCart.billing_address.country,
          phone: wcCart.billing_address.phone || undefined,
        }
      : undefined,
    shipping_methods: wcCart.shipping_rates.flatMap((pkg) =>
      pkg.shipping_rates
        .filter((rate) => rate.selected)
        .map((rate) => ({
          id: rate.rate_id,
          shipping_option_id: rate.method_id,
          price: parsePrice(rate.price, rate.currency_minor_unit),
        }))
    ),
    // All available shipping rates from WooCommerce
    available_shipping_rates: wcCart.shipping_rates.flatMap((pkg) =>
      pkg.shipping_rates.map((rate) => ({
        id: rate.rate_id,
        name: rate.name,
        price: parsePrice(rate.price, rate.currency_minor_unit),
        currency: rate.currency_code,
        method_id: rate.method_id,
        delivery_time: rate.delivery_time || undefined,
        selected: rate.selected,
      }))
    ),
    has_calculated_shipping: wcCart.has_calculated_shipping,
    needs_shipping: wcCart.needs_shipping,
  }
}

/**
 * Make a request to the local cart API proxy
 * The proxy handles communication with WooCommerce Store API
 */
async function cartApiRequest<T>(
  action: string | null,
  body?: Record<string, unknown>
): Promise<{ data: T; response: Response }> {
  const method = action ? 'POST' : 'GET'
  const requestBody = action ? { action, ...body } : undefined

  const response = await fetch(CART_API_BASE, {
    method,
    headers: getHeaders(),
    credentials: 'include', // Include cookies for session persistence
    body: requestBody ? JSON.stringify(requestBody) : undefined,
  })

  // Update tokens from response
  updateTokensFromResponse(response)

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(error.message || `HTTP ${response.status}`)
  }

  const data = await response.json()
  return { data, response }
}

/**
 * Get the current cart
 */
export async function getCart(): Promise<Cart | null> {
  try {
    const { data: wcCart } = await cartApiRequest<WCStoreCart>(null)
    return transformCart(wcCart)
  } catch (error) {
    console.error('Failed to get cart:', error)
    return null
  }
}

/**
 * Add item to cart
 *
 * @param productId - WooCommerce product ID
 * @param quantity - Quantity to add
 * @param variationId - Optional variation ID for variable products
 */
export async function addToCart(
  productId: string,
  quantity: number = 1,
  metadata?: Record<string, unknown>
): Promise<Cart> {
  const body: Record<string, unknown> = {
    id: parseInt(productId, 10),
    quantity,
  }

  // If metadata contains variation_id, use it
  if (metadata?.variation_id) {
    body.variation = [
      {
        attribute: 'pa_variation',
        value: String(metadata.variation_id),
      },
    ]
  }

  const { data: wcCart } = await cartApiRequest<WCStoreCart>('add-item', body)
  return transformCart(wcCart)
}

/**
 * Add subscription product to cart
 * Uses the WooCommerce Store API add-item endpoint with subscription parameters.
 * The Subscribe & Save plugin's woocommerce_add_cart_item_data filter
 * picks up subscribe_save_period and subscribe_save_interval from the request.
 *
 * @param productId - WooCommerce product ID
 * @param quantity - Quantity to add
 * @param period - Subscription period: "day", "week", "month", or "year"
 * @param interval - Interval count, e.g., 1 for "every month", 2 for "every 2 weeks"
 */
export async function addSubscriptionToCart(
  productId: string,
  quantity: number,
  period: string,
  interval: number = 1
): Promise<Cart> {
  const { data: wcCart } = await cartApiRequest<WCStoreCart>('add-subscription', {
    id: parseInt(productId, 10),
    quantity,
    subscribe_save_period: period,
    subscribe_save_interval: interval,
  })
  return transformCart(wcCart)
}

/**
 * Update cart item quantity
 *
 * @param lineItemKey - The cart item key (32-char string)
 * @param quantity - New quantity
 */
export async function updateCartItem(lineItemKey: string, quantity: number): Promise<Cart> {
  const { data: wcCart } = await cartApiRequest<WCStoreCart>('update-item', {
    key: lineItemKey,
    quantity,
  })
  return transformCart(wcCart)
}

/**
 * Remove item from cart
 *
 * @param lineItemKey - The cart item key to remove
 */
export async function removeCartItem(lineItemKey: string): Promise<Cart> {
  const { data: wcCart } = await cartApiRequest<WCStoreCart>('remove-item', {
    key: lineItemKey,
  })
  return transformCart(wcCart)
}

/**
 * Update cart customer data (email, addresses)
 */
export async function updateCart(data: {
  email?: string
  shipping_address?: Address
  billing_address?: Address
}): Promise<Cart> {
  const body: Record<string, unknown> = {}

  if (data.billing_address || data.email) {
    body.billing_address = {
      first_name: data.billing_address?.first_name || '',
      last_name: data.billing_address?.last_name || '',
      address_1: data.billing_address?.address_1 || '',
      address_2: data.billing_address?.address_2 || '',
      city: data.billing_address?.city || '',
      state: data.billing_address?.province || '',
      postcode: data.billing_address?.postal_code || '',
      country: data.billing_address?.country_code || 'US',
      email: data.email || '',
      phone: data.billing_address?.phone || '',
    }
  }

  if (data.shipping_address) {
    body.shipping_address = {
      first_name: data.shipping_address.first_name,
      last_name: data.shipping_address.last_name,
      address_1: data.shipping_address.address_1,
      address_2: data.shipping_address.address_2 || '',
      city: data.shipping_address.city,
      state: data.shipping_address.province,
      postcode: data.shipping_address.postal_code,
      country: data.shipping_address.country_code,
      phone: data.shipping_address.phone || '',
    }
  }

  const { data: wcCart } = await cartApiRequest<WCStoreCart>('update-customer', body)
  return transformCart(wcCart)
}

/**
 * Apply coupon code to cart
 */
export async function applyCoupon(code: string): Promise<Cart> {
  const { data: wcCart } = await cartApiRequest<WCStoreCart>('apply-coupon', {
    code,
  })
  return transformCart(wcCart)
}

/**
 * Remove coupon from cart
 */
export async function removeCoupon(code: string): Promise<Cart> {
  const { data: wcCart } = await cartApiRequest<WCStoreCart>('remove-coupon', {
    code,
  })
  return transformCart(wcCart)
}

/**
 * Select shipping rate
 */
export async function selectShippingRate(rateId: string, packageId: number = 0): Promise<Cart> {
  const { data: wcCart } = await cartApiRequest<WCStoreCart>('select-shipping-rate', {
    rate_id: rateId,
    package_id: packageId,
  })
  return transformCart(wcCart)
}

/**
 * Clear the server-side cart (CoCart session)
 */
export async function clearServerCart(): Promise<void> {
  try {
    await cartApiRequest<unknown>('clear-cart', {})
  } catch {
    // Best-effort — don't block checkout flow if clear fails
  }
}

/**
 * Get cart item count
 */
export async function getCartItemCount(): Promise<number> {
  const cart = await getCart()
  if (!cart) return 0
  return cart.items.reduce((sum, item) => sum + item.quantity, 0)
}

/**
 * Get or create a cart
 * WooCommerce Store API automatically creates a cart on first request
 */
export async function getOrCreateCart(): Promise<string> {
  const cart = await getCart()
  return cart?.id || 'guest-cart'
}
