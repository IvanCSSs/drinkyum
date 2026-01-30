/**
 * Subscriptions API route
 *
 * GET /api/subscriptions - Get customer's subscriptions
 * Proxies to WordPress store/v1/subscriptions with JWT auth
 * (Uses custom headless-subscriptions.php mu-plugin, NOT WC REST API)
 */

import { NextRequest, NextResponse } from 'next/server'
import { buildWpApiUrl } from '@/lib/wp-api-url'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')

    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      )
    }

    // Call our custom store/v1/subscriptions endpoint (JWT auth, no WC consumer keys needed)
    const response = await fetch(
      buildWpApiUrl('/store/v1/subscriptions'),
      {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to fetch subscriptions' }))
      console.error('[Subscriptions API] WordPress error:', response.status, errorData)

      return NextResponse.json(
        { error: errorData.message || 'Failed to fetch subscriptions' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('[Subscriptions API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    )
  }
}
