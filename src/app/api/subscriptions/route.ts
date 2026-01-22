/**
 * Subscriptions API route
 *
 * Fetches subscriptions from WooCommerce REST API
 * GET /api/subscriptions - Get all subscriptions (admin) or customer's subscriptions (by email)
 * GET /api/subscriptions?email=xxx - Get subscriptions for a specific customer email
 */

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const WC_URL = process.env.NEXT_PUBLIC_WP_URL || 'https://wordpress-production-7c0a.up.railway.app/drinkyum'
const WC_CONSUMER_KEY = process.env.WC_CONSUMER_KEY
const WC_CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET

interface WCSubscription {
  id: number
  status: string
  customer_id: number
  billing_period: string
  billing_interval: number
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
  line_items: Array<{
    product_id: number
    variation_id: number
    name: string
    quantity: number
    subtotal: number
    total: number
  }>
  related_orders: Array<{
    id: number
    type: string
    date: string
    status: string
    total: number
  }>
  available_actions: string[]
}

function getAuthHeader(): string {
  if (!WC_CONSUMER_KEY || !WC_CONSUMER_SECRET) {
    throw new Error('WooCommerce credentials not configured')
  }
  const credentials = Buffer.from(`${WC_CONSUMER_KEY}:${WC_CONSUMER_SECRET}`).toString('base64')
  return `Basic ${credentials}`
}

export async function GET(request: NextRequest) {
  try {
    if (!WC_CONSUMER_KEY || !WC_CONSUMER_SECRET) {
      console.error('[Subscriptions API] WooCommerce credentials not configured')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Get JWT token to fetch customer info
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      )
    }

    // First, get customer info from WordPress auth endpoint using JWT
    const customerResponse = await fetch(
      `${WC_URL}/wp-json/auth/v1/me`,
      {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!customerResponse.ok) {
      console.error('[Subscriptions API] Failed to get customer from JWT')
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      )
    }

    const customerData = await customerResponse.json()
    const customerEmail = customerData.email

    if (!customerEmail) {
      return NextResponse.json({ subscriptions: [], count: 0 })
    }

    // First, look up the customer by email to get their ID
    const customersResponse = await fetch(
      `${WC_URL}/wp-json/wc/v3/customers?email=${encodeURIComponent(customerEmail)}`,
      {
        method: 'GET',
        headers: {
          'Authorization': getAuthHeader(),
          'Content-Type': 'application/json',
        },
      }
    )

    if (!customersResponse.ok) {
      console.error('[Subscriptions API] Failed to fetch customer:', await customersResponse.text())
      return NextResponse.json({ subscriptions: [], count: 0 })
    }

    const customers = await customersResponse.json()

    if (!customers || customers.length === 0) {
      // No customer found with this email
      return NextResponse.json({ subscriptions: [], count: 0 })
    }

    const customerId = customers[0].id

    // Fetch subscriptions for this customer
    const subscriptionsResponse = await fetch(
      `${WC_URL}/wp-json/wc/v3/subscriptions?customer=${customerId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': getAuthHeader(),
          'Content-Type': 'application/json',
        },
      }
    )

    if (!subscriptionsResponse.ok) {
      const errorText = await subscriptionsResponse.text()
      console.error('[Subscriptions API] WooCommerce error:', errorText)
      return NextResponse.json(
        { error: 'Failed to fetch subscriptions' },
        { status: subscriptionsResponse.status }
      )
    }

    const subscriptions: WCSubscription[] = await subscriptionsResponse.json()

    return NextResponse.json({
      subscriptions,
      count: subscriptions.length,
    })
  } catch (error) {
    console.error('[Subscriptions API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    )
  }
}
