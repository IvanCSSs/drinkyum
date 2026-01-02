/**
 * Subscription Management Functions
 *
 * Handles Subscribe & Save functionality: listing, pausing,
 * resuming, canceling, and modifying subscriptions.
 */

import { medusa } from './medusa-client'

// Types
export type SubscriptionFrequency =
  | 'weekly'
  | 'biweekly'
  | 'monthly'
  | 'bimonthly'
  | 'quarterly'
  | 'yearly'

export type SubscriptionStatus =
  | 'active'
  | 'paused'
  | 'cancelled'
  | 'expired'
  | 'pending'

export interface Subscription {
  id: string
  customer_id: string
  status: SubscriptionStatus
  frequency: SubscriptionFrequency
  interval_count: number
  discount_percent: number
  next_billing_date: string
  last_billing_date?: string
  created_at: string
  updated_at: string
  items: SubscriptionItem[]
  payment_method_id?: string
  shipping_address?: {
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
  metadata?: Record<string, unknown>
}

export interface SubscriptionItem {
  id: string
  subscription_id: string
  variant_id: string
  quantity: number
  unit_price: number
  product: {
    id: string
    title: string
    handle: string
    thumbnail?: string
  }
  variant: {
    id: string
    title: string
    sku?: string
  }
}

export interface SubscriptionOrder {
  id: string
  subscription_id: string
  order_id: string
  status: string
  total: number
  created_at: string
}

/**
 * Get all subscriptions for the current customer
 */
export async function getMySubscriptions(): Promise<{
  subscriptions: Subscription[]
  count: number
}> {
  return medusa.get('/store/product-subscriptions/me')
}

/**
 * Get a single subscription by ID
 */
export async function getSubscription(subscriptionId: string): Promise<{
  subscription: Subscription
}> {
  return medusa.get(`/store/product-subscriptions/me/${subscriptionId}`)
}

/**
 * Pause a subscription
 */
export async function pauseSubscription(subscriptionId: string): Promise<{
  subscription: Subscription
}> {
  return medusa.post(`/store/product-subscriptions/me/${subscriptionId}/pause`)
}

/**
 * Resume a paused subscription
 */
export async function resumeSubscription(subscriptionId: string): Promise<{
  subscription: Subscription
}> {
  return medusa.post(`/store/product-subscriptions/me/${subscriptionId}/resume`)
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(
  subscriptionId: string,
  reason?: string
): Promise<{
  subscription: Subscription
}> {
  return medusa.post(`/store/product-subscriptions/me/${subscriptionId}/cancel`, {
    reason,
  })
}

/**
 * Skip the next shipment
 */
export async function skipNextShipment(subscriptionId: string): Promise<{
  subscription: Subscription
  skipped_date: string
}> {
  return medusa.post(`/store/product-subscriptions/me/${subscriptionId}/skip`)
}

/**
 * Change subscription frequency
 */
export async function changeFrequency(
  subscriptionId: string,
  frequency: SubscriptionFrequency
): Promise<{
  subscription: Subscription
}> {
  return medusa.patch(
    `/store/product-subscriptions/me/${subscriptionId}/frequency`,
    { frequency }
  )
}

/**
 * Update subscription payment method
 */
export async function updatePaymentMethod(
  subscriptionId: string,
  paymentMethodId: string
): Promise<{
  subscription: Subscription
}> {
  return medusa.patch(
    `/store/product-subscriptions/me/${subscriptionId}/payment-method`,
    { payment_method_id: paymentMethodId }
  )
}

/**
 * Update subscription shipping address
 */
export async function updateShippingAddress(
  subscriptionId: string,
  address: {
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
): Promise<{
  subscription: Subscription
}> {
  return medusa.patch(
    `/store/product-subscriptions/me/${subscriptionId}/shipping-address`,
    { shipping_address: address }
  )
}

/**
 * Update subscription item quantity
 */
export async function updateItemQuantity(
  subscriptionId: string,
  itemId: string,
  quantity: number
): Promise<{
  subscription: Subscription
}> {
  return medusa.patch(
    `/store/product-subscriptions/me/${subscriptionId}/items/${itemId}`,
    { quantity }
  )
}

/**
 * Get subscription order history
 */
export async function getSubscriptionOrders(subscriptionId: string): Promise<{
  orders: SubscriptionOrder[]
}> {
  return medusa.get(`/store/product-subscriptions/me/${subscriptionId}/orders`)
}

/**
 * Format frequency for display
 */
export function formatFrequency(frequency: SubscriptionFrequency): string {
  const labels: Record<SubscriptionFrequency, string> = {
    weekly: 'Every week',
    biweekly: 'Every 2 weeks',
    monthly: 'Every month',
    bimonthly: 'Every 2 months',
    quarterly: 'Every 3 months',
    yearly: 'Every year',
  }
  return labels[frequency] || frequency
}

/**
 * Format subscription status for display
 */
export function formatStatus(status: SubscriptionStatus): string {
  const labels: Record<SubscriptionStatus, string> = {
    active: 'Active',
    paused: 'Paused',
    cancelled: 'Cancelled',
    expired: 'Expired',
    pending: 'Pending',
  }
  return labels[status] || status
}

/**
 * Get status color for UI
 */
export function getStatusColor(status: SubscriptionStatus): string {
  const colors: Record<SubscriptionStatus, string> = {
    active: 'green',
    paused: 'yellow',
    cancelled: 'red',
    expired: 'gray',
    pending: 'blue',
  }
  return colors[status] || 'gray'
}
