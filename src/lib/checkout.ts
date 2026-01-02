/**
 * Checkout Functions
 *
 * Handles the checkout flow: shipping options, payment sessions,
 * and order completion.
 */

import { medusa } from './medusa-client'
import { getOrCreateCart, clearStoredCartId, type Cart, type Address } from './cart'

// Types
export interface ShippingOption {
  id: string
  name: string
  price_type: 'flat_rate' | 'calculated'
  amount: number
  provider_id: string
  data: Record<string, unknown>
}

export interface Order {
  id: string
  display_id: number
  status: string
  email: string
  currency_code: string
  items: OrderItem[]
  subtotal: number
  discount_total: number
  shipping_total: number
  tax_total: number
  total: number
  shipping_address: Address
  billing_address?: Address
  fulfillments: Fulfillment[]
  payments: Payment[]
  created_at: string
}

export interface OrderItem {
  id: string
  title: string
  description?: string
  thumbnail?: string
  quantity: number
  unit_price: number
  subtotal: number
  total: number
  variant: {
    id: string
    title: string
    product: {
      id: string
      title: string
      handle: string
    }
  }
}

export interface Fulfillment {
  id: string
  tracking_numbers: string[]
  tracking_links: { url: string }[]
  shipped_at?: string
  items: { item_id: string; quantity: number }[]
}

export interface Payment {
  id: string
  provider_id: string
  amount: number
  currency_code: string
  captured_at?: string
}

export interface ShippingRateRequest {
  ship_to: {
    name?: string
    street1: string
    street2?: string
    city: string
    state: string
    zip: string
    country?: string
  }
  items?: {
    product_id?: string
    variant_id?: string
    quantity: number
    weight_oz?: number
    price?: number
  }[]
  order_total?: number
  order_subtotal?: number
  customer_id?: string
}

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

export interface ShippingRatesResponse {
  rates: ShippingRate[]
  rules_applied: boolean
  applied_actions?: {
    free_shipping?: boolean
    discount_percent?: number
    carrier_account_id?: string
  }
}

/**
 * Step 1: Update checkout email
 */
export async function updateCheckoutEmail(email: string): Promise<Cart> {
  const cartId = await getOrCreateCart()

  const response = await medusa.post<{ cart: Cart }>(
    `/store/carts/${cartId}`,
    { email }
  )

  return response.cart
}

/**
 * Step 2: Update shipping address
 */
export async function updateShippingAddress(address: Address): Promise<Cart> {
  const cartId = await getOrCreateCart()

  const response = await medusa.post<{ cart: Cart }>(
    `/store/carts/${cartId}`,
    { shipping_address: address }
  )

  return response.cart
}

/**
 * Step 2b: Update billing address (if different from shipping)
 */
export async function updateBillingAddress(address: Address): Promise<Cart> {
  const cartId = await getOrCreateCart()

  const response = await medusa.post<{ cart: Cart }>(
    `/store/carts/${cartId}`,
    { billing_address: address }
  )

  return response.cart
}

/**
 * Get real-time shipping rates from EasyPost
 */
export async function getShippingRates(
  request: ShippingRateRequest
): Promise<ShippingRatesResponse> {
  return medusa.post('/store/shipping/rates', request)
}

/**
 * Step 3: Get available shipping options for cart
 */
export async function getShippingOptions(): Promise<{ shipping_options: ShippingOption[] }> {
  const cartId = await getOrCreateCart()
  return medusa.get(`/store/shipping-options/${cartId}`)
}

/**
 * Step 4: Select shipping method
 */
export async function selectShippingMethod(optionId: string): Promise<Cart> {
  const cartId = await getOrCreateCart()

  const response = await medusa.post<{ cart: Cart }>(
    `/store/carts/${cartId}/shipping-methods`,
    { option_id: optionId }
  )

  return response.cart
}

/**
 * Step 5a: Create payment sessions
 */
export async function createPaymentSessions(): Promise<Cart> {
  const cartId = await getOrCreateCart()

  const response = await medusa.post<{ cart: Cart }>(
    `/store/carts/${cartId}/payment-sessions`
  )

  return response.cart
}

/**
 * Step 5b: Select payment provider
 */
export async function selectPaymentProvider(providerId: string): Promise<Cart> {
  const cartId = await getOrCreateCart()

  const response = await medusa.post<{ cart: Cart }>(
    `/store/carts/${cartId}/payment-session`,
    { provider_id: providerId }
  )

  return response.cart
}

/**
 * Step 5c: Update payment session data (for Stripe client_secret, etc.)
 */
export async function updatePaymentSession(
  providerId: string,
  data: Record<string, unknown>
): Promise<Cart> {
  const cartId = await getOrCreateCart()

  const response = await medusa.post<{ cart: Cart }>(
    `/store/carts/${cartId}/payment-sessions/${providerId}`,
    { data }
  )

  return response.cart
}

/**
 * Step 6: Complete checkout
 */
export async function completeCheckout(): Promise<{
  type: 'order' | 'cart' | 'swap'
  data: Order | Cart
}> {
  const cartId = await getOrCreateCart()

  const response = await medusa.post<{
    type: 'order' | 'cart' | 'swap'
    data: Order | Cart
  }>(`/store/carts/${cartId}/complete`)

  // Clear cart ID after successful order
  if (response.type === 'order') {
    clearStoredCartId()
  }

  return response
}

/**
 * Get order by ID
 */
export async function getOrder(orderId: string): Promise<{ order: Order }> {
  return medusa.get(`/store/orders/${orderId}`)
}

/**
 * Track shipment by tracking number
 */
export async function trackShipment(trackingNumber: string): Promise<{
  tracking_number: string
  carrier: string
  status: string
  status_detail?: string
  tracking_details: {
    datetime: string
    message: string
    status: string
    location?: string
  }[]
  est_delivery_date?: string
}> {
  return medusa.get(`/store/shipping/track/${encodeURIComponent(trackingNumber)}`)
}

/**
 * Apply discount code to cart
 */
export async function applyDiscountCode(code: string): Promise<Cart> {
  const cartId = await getOrCreateCart()

  const response = await medusa.post<{ cart: Cart }>(
    `/store/carts/${cartId}/discounts/${encodeURIComponent(code)}`
  )

  return response.cart
}

/**
 * Remove discount code from cart
 */
export async function removeDiscountCode(code: string): Promise<Cart> {
  const cartId = await getOrCreateCart()

  const response = await medusa.delete<{ cart: Cart }>(
    `/store/carts/${cartId}/discounts/${encodeURIComponent(code)}`
  )

  return response.cart
}
