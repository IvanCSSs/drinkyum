/**
 * API route to fetch all collections
 *
 * GET /api/collections
 *
 * This proxies the WooCommerce API call so that credentials
 * stay on the server and are not exposed to the client.
 */

import { NextResponse } from 'next/server'
import { getCollections } from '@/lib/wc-products'

export async function GET() {
  try {
    const result = await getCollections({ limit: 50 })
    return NextResponse.json(result)
  } catch (error) {
    console.error('[API] Error fetching collections:', error)
    return NextResponse.json(
      { error: 'Failed to fetch collections', collections: [], count: 0 },
      { status: 500 }
    )
  }
}
