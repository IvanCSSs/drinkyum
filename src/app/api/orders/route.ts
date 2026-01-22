/**
 * Orders List API route
 *
 * GET /api/orders - Get customer orders
 * Proxies to WordPress store/v1/orders with JWT auth
 *
 * This route forwards the JWT token to our custom WordPress headless-orders.php
 * plugin which handles authentication and returns the customer's orders.
 */

import { NextRequest, NextResponse } from 'next/server'

const WP_URL = process.env.NEXT_PUBLIC_WP_URL || 'https://wordpress-production-7c0a.up.railway.app/drinkyum'

export async function GET(request: NextRequest) {
  try {
    // Get auth token from request header
    const authHeader = request.headers.get('Authorization')

    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      )
    }

    // Get query params
    const { searchParams } = new URL(request.url)
    const queryString = searchParams.toString()

    // Call our custom headless-orders.php endpoint which uses our own JWT implementation
    // This bypasses the third-party JWT plugin that intercepts all Bearer tokens
    const response = await fetch(
      `${WP_URL}/wp-json/store/v1/orders${queryString ? `?${queryString}` : ''}`,
      {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to fetch orders' }))
      console.error('[Orders API] WordPress error:', errorData)

      // If it's a JWT config error, return a more helpful message
      if (errorData.code === 'jwt_auth_bad_config') {
        return NextResponse.json(
          { error: 'Authentication service unavailable' },
          { status: 503 }
        )
      }

      return NextResponse.json(
        { error: errorData.message || 'Failed to fetch orders' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('[Orders API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}
