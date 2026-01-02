/**
 * Order History Functions
 *
 * Handles fetching customer orders and returns.
 */

import { medusa } from './medusa-client'
import type { Address } from './addresses'

// Types
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
    sku?: string
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
  delivered_at?: string
  canceled_at?: string
  items: { item_id: string; quantity: number }[]
}

export interface Payment {
  id: string
  provider_id: string
  amount: number
  currency_code: string
  captured_at?: string
  refunded_at?: string
}

export interface Order {
  id: string
  display_id: number
  status: 'pending' | 'completed' | 'archived' | 'canceled' | 'requires_action'
  fulfillment_status: 'not_fulfilled' | 'partially_fulfilled' | 'fulfilled' | 'partially_shipped' | 'shipped' | 'partially_returned' | 'returned' | 'canceled' | 'requires_action'
  payment_status: 'not_paid' | 'awaiting' | 'captured' | 'partially_refunded' | 'refunded' | 'canceled' | 'requires_action'
  email: string
  currency_code: string
  items: OrderItem[]
  subtotal: number
  discount_total: number
  shipping_total: number
  tax_total: number
  total: number
  paid_total: number
  refunded_total: number
  shipping_address: Address
  billing_address?: Address
  fulfillments: Fulfillment[]
  payments: Payment[]
  created_at: string
  updated_at: string
  metadata?: Record<string, unknown>
}

export interface Return {
  id: string
  order_id: string
  status: 'requested' | 'received' | 'requires_action' | 'canceled'
  refund_amount: number
  items: {
    item_id: string
    quantity: number
    reason: string
    note?: string
  }[]
  created_at: string
  updated_at: string
}

export interface OrderListParams {
  limit?: number
  offset?: number
  status?: string
}

/**
 * Get customer order history
 */
export async function getOrders(params?: OrderListParams): Promise<{
  orders: Order[]
  count: number
  offset: number
  limit: number
}> {
  const query = new URLSearchParams()
  if (params?.limit) query.set('limit', String(params.limit))
  if (params?.offset) query.set('offset', String(params.offset))
  if (params?.status) query.set('status', params.status)

  const queryStr = query.toString()
  return medusa.get(`/store/purchases/me${queryStr ? `?${queryStr}` : ''}`)
}

/**
 * Get a single order by ID
 */
export async function getOrder(orderId: string): Promise<{
  order: Order
}> {
  return medusa.get(`/store/purchases/me/${orderId}`)
}

/**
 * Get recent orders (last 5)
 */
export async function getRecentOrders(): Promise<Order[]> {
  const { orders } = await getOrders({ limit: 5 })
  return orders
}

/**
 * Create a return request
 */
export async function createReturn(data: {
  order_id: string
  items: {
    item_id: string
    quantity: number
    reason: string
    note?: string
  }[]
}): Promise<{
  return: Return
}> {
  return medusa.post('/store/returns', data)
}

/**
 * Get customer returns
 */
export async function getReturns(): Promise<{
  returns: Return[]
}> {
  return medusa.get('/store/returns/me')
}

/**
 * Get return by ID
 */
export async function getReturn(returnId: string): Promise<{
  return: Return
}> {
  return medusa.get(`/store/returns/me/${returnId}`)
}

/**
 * Format order status for display
 */
export function formatOrderStatus(status: Order['status']): string {
  const labels: Record<Order['status'], string> = {
    pending: 'Processing',
    completed: 'Completed',
    archived: 'Archived',
    canceled: 'Canceled',
    requires_action: 'Action Required',
  }
  return labels[status] || status
}

/**
 * Format fulfillment status for display
 */
export function formatFulfillmentStatus(status: Order['fulfillment_status']): string {
  const labels: Record<Order['fulfillment_status'], string> = {
    not_fulfilled: 'Processing',
    partially_fulfilled: 'Partially Fulfilled',
    fulfilled: 'Fulfilled',
    partially_shipped: 'Partially Shipped',
    shipped: 'Shipped',
    partially_returned: 'Partially Returned',
    returned: 'Returned',
    canceled: 'Canceled',
    requires_action: 'Action Required',
  }
  return labels[status] || status
}

/**
 * Format payment status for display
 */
export function formatPaymentStatus(status: Order['payment_status']): string {
  const labels: Record<Order['payment_status'], string> = {
    not_paid: 'Unpaid',
    awaiting: 'Awaiting Payment',
    captured: 'Paid',
    partially_refunded: 'Partially Refunded',
    refunded: 'Refunded',
    canceled: 'Canceled',
    requires_action: 'Action Required',
  }
  return labels[status] || status
}

/**
 * Get status color for UI
 */
export function getOrderStatusColor(status: Order['status']): string {
  const colors: Record<Order['status'], string> = {
    pending: 'yellow',
    completed: 'green',
    archived: 'gray',
    canceled: 'red',
    requires_action: 'orange',
  }
  return colors[status] || 'gray'
}

/**
 * Format order date for display
 */
export function formatOrderDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Format currency amount
 */
export function formatOrderAmount(amount: number, currencyCode: string = 'usd'): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode.toUpperCase(),
  })
  // Medusa stores prices in cents
  return formatter.format(amount / 100)
}

/**
 * Check if order can be returned
 */
export function canRequestReturn(order: Order): boolean {
  // Can return if order is completed and not fully returned
  return (
    order.status === 'completed' &&
    order.fulfillment_status !== 'returned' &&
    order.fulfillment_status !== 'canceled'
  )
}
