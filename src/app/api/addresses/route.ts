/**
 * Addresses List API route
 *
 * GET /api/addresses - Get customer addresses
 * POST /api/addresses - Add new address
 * Proxies to WordPress store/v1/addresses with JWT auth
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
      `${WP_URL}/wp-json/store/v1/addresses`,
      {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to fetch addresses' }))
      console.error('[Addresses API] WordPress error:', errorData)

      if (errorData.code === 'jwt_auth_bad_config') {
        return NextResponse.json(
          { error: 'Authentication service unavailable' },
          { status: 503 }
        )
      }

      return NextResponse.json(
        { error: errorData.message || 'Failed to fetch addresses' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('[Addresses API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch addresses' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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
      `${WP_URL}/wp-json/store/v1/addresses`,
      {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to add address' }))
      console.error('[Addresses API] WordPress error:', errorData)

      return NextResponse.json(
        { error: errorData.message || 'Failed to add address' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('[Addresses API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to add address' },
      { status: 500 }
    )
  }
}
