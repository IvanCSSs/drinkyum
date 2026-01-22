/**
 * Cancel Subscription API route
 *
 * POST /api/subscriptions/[id]/cancel - Cancel a subscription
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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json().catch(() => ({}))

    if (!WC_CONSUMER_KEY || !WC_CONSUMER_SECRET) {
      console.error('[Subscription Cancel API] WooCommerce credentials not configured')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const response = await fetch(
      `${WC_URL}/wp-json/wc/v3/subscriptions/${id}/cancel`,
      {
        method: 'POST',
        headers: {
          'Authorization': getAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[Subscription Cancel API] WooCommerce error:', errorText)
      return NextResponse.json(
        { error: 'Failed to cancel subscription' },
        { status: response.status }
      )
    }

    const subscription = await response.json()

    return NextResponse.json({ subscription })
  } catch (error) {
    console.error('[Subscription Cancel API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}
