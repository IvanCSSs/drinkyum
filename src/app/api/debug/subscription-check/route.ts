/**
 * Debug endpoint to check subscription lookup
 */

import { NextRequest, NextResponse } from 'next/server'

const WC_URL = process.env.NEXT_PUBLIC_WP_URL || 'https://wordpress-production-7c0a.up.railway.app/drinkyum'
const WC_CONSUMER_KEY = process.env.WC_CONSUMER_KEY
const WC_CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET

function getAuthHeader(): string {
  if (!WC_CONSUMER_KEY || !WC_CONSUMER_SECRET) {
    throw new Error('WooCommerce credentials not configured')
  }
  const credentials = Buffer.from(`${WC_CONSUMER_KEY}:${WC_CONSUMER_SECRET}`).toString('base64')
  return `Basic ${credentials}`
}

export async function GET(request: NextRequest) {
  const debug: any = {
    steps: [],
    errors: []
  }

  try {
    // Step 1: Check auth header
    const authHeader = request.headers.get('Authorization')
    debug.steps.push({
      step: 1,
      name: 'Check Authorization header',
      hasAuthHeader: !!authHeader,
      authHeaderPrefix: authHeader?.substring(0, 20) + '...'
    })

    if (!authHeader) {
      return NextResponse.json({ debug, error: 'No auth header' })
    }

    // Step 2: Get customer from JWT
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

    debug.steps.push({
      step: 2,
      name: 'Get customer from JWT',
      status: customerResponse.status,
      ok: customerResponse.ok
    })

    if (!customerResponse.ok) {
      const errorText = await customerResponse.text()
      debug.errors.push({ step: 2, error: errorText })
      return NextResponse.json({ debug })
    }

    const customerData = await customerResponse.json()
    const customerEmail = customerData.email

    debug.steps.push({
      step: 3,
      name: 'Customer data',
      email: customerEmail,
      id: customerData.id,
      fullCustomerData: customerData
    })

    // Step 3: Look up customer by email in WooCommerce
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

    debug.steps.push({
      step: 4,
      name: 'Look up customer in WooCommerce',
      status: customersResponse.status,
      ok: customersResponse.ok
    })

    if (!customersResponse.ok) {
      const errorText = await customersResponse.text()
      debug.errors.push({ step: 4, error: errorText })
      return NextResponse.json({ debug })
    }

    const customers = await customersResponse.json()
    debug.steps.push({
      step: 5,
      name: 'Customers found',
      count: customers.length,
      customerIds: customers.map((c: any) => ({ id: c.id, email: c.email }))
    })

    if (customers.length === 0) {
      return NextResponse.json({ debug, message: 'No customer found with this email' })
    }

    const customerId = customers[0].id

    // Step 4: Fetch subscriptions for this customer
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

    debug.steps.push({
      step: 6,
      name: 'Fetch subscriptions',
      status: subscriptionsResponse.status,
      ok: subscriptionsResponse.ok,
      url: `${WC_URL}/wp-json/wc/v3/subscriptions?customer=${customerId}`
    })

    if (!subscriptionsResponse.ok) {
      const errorText = await subscriptionsResponse.text()
      debug.errors.push({ step: 6, error: errorText })
      return NextResponse.json({ debug })
    }

    const subscriptions = await subscriptionsResponse.json()
    debug.steps.push({
      step: 7,
      name: 'Subscriptions result',
      count: subscriptions.length,
      subscriptions: subscriptions.map((s: any) => ({
        id: s.id,
        status: s.status,
        customer_id: s.customer_id,
        billing_email: s.billing?.email
      }))
    })

    return NextResponse.json({ debug, success: true })

  } catch (error: any) {
    debug.errors.push({ general: error.message })
    return NextResponse.json({ debug, error: error.message }, { status: 500 })
  }
}
