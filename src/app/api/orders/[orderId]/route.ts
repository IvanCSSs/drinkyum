/**
 * Orders API route
 *
 * Fetches order details from WooCommerce REST API
 * GET /api/orders/[orderId] - Get order by ID
 */

import { NextRequest, NextResponse } from 'next/server'

const WC_URL = process.env.NEXT_PUBLIC_WP_URL || 'https://wordpress-production-7c0a.up.railway.app/drinkyum'
const WC_CONSUMER_KEY = process.env.WC_CONSUMER_KEY
const WC_CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET

interface WCOrder {
  id: number
  status: string
  currency: string
  date_created: string
  total: string
  subtotal: string
  total_tax: string
  shipping_total: string
  discount_total: string
  billing: {
    first_name: string
    last_name: string
    company: string
    address_1: string
    address_2: string
    city: string
    state: string
    postcode: string
    country: string
    email: string
    phone: string
  }
  shipping: {
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
  }
  line_items: Array<{
    id: number
    name: string
    product_id: number
    variation_id: number
    quantity: number
    subtotal: string
    total: string
    price: number
    image: {
      id: string
      src: string
    }
    meta_data: Array<{
      key: string
      value: string
      display_key: string
      display_value: string
    }>
  }>
  shipping_lines: Array<{
    id: number
    method_title: string
    method_id: string
    total: string
  }>
  coupon_lines: Array<{
    id: number
    code: string
    discount: string
  }>
}

interface NormalizedOrder {
  id: string
  display_id: number
  status: string
  email: string
  currency_code: string
  items: Array<{
    id: string
    title: string
    thumbnail?: string
    quantity: number
    unit_price: number
    subtotal: number
    total: number
  }>
  subtotal: number
  discount_total: number
  shipping_total: number
  tax_total: number
  total: number
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
  billing_address?: {
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
  created_at: string
}

function transformOrder(wcOrder: WCOrder): NormalizedOrder {
  // Convert dollar amounts to cents for consistency with existing frontend
  const toCents = (amount: string | number) => Math.round(parseFloat(String(amount)) * 100)

  return {
    id: String(wcOrder.id),
    display_id: wcOrder.id,
    status: wcOrder.status,
    email: wcOrder.billing.email,
    currency_code: wcOrder.currency.toLowerCase(),
    items: wcOrder.line_items.map((item) => ({
      id: String(item.id),
      title: item.name,
      thumbnail: item.image?.src,
      quantity: item.quantity,
      unit_price: toCents(item.price),
      subtotal: toCents(item.subtotal),
      total: toCents(item.total),
    })),
    subtotal: toCents(wcOrder.subtotal),
    discount_total: toCents(wcOrder.discount_total),
    shipping_total: toCents(wcOrder.shipping_total),
    tax_total: toCents(wcOrder.total_tax),
    total: toCents(wcOrder.total),
    shipping_address: wcOrder.shipping.address_1 ? {
      first_name: wcOrder.shipping.first_name,
      last_name: wcOrder.shipping.last_name,
      address_1: wcOrder.shipping.address_1,
      address_2: wcOrder.shipping.address_2 || undefined,
      city: wcOrder.shipping.city,
      province: wcOrder.shipping.state,
      postal_code: wcOrder.shipping.postcode,
      country_code: wcOrder.shipping.country,
      phone: wcOrder.shipping.phone || undefined,
    } : undefined,
    billing_address: wcOrder.billing.address_1 ? {
      first_name: wcOrder.billing.first_name,
      last_name: wcOrder.billing.last_name,
      address_1: wcOrder.billing.address_1,
      address_2: wcOrder.billing.address_2 || undefined,
      city: wcOrder.billing.city,
      province: wcOrder.billing.state,
      postal_code: wcOrder.billing.postcode,
      country_code: wcOrder.billing.country,
      phone: wcOrder.billing.phone || undefined,
    } : undefined,
    created_at: wcOrder.date_created,
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params

    if (!WC_CONSUMER_KEY || !WC_CONSUMER_SECRET) {
      console.error('[Orders API] WooCommerce credentials not configured')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Fetch order from WooCommerce REST API
    const auth = Buffer.from(`${WC_CONSUMER_KEY}:${WC_CONSUMER_SECRET}`).toString('base64')

    const wcResponse = await fetch(`${WC_URL}/wp-json/wc/v3/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
    })

    if (!wcResponse.ok) {
      if (wcResponse.status === 404) {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        )
      }
      const errorData = await wcResponse.json().catch(() => ({}))
      console.error('[Orders API] WooCommerce error:', errorData)
      return NextResponse.json(
        { error: 'Failed to fetch order' },
        { status: wcResponse.status }
      )
    }

    const wcOrder: WCOrder = await wcResponse.json()
    const order = transformOrder(wcOrder)

    return NextResponse.json({ order })
  } catch (error) {
    console.error('[Orders API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}
