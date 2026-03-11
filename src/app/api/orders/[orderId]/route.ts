/**
 * Single Order API route
 *
 * Fetches order details from custom store/v1 endpoint
 * Falls back to WC Store API for unauthenticated requests (order confirmation)
 * GET /api/orders/[orderId] - Get order by ID
 */

import { NextRequest, NextResponse } from 'next/server'
import { buildWpApiUrl } from '@/lib/wp-api-url'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params
    const authHeader = request.headers.get('Authorization')

    if (authHeader) {
      // Authenticated: use store/v1 endpoint (JWT)
      const wcResponse = await fetch(buildWpApiUrl(`/store/v1/orders/${orderId}`), {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
      })

      const data = await wcResponse.json()

      if (!wcResponse.ok) {
        console.error('[Orders API] store/v1 error:', data)
        return NextResponse.json(
          { error: data.message || 'Failed to fetch order' },
          { status: wcResponse.status }
        )
      }

      // store/v1 already returns { order: ... }
      return NextResponse.json(data)
    }

    // Unauthenticated: use store/v1 with order key (for order confirmation)
    const orderKey = request.nextUrl.searchParams.get('key')
    
    if (!orderKey) {
      return NextResponse.json(
        { error: 'Authorization or order key required' },
        { status: 401 }
      )
    }

    const wcResponse = await fetch(buildWpApiUrl(`/store/v1/orders/${orderId}`, { key: orderKey }), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    const data = await wcResponse.json()

    if (!wcResponse.ok) {
      console.error('[Orders API] store/v1 error:', data)
      return NextResponse.json(
        { error: data.message || 'Failed to fetch order' },
        { status: wcResponse.status }
      )
    }

    // store/v1 already returns { order: ... } in the right format
    return NextResponse.json(data)
  } catch (error) {
    console.error('[Orders API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}
