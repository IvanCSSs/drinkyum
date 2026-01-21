/**
 * Payment Config API proxy route
 *
 * Proxies payment configuration requests to WooCommerce
 * This avoids CORS issues by making server-to-server requests
 */

import { NextResponse } from 'next/server'

const WC_URL = process.env.NEXT_PUBLIC_WP_URL || 'https://wordpress-production-7c0a.up.railway.app/drinkyum'
const WC_CONSUMER_KEY = process.env.WC_CONSUMER_KEY
const WC_CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET

export async function GET() {
  try {
    // Build auth header for WooCommerce REST API
    const auth = Buffer.from(`${WC_CONSUMER_KEY}:${WC_CONSUMER_SECRET}`).toString('base64')

    const response = await fetch(`${WC_URL}/wp-json/wc/v3/payment-config`, {
      headers: {
        'Authorization': `Basic ${auth}`,
      },
    })

    if (!response.ok) {
      console.error('[Payment Config API] WooCommerce error:', response.status)
      return NextResponse.json(
        { configured: false, enabledProviders: [] },
        { status: response.status }
      )
    }

    const config = await response.json()
    return NextResponse.json(config)
  } catch (error) {
    console.error('[Payment Config API] Error:', error)
    return NextResponse.json(
      { configured: false, enabledProviders: [] },
      { status: 500 }
    )
  }
}
