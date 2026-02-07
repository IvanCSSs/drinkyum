/**
 * WooCommerce Store API Checkout Client
 *
 * Handles checkout operations using WooCommerce's native Store API.
 * Uses local API proxy to avoid CORS issues.
 *
 * API Docs: https://github.com/woocommerce/woocommerce/blob/trunk/plugins/woocommerce/src/StoreApi/docs/checkout.md
 */

import type { Cart, Address, WCStoreCart } from './wc-cart'

// Use local API proxy to avoid CORS issues
const CHECKOUT_API_BASE = '/api/checkout'

const CART_TOKEN_KEY = 'wc_cart_token'
const CART_NONCE_KEY = 'wc_cart_nonce'

// ============================================
// Types
// ============================================

export interface WCBillingAddress {
  first_name: string
  last_name: string
  company?: string
  address_1: string
  address_2?: string
  city: string
  state: string
  postcode: string
  country: string
  email: string
  phone?: string
}

export interface WCShippingAddress {
  first_name: string
  last_name: string
  company?: string
  address_1: string
  address_2?: string
  city: string
  state: string
  postcode: string
  country: string
  phone?: string
}

export interface WCShippingRate {
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
}

export interface WCShippingPackage {
  package_id: number
  name: string
  destination: WCShippingAddress
  items: Array<{ key: string; name: string; quantity: number }>
  shipping_rates: WCShippingRate[]
}

export interface PaymentGateway {
  id: string
  title: string
  description: string
  order: number
  enabled: boolean
  method_title: string
  method_description: string
  settings: Record<string, unknown>
  needs_setup: boolean
  supports: string[]
}

export interface WCCheckoutResponse {
  order_id: number
  status: string
  order_key: string
  customer_note: string
  customer_id: number
  billing_address: WCBillingAddress
  shipping_address: WCShippingAddress
  payment_method: string
  payment_result?: {
    payment_status: 'success' | 'failure' | 'pending' | 'error'
    payment_details?: Array<{ key: string; value: string }>
    redirect_url?: string
  }
}

export interface CheckoutOrder {
  id: string
  display_id: number
  status: string
  email: string
  currency_code: string
  total: number
  shipping_total: number
  tax_total: number
  discount_total: number
  items: Array<{
    id: string
    title: string
    quantity: number
    unit_price: number
    total: number
  }>
  shipping_address?: Address
  billing_address?: Address
}

// Normalized shipping rate for the frontend
export interface ShippingRate {
  id: string
  carrier: string
  service: string
  rate: number
  currency: string
  delivery_days?: number
  delivery_date?: string
  est_delivery_days?: number
}

// ============================================
// Helper Functions
// ============================================

function getStoredCartToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(CART_TOKEN_KEY)
}

function getStoredNonce(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(CART_NONCE_KEY)
}

function setStoredCartToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CART_TOKEN_KEY, token)
  }
}

function setStoredNonce(nonce: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CART_NONCE_KEY, nonce)
  }
}

export function clearStoredCartId(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(CART_TOKEN_KEY)
    localStorage.removeItem(CART_NONCE_KEY)
  }
}

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

  // Add tracking headers for server-side analytics (GA4 MP + Meta CAPI)
  if (typeof window !== 'undefined') {
    // Import tracker dynamically to avoid SSR issues
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { tracker } = require('@/lib/tracker')
      const trackingHeaders = tracker.getTrackingHeaders()
      Object.assign(headers, trackingHeaders)
      // Generate event ID for dedup
      headers['X-Event-ID'] = crypto.randomUUID()
    } catch {
      // Tracker not available, continue without tracking headers
    }
  }

  return headers
}

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

function parsePrice(priceString: string, minorUnit: number = 2): number {
  const value = parseInt(priceString, 10)
  return value / Math.pow(10, minorUnit)
}

/**
 * Make a request to the checkout API proxy
 */
async function checkoutApiRequest<T>(
  action: string | null,
  body?: Record<string, unknown>
): Promise<{ data: T; response: Response }> {
  const method = action ? 'POST' : 'GET'
  const requestBody = action ? { action, ...body } : undefined

  const response = await fetch(CHECKOUT_API_BASE, {
    method,
    headers: getHeaders(),
    body: requestBody ? JSON.stringify(requestBody) : undefined,
  })

  updateTokensFromResponse(response)

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(error.message || `HTTP ${response.status}`)
  }

  const data = await response.json()
  return { data, response }
}

// ============================================
// Checkout Functions
// ============================================

/**
 * Update checkout email
 */
export async function updateCheckoutEmail(email: string): Promise<Cart> {
  const { data } = await checkoutApiRequest<WCStoreCart>('update-customer', {
    billing_address: { email },
  })

  // Transform to normalized Cart format
  return transformCart(data)
}

/**
 * Update shipping address
 */
export async function updateShippingAddress(address: Address): Promise<Cart> {
  const wcAddress: WCShippingAddress = {
    first_name: address.first_name,
    last_name: address.last_name,
    address_1: address.address_1,
    address_2: address.address_2 || '',
    city: address.city,
    state: address.province,
    postcode: address.postal_code,
    country: address.country_code.toUpperCase(),
    phone: address.phone || '',
  }

  const { data } = await checkoutApiRequest<WCStoreCart>('update-customer', {
    shipping_address: wcAddress,
  })

  return transformCart(data)
}

/**
 * Update billing address
 */
export async function updateBillingAddress(address: Address & { email?: string }): Promise<Cart> {
  const wcAddress: WCBillingAddress = {
    first_name: address.first_name,
    last_name: address.last_name,
    address_1: address.address_1,
    address_2: address.address_2 || '',
    city: address.city,
    state: address.province,
    postcode: address.postal_code,
    country: address.country_code.toUpperCase(),
    email: address.email || '',
    phone: address.phone || '',
  }

  const { data } = await checkoutApiRequest<WCStoreCart>('update-customer', {
    billing_address: wcAddress,
  })

  return transformCart(data)
}

/**
 * Get available shipping rates from WooCommerce
 * Returns shipping rates based on cart contents and shipping address
 */
export async function getShippingRates(params: {
  ship_to: {
    name?: string
    street1: string
    street2?: string
    city: string
    state: string
    zip: string
    country?: string
  }
  order_subtotal?: number
}): Promise<{ rates: ShippingRate[]; rules_applied: boolean }> {
  // First update the shipping address to get calculated rates
  const wcAddress: WCShippingAddress = {
    first_name: params.ship_to.name?.split(' ')[0] || '',
    last_name: params.ship_to.name?.split(' ').slice(1).join(' ') || '',
    address_1: params.ship_to.street1,
    address_2: params.ship_to.street2 || '',
    city: params.ship_to.city,
    state: params.ship_to.state,
    postcode: params.ship_to.zip,
    country: params.ship_to.country || 'US',
  }

  const { data: cart } = await checkoutApiRequest<WCStoreCart>('update-customer', {
    shipping_address: wcAddress,
  })

  // Extract shipping rates from cart
  const rates: ShippingRate[] = []

  for (const pkg of cart.shipping_rates || []) {
    for (const rate of pkg.shipping_rates || []) {
      rates.push({
        id: rate.rate_id,
        carrier: rate.method_id,
        service: rate.name,
        rate: parsePrice(rate.price, rate.currency_minor_unit),
        currency: rate.currency_code,
        delivery_days: rate.delivery_time ? parseInt(rate.delivery_time) : undefined,
      })
    }
  }

  return {
    rates,
    rules_applied: false, // WooCommerce handles this internally
  }
}

/**
 * Select a shipping rate
 */
export async function selectShippingRate(rateId: string, packageId: number = 0): Promise<Cart> {
  const { data } = await checkoutApiRequest<WCStoreCart>('select-shipping-rate', {
    rate_id: rateId,
    package_id: packageId,
  })

  return transformCart(data)
}

/**
 * Get available payment gateways
 */
export async function getPaymentGateways(): Promise<PaymentGateway[]> {
  const { data } = await checkoutApiRequest<PaymentGateway[]>('get-payment-gateways')
  return data
}

/**
 * Payment configuration response from WordPress
 */
export interface PaymentConfigResponse {
  configured: boolean
  provider?: string
  enabledProviders?: string[]
  // Authorize.net
  apiLoginId?: string
  clientKey?: string
  // Stripe
  publishableKey?: string
  // Common
  sandbox?: boolean
  message?: string
}

/**
 * Get payment configuration (for frontend)
 * Calls our API proxy which forwards to WordPress REST API
 */
export async function getPaymentConfig(): Promise<PaymentConfigResponse> {
  try {
    // Use local API proxy to avoid CORS issues
    const response = await fetch('/api/payment-config')

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const config = await response.json()
    return config
  } catch (error) {
    console.error('Failed to get payment config:', error)
    return {
      configured: false,
      enabledProviders: [],
    }
  }
}

/**
 * Complete checkout
 * This processes the payment and creates the order
 */
export async function completeCheckout(params: {
  payment_method: string
  payment_data?: Array<{ key: string; value: string }>
  billing_address?: WCBillingAddress
  shipping_address?: WCShippingAddress
  customer_note?: string
  create_account?: boolean
}): Promise<{
  type: 'order' | 'cart'
  data: CheckoutOrder | Cart
}> {
  const { data } = await checkoutApiRequest<WCCheckoutResponse>('complete', params)

  // Clear cart token after successful order
  clearStoredCartId()

  // Transform to normalized order format
  const order: CheckoutOrder = {
    id: String(data.order_id),
    display_id: data.order_id,
    status: data.status,
    email: data.billing_address.email,
    currency_code: 'usd', // WC response doesn't include this directly
    total: 0, // Would need to fetch order details for totals
    shipping_total: 0,
    tax_total: 0,
    discount_total: 0,
    items: [],
    shipping_address: data.shipping_address ? {
      first_name: data.shipping_address.first_name,
      last_name: data.shipping_address.last_name,
      address_1: data.shipping_address.address_1,
      address_2: data.shipping_address.address_2,
      city: data.shipping_address.city,
      province: data.shipping_address.state,
      postal_code: data.shipping_address.postcode,
      country_code: data.shipping_address.country,
      phone: data.shipping_address.phone,
    } : undefined,
    billing_address: {
      first_name: data.billing_address.first_name,
      last_name: data.billing_address.last_name,
      address_1: data.billing_address.address_1,
      address_2: data.billing_address.address_2,
      city: data.billing_address.city,
      province: data.billing_address.state,
      postal_code: data.billing_address.postcode,
      country_code: data.billing_address.country,
      phone: data.billing_address.phone,
    },
  }

  return {
    type: 'order',
    data: order,
  }
}

/**
 * Get order by ID
 */
export async function getOrder(orderId: string): Promise<{ order: CheckoutOrder }> {
  // WooCommerce Store API doesn't have a public order endpoint
  // Orders need to be fetched via WooCommerce REST API with authentication
  // For now, return minimal data - this can be enhanced with a server-side API route

  return {
    order: {
      id: orderId,
      display_id: parseInt(orderId, 10),
      status: 'processing',
      email: '',
      currency_code: 'usd',
      total: 0,
      shipping_total: 0,
      tax_total: 0,
      discount_total: 0,
      items: [],
    },
  }
}

// ============================================
// Cart Transformation (borrowed from wc-cart.ts)
// ============================================

import { wpImageUrl } from './wordpress-images'

function transformCart(wcCart: WCStoreCart): Cart {
  const minorUnit = wcCart.totals.currency_minor_unit

  return {
    id: getStoredCartToken() || 'guest-cart',
    email: wcCart.billing_address.email || undefined,
    customer_id: undefined,
    region_id: 'default',
    currency_code: wcCart.totals.currency_code.toLowerCase(),
    items: wcCart.items.map((item) => ({
      id: item.key,
      cart_id: getStoredCartToken() || 'guest-cart',
      variant_id: String(item.id),
      quantity: item.quantity,
      unit_price: parsePrice(item.prices.price, item.prices.currency_minor_unit),
      subtotal: parsePrice(item.totals.line_subtotal, item.totals.currency_minor_unit),
      total: parsePrice(item.totals.line_total, item.totals.currency_minor_unit),
      title: item.name,
      description: item.short_description || undefined,
      thumbnail: item.images[0] ? wpImageUrl(item.images[0].src) : undefined,
      variant: {
        id: String(item.id),
        title: item.variation.map((v) => v.value).join(' / ') || 'Default',
        sku: item.sku || undefined,
        product: {
          id: String(item.id),
          title: item.name,
          handle: item.permalink.split('/').filter(Boolean).pop() || '',
        },
      },
      metadata: item.item_data.reduce((acc, d) => {
        acc[d.key] = d.value
        return acc
      }, {} as Record<string, unknown>),
    })),
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

// ============================================
// Legacy Exports (for compatibility with existing checkout page)
// ============================================

// Re-export types that the checkout page expects
export type { Address } from './wc-cart'
