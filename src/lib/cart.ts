/**
 * Cart Management Functions
 *
 * Handles shopping cart operations: create, add items,
 * update quantities, remove items.
 */

import { medusa } from './medusa-client'

const CART_ID_KEY = 'medusa_cart_id'

// Types
export interface CartItem {
  id: string
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
}

export interface Cart {
  id: string
  email?: string
  customer_id?: string
  region_id: string
  currency_code: string
  items: CartItem[]
  subtotal: number
  discount_total: number
  shipping_total: number
  tax_total: number
  total: number
  shipping_address?: Address
  billing_address?: Address
  payment_session?: PaymentSession
  shipping_methods?: ShippingMethod[]
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

export interface PaymentSession {
  id: string
  provider_id: string
  status: string
  data: Record<string, unknown>
}

export interface ShippingMethod {
  id: string
  shipping_option_id: string
  price: number
}

/**
 * Get stored cart ID from localStorage
 */
function getStoredCartId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(CART_ID_KEY)
}

/**
 * Store cart ID in localStorage
 */
function setStoredCartId(cartId: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CART_ID_KEY, cartId)
  }
}

/**
 * Clear stored cart ID
 */
export function clearStoredCartId(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(CART_ID_KEY)
  }
}

/**
 * Get or create a cart, returns the cart ID
 */
export async function getOrCreateCart(): Promise<string> {
  let cartId = getStoredCartId()

  if (cartId) {
    // Verify cart still exists
    try {
      await medusa.get<{ cart: Cart }>(`/store/carts/${cartId}`)
      return cartId
    } catch {
      // Cart no longer exists, create new one
      clearStoredCartId()
    }
  }

  // Create new cart
  const response = await medusa.post<{ cart: Cart }>('/store/carts')
  cartId = response.cart.id
  setStoredCartId(cartId)

  return cartId
}

/**
 * Get the current cart
 */
export async function getCart(): Promise<Cart | null> {
  const cartId = getStoredCartId()
  if (!cartId) return null

  try {
    const response = await medusa.get<{ cart: Cart }>(`/store/carts/${cartId}`)
    return response.cart
  } catch {
    clearStoredCartId()
    return null
  }
}

/**
 * Add item to cart
 */
export async function addToCart(
  variantId: string,
  quantity: number = 1,
  metadata?: Record<string, unknown>
): Promise<Cart> {
  const cartId = await getOrCreateCart()

  const body: Record<string, unknown> = {
    variant_id: variantId,
    quantity,
  }

  if (metadata) {
    body.metadata = metadata
  }

  const response = await medusa.post<{ cart: Cart }>(
    `/store/carts/${cartId}/line-items`,
    body
  )

  return response.cart
}

/**
 * Add subscription product to cart
 */
export async function addSubscriptionToCart(
  variantId: string,
  quantity: number,
  subscriptionOptionId: string
): Promise<Cart> {
  return addToCart(variantId, quantity, {
    subscription_option_id: subscriptionOptionId,
    is_subscription: true,
  })
}

/**
 * Update cart item quantity
 */
export async function updateCartItem(
  lineItemId: string,
  quantity: number
): Promise<Cart> {
  const cartId = await getOrCreateCart()

  const response = await medusa.post<{ cart: Cart }>(
    `/store/carts/${cartId}/line-items/${lineItemId}`,
    { quantity }
  )

  return response.cart
}

/**
 * Remove item from cart
 */
export async function removeCartItem(lineItemId: string): Promise<Cart> {
  const cartId = await getOrCreateCart()

  const response = await medusa.delete<{ cart: Cart }>(
    `/store/carts/${cartId}/line-items/${lineItemId}`
  )

  return response.cart
}

/**
 * Update cart (email, addresses, etc.)
 */
export async function updateCart(data: {
  email?: string
  shipping_address?: Address
  billing_address?: Address
  customer_id?: string
}): Promise<Cart> {
  const cartId = await getOrCreateCart()

  const response = await medusa.post<{ cart: Cart }>(
    `/store/carts/${cartId}`,
    data
  )

  return response.cart
}

/**
 * Get cart item count
 */
export async function getCartItemCount(): Promise<number> {
  const cart = await getCart()
  if (!cart) return 0

  return cart.items.reduce((sum, item) => sum + item.quantity, 0)
}
