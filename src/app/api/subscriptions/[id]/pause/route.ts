import { buildWpApiUrl } from "@/lib/wp-api-url"
/**
 * Pause Subscription API route
 *
 * POST /api/subscriptions/[id]/pause - Pause a subscription
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

    if (!WC_CONSUMER_KEY || !WC_CONSUMER_SECRET) {
      console.error('[Subscription Pause API] WooCommerce credentials not configured')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const response = await fetch(
      buildWpApiUrl(`/wc/v3/subscriptions/${id}/pause`),
      {
        method: 'POST',
        headers: {
          'Authorization': getAuthHeader(),
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[Subscription Pause API] WooCommerce error:', errorText)
      return NextResponse.json(
        { error: 'Failed to pause subscription' },
        { status: response.status }
      )
    }

    const subscription = await response.json()

    return NextResponse.json({ subscription })
  } catch (error) {
    console.error('[Subscription Pause API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to pause subscription' },
      { status: 500 }
    )
  }
}
