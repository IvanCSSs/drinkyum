/**
 * API route to fetch a single product by handle (slug)
 *
 * GET /api/products/[handle]
 *
 * This proxies the WooCommerce API call so that credentials
 * stay on the server and are not exposed to the client.
 */

import { NextResponse } from 'next/server'
import { getProductByHandle, getSubscriptionOptions } from '@/lib/wc-products'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params

  try {
    // Fetch product + subscription options in parallel (was sequential —
    // each is a ~2s WP round-trip, so this ~halves the uncached latency).
    const [product, subscriptionOptions] = await Promise.all([
      getProductByHandle(handle),
      getSubscriptionOptions(handle),
    ])

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Edge-cache the response: product data is stable, so serve cached for
    // 5 min and revalidate in the background for up to an hour. Repeat hits
    // (the common case for paid-click landings) return instantly without a
    // WP round-trip. Cache-only — never changes the data returned.
    return NextResponse.json(
      { product, subscriptionOptions },
      {
        headers: {
          'Cache-Control':
            'public, s-maxage=300, stale-while-revalidate=3600',
        },
      }
    )
  } catch (error) {
    console.error('[API] Error fetching product:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}
