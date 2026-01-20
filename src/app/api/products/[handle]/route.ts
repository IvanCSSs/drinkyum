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
    const product = await getProductByHandle(handle)

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Also fetch subscription options using the handle (slug) which we know works
    const subscriptionOptions = await getSubscriptionOptions(handle)

    return NextResponse.json({
      product,
      subscriptionOptions,
    })
  } catch (error) {
    console.error('[API] Error fetching product:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}
