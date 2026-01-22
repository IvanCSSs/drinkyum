/**
 * Subscription Management Functions
 *
 * Handles Subscribe & Save functionality: listing, pausing,
 * resuming, canceling, and modifying subscriptions.
 *
 * Uses WooCommerce REST API endpoints for subscription management.
 */

import { woocommerce } from './wc-client'

// Types
export type SubscriptionPeriod = 'day' | 'week' | 'month' | 'year'

// Friendly frequency strings for UI (maps to period + interval)
export type SubscriptionFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'bimonthly' | 'quarterly' | 'yearly'

export type SubscriptionStatus =
  | 'active'
  | 'on-hold'
  | 'cancelled'
  | 'expired'
  | 'pending'
  | 'pending-cancel'

export interface Subscription {
  id: number
  status: SubscriptionStatus
  customer_id: number
  billing_period: SubscriptionPeriod
  billing_interval: number
  // Computed frequency string for backwards compatibility with UI
  frequency?: SubscriptionFrequency
  total: number
  currency: string
  date_created: string
  date_next_payment: string | null
  date_end: string | null
  date_trial_end: string | null
  payment_method: string
  payment_method_title: string
  parent_order_id: number | null
  billing: {
    first_name: string
    last_name: string
    email: string
  }
  shipping?: {
    first_name: string
    last_name: string
    address_1: string
    address_2?: string
    city: string
    state: string
    postcode: string
    country: string
    phone?: string
  }
  line_items: SubscriptionItem[]
  related_orders: SubscriptionOrder[]
  available_actions: ('pause' | 'resume' | 'cancel')[]
}

export interface SubscriptionItem {
  product_id: number
  variation_id: number
  name: string
  quantity: number
  subtotal: number
  total: number
}

export interface SubscriptionOrder {
  id: number
  type: string
  date: string
  status: string
  total: number
}

/**
 * Get all subscriptions for the current customer
 * Uses local API proxy to fetch from WooCommerce with proper auth
 */
export async function getMySubscriptions(email?: string): Promise<{
  subscriptions: Subscription[]
  count: number
}> {
  // Use local API proxy which handles WC authentication
  const url = email ? `/api/subscriptions?email=${encodeURIComponent(email)}` : '/api/subscriptions'

  // Get auth token (use same key as auth.ts: 'wp_auth_token')
  const token = typeof window !== 'undefined' ? localStorage.getItem('wp_auth_token') : null
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(url, {
    method: 'GET',
    headers,
  })

  if (!response.ok) {
    throw new Error('Failed to fetch subscriptions')
  }

  const data = await response.json()

  return {
    subscriptions: data.subscriptions || [],
    count: data.count || 0,
  }
}

/**
 * Get a single subscription by ID
 * Uses local API proxy to handle WooCommerce OAuth authentication
 */
export async function getSubscription(subscriptionId: number): Promise<{
  subscription: Subscription
}> {
  const response = await fetch(`/api/subscriptions/${subscriptionId}`)

  if (!response.ok) {
    throw new Error('Failed to fetch subscription')
  }

  return response.json()
}

/**
 * Pause a subscription
 * Uses local API proxy to handle WooCommerce OAuth authentication
 */
export async function pauseSubscription(subscriptionId: number): Promise<{
  subscription: Subscription
}> {
  const response = await fetch(`/api/subscriptions/${subscriptionId}/pause`, {
    method: 'POST',
  })

  if (!response.ok) {
    throw new Error('Failed to pause subscription')
  }

  return response.json()
}

/**
 * Resume a paused subscription
 * Uses local API proxy to handle WooCommerce OAuth authentication
 */
export async function resumeSubscription(subscriptionId: number): Promise<{
  subscription: Subscription
}> {
  const response = await fetch(`/api/subscriptions/${subscriptionId}/resume`, {
    method: 'POST',
  })

  if (!response.ok) {
    throw new Error('Failed to resume subscription')
  }

  return response.json()
}

/**
 * Cancel a subscription
 * Uses local API proxy to handle WooCommerce OAuth authentication
 */
export async function cancelSubscription(
  subscriptionId: number,
  reason?: string
): Promise<{
  subscription: Subscription
}> {
  const response = await fetch(`/api/subscriptions/${subscriptionId}/cancel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ reason }),
  })

  if (!response.ok) {
    throw new Error('Failed to cancel subscription')
  }

  return response.json()
}

/**
 * Skip the next shipment
 * Uses local API proxy to handle WooCommerce OAuth authentication
 */
export async function skipNextShipment(subscriptionId: number): Promise<{
  subscription: Subscription
  skipped_date: string
}> {
  const response = await fetch(`/api/subscriptions/${subscriptionId}/skip`, {
    method: 'POST',
  })

  if (!response.ok) {
    throw new Error('Failed to skip shipment')
  }

  return response.json()
}

/**
 * Change subscription frequency
 * Uses local API proxy to handle WooCommerce OAuth authentication
 */
export async function changeFrequency(
  subscriptionId: number,
  period: SubscriptionPeriod,
  interval: number = 1
): Promise<{
  subscription: Subscription
}> {
  const response = await fetch(`/api/subscriptions/${subscriptionId}/frequency`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ billing_period: period, billing_interval: interval }),
  })

  if (!response.ok) {
    throw new Error('Failed to change frequency')
  }

  return response.json()
}

/**
 * Update subscription payment method
 */
export async function updatePaymentMethod(
  subscriptionId: number,
  paymentTokenId: number
): Promise<{
  subscription: Subscription
}> {
  const subscription = await woocommerce.post<Subscription>(
    `/subscriptions/${subscriptionId}/payment-method`,
    { payment_token_id: paymentTokenId }
  )
  return { subscription }
}

/**
 * Update subscription shipping address
 */
export async function updateSubscriptionShippingAddress(
  subscriptionId: number,
  address: {
    first_name: string
    last_name: string
    address_1: string
    address_2?: string
    city: string
    state: string
    postcode: string
    country: string
    phone?: string
  }
): Promise<{
  subscription: Subscription
}> {
  const subscription = await woocommerce.post<Subscription>(
    `/subscriptions/${subscriptionId}/shipping-address`,
    { shipping: address }
  )
  return { subscription }
}

/**
 * Update subscription item quantity
 */
export async function updateItemQuantity(
  subscriptionId: number,
  productId: number,
  quantity: number
): Promise<{
  subscription: Subscription
}> {
  const subscription = await woocommerce.post<Subscription>(
    `/subscriptions/${subscriptionId}/items`,
    { product_id: productId, quantity }
  )
  return { subscription }
}

/**
 * Get subscription order history
 */
export async function getSubscriptionOrders(subscriptionId: number): Promise<{
  orders: SubscriptionOrder[]
}> {
  const subscription = await woocommerce.get<Subscription>(`/subscriptions/${subscriptionId}`)
  return { orders: subscription.related_orders || [] }
}

/**
 * Format frequency for display
 */
export function formatFrequency(period: SubscriptionPeriod, interval: number = 1): string {
  if (interval === 1) {
    const labels: Record<SubscriptionPeriod, string> = {
      day: 'Daily',
      week: 'Weekly',
      month: 'Monthly',
      year: 'Yearly',
    }
    return labels[period] || period
  }

  const plurals: Record<SubscriptionPeriod, string> = {
    day: 'days',
    week: 'weeks',
    month: 'months',
    year: 'years',
  }
  return `Every ${interval} ${plurals[period] || period}`
}

/**
 * Format subscription status for display
 */
export function formatStatus(status: SubscriptionStatus): string {
  const labels: Record<SubscriptionStatus, string> = {
    active: 'Active',
    'on-hold': 'Paused',
    cancelled: 'Cancelled',
    expired: 'Expired',
    pending: 'Pending',
    'pending-cancel': 'Pending Cancellation',
  }
  return labels[status] || status
}

/**
 * Get status color for UI
 */
export function getStatusColor(status: SubscriptionStatus): string {
  const colors: Record<SubscriptionStatus, string> = {
    active: 'green',
    'on-hold': 'yellow',
    cancelled: 'red',
    expired: 'gray',
    pending: 'blue',
    'pending-cancel': 'orange',
  }
  return colors[status] || 'gray'
}

/**
 * Convert period/interval to friendly frequency string
 */
export function toFrequency(period: SubscriptionPeriod, interval: number): SubscriptionFrequency {
  if (period === 'day' && interval === 1) return 'daily'
  if (period === 'week' && interval === 1) return 'weekly'
  if (period === 'week' && interval === 2) return 'biweekly'
  if (period === 'month' && interval === 1) return 'monthly'
  if (period === 'month' && interval === 2) return 'bimonthly'
  if (period === 'month' && interval === 3) return 'quarterly'
  if (period === 'year' && interval === 1) return 'yearly'
  // Default to monthly for any other combination
  return 'monthly'
}

/**
 * Convert friendly frequency string to period/interval
 */
export function fromFrequency(frequency: SubscriptionFrequency): { period: SubscriptionPeriod; interval: number } {
  const mapping: Record<SubscriptionFrequency, { period: SubscriptionPeriod; interval: number }> = {
    daily: { period: 'day', interval: 1 },
    weekly: { period: 'week', interval: 1 },
    biweekly: { period: 'week', interval: 2 },
    monthly: { period: 'month', interval: 1 },
    bimonthly: { period: 'month', interval: 2 },
    quarterly: { period: 'month', interval: 3 },
    yearly: { period: 'year', interval: 1 },
  }
  return mapping[frequency] || { period: 'month', interval: 1 }
}
