/**
 * Payment Config API proxy route
 *
 * Proxies payment configuration requests to WooCommerce
 * The /wc/v3/payment-config endpoint is public (no auth required)
 * - only exposes public keys (API Login ID, Client Key)
 * - never exposes transaction key
 */

import { NextResponse } from 'next/server'
import { buildWpApiUrl } from '@/lib/wp-api-url'

export async function GET() {
  try {
    const url = buildWpApiUrl('/wc/v3/payment-config')
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    })

    if (!response.ok) {
      console.error('[Payment Config API] WooCommerce error:', response.status, await response.text().catch(() => ''))
      return NextResponse.json(
        { configured: false, enabledProviders: [] },
        { status: 200 } // Return 200 with configured:false so frontend handles gracefully
      )
    }

    const config = await response.json()
    return NextResponse.json(config)
  } catch (error) {
    console.error('[Payment Config API] Error:', error)
    return NextResponse.json(
      { configured: false, enabledProviders: [] },
      { status: 200 }
    )
  }
}
