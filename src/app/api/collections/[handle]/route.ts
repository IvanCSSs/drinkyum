/**
 * API route to fetch a single collection by handle
 *
 * GET /api/collections/[handle]
 *
 * This proxies the WooCommerce API call so that credentials
 * stay on the server and are not exposed to the client.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCollectionByHandle } from '@/lib/wc-products'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  try {
    const { handle } = await params
    const collection = await getCollectionByHandle(handle)

    if (!collection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ collection })
  } catch (error) {
    console.error('[API] Error fetching collection:', error)
    return NextResponse.json(
      { error: 'Failed to fetch collection' },
      { status: 500 }
    )
  }
}
