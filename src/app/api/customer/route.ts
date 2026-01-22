/**
 * Customer API route
 *
 * GET /api/customer - Get current customer
 * PATCH /api/customer - Update customer profile
 * Proxies to WordPress auth/v1/me with JWT auth
 */

import { NextRequest, NextResponse } from 'next/server'

const WP_URL = process.env.NEXT_PUBLIC_WP_URL || 'https://wordpress-production-7c0a.up.railway.app/drinkyum'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')

    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      )
    }

    const response = await fetch(
      `${WP_URL}/wp-json/auth/v1/me`,
      {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to fetch customer' }))
      console.error('[Customer API] WordPress error:', errorData)

      if (errorData.code === 'jwt_auth_bad_config') {
        return NextResponse.json(
          { error: 'Authentication service unavailable' },
          { status: 503 }
        )
      }

      return NextResponse.json(
        { error: errorData.message || 'Failed to fetch customer' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('[Customer API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customer' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')

    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      )
    }

    const body = await request.json()

    const response = await fetch(
      `${WP_URL}/wp-json/auth/v1/me`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to update customer' }))
      return NextResponse.json(
        { error: errorData.message || 'Failed to update customer' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('[Customer API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to update customer' },
      { status: 500 }
    )
  }
}
