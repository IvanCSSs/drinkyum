/**
 * API route to fetch products list
 *
 * GET /api/products?limit=10&collection_id=15&q=search
 *
 * This proxies the WooCommerce API call so that credentials
 * stay on the server and are not exposed to the client.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getProducts } from '@/lib/wc-products'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  const limit = searchParams.get('limit')
  const collection_id = searchParams.get('collection_id')
  const q = searchParams.get('q')
  const offset = searchParams.get('offset')

  try {
    const result = await getProducts({
      limit: limit ? parseInt(limit, 10) : undefined,
      collection_id: collection_id || undefined,
      q: q || undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('[API] Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products', products: [], count: 0 },
      { status: 500 }
    )
  }
}
