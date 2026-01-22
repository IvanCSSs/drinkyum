/**
 * Debug endpoint to inspect WooCommerce customer data
 */

import { NextRequest, NextResponse } from 'next/server'

const WP_URL = process.env.NEXT_PUBLIC_WP_URL || 'https://wordpress-production-7c0a.up.railway.app/drinkyum'
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
  const authHeader = request.headers.get('Authorization')

  if (!authHeader) {
    return NextResponse.json({ error: 'No auth header' })
  }

  // Get customer from JWT
  const customerResponse = await fetch(
    `${WP_URL}/wp-json/auth/v1/me`,
    {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    }
  )

  const customerData = await customerResponse.json()
  const customerEmail = customerData.customer?.email || customerData.email
  const customerId = customerData.customer?.id || customerData.id

  // Get WooCommerce customer by email
  const wcCustomerByEmailResponse = await fetch(
    `${WP_URL}/wp-json/wc/v3/customers?email=${encodeURIComponent(customerEmail)}`,
    {
      method: 'GET',
      headers: {
        'Authorization': getAuthHeader(),
        'Content-Type': 'application/json',
      },
    }
  )

  const wcCustomersByEmail = await wcCustomerByEmailResponse.json()

  // Get WooCommerce customer by ID
  let wcCustomerById = null
  if (wcCustomersByEmail.length > 0) {
    const wcCustomerByIdResponse = await fetch(
      `${WP_URL}/wp-json/wc/v3/customers/${wcCustomersByEmail[0].id}`,
      {
        method: 'GET',
        headers: {
          'Authorization': getAuthHeader(),
          'Content-Type': 'application/json',
        },
      }
    )
    wcCustomerById = await wcCustomerByIdResponse.json()
  }

  return NextResponse.json({
    jwtCustomer: {
      id: customerId,
      email: customerEmail,
    },
    wcCustomersByEmail: wcCustomersByEmail,
    wcCustomerById: wcCustomerById,
  })
}
