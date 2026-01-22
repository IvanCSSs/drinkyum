/**
 * Change Subscription Frequency API route
 *
 * POST /api/subscriptions/[id]/frequency - Change billing frequency
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
    const body = await request.json()

    if (!WC_CONSUMER_KEY || !WC_CONSUMER_SECRET) {
      console.error('[Subscription Frequency API] WooCommerce credentials not configured')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Body should contain: { billing_period, billing_interval }
    const response = await fetch(
      `${WC_URL}/wp-json/wc/v3/subscriptions/${id}/frequency`,
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
      console.error('[Subscription Frequency API] WooCommerce error:', errorText)
      return NextResponse.json(
        { error: 'Failed to change frequency' },
        { status: response.status }
      )
    }

    const subscription = await response.json()

    return NextResponse.json({ subscription })
  } catch (error) {
    console.error('[Subscription Frequency API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to change frequency' },
      { status: 500 }
    )
  }
}
