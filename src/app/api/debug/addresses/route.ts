/**
 * Debug endpoint to inspect addresses data
 */

import { NextRequest, NextResponse } from 'next/server'

const WP_URL = process.env.NEXT_PUBLIC_WP_URL || 'https://wordpress-production-7c0a.up.railway.app/drinkyum'

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

  // Fetch addresses
  const addressesResponse = await fetch(
    `${WP_URL}/wp-json/store/v1/addresses`,
    {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    }
  )

  const addressesData = await addressesResponse.json()

  return NextResponse.json({
    customer: {
      id: customerId,
      email: customerEmail,
    },
    addressesStatus: addressesResponse.status,
    addressesOk: addressesResponse.ok,
    data: addressesData,
  })
}
