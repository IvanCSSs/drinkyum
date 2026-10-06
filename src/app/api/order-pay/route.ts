/**
 * Pay-an-existing-order (invoices).
 *
 * GET  /api/order-pay?orderId=..&key=..  -> order summary for the pay page
 * POST /api/order-pay                    -> charge via Accept.js opaque data
 *      { orderId, key, dataDescriptor, dataValue }
 *
 * Backed by the WP endpoint in mu-plugins/headless-invoices.php. The key is
 * the WooCommerce order key from the invoice email link — possession of the
 * link is the auth, same model WooCommerce core uses for order-pay.
 */

import { NextRequest, NextResponse } from 'next/server'
import { buildWpApiUrl } from '@/lib/wp-api-url'

export async function GET(request: NextRequest) {
  const orderId = request.nextUrl.searchParams.get('orderId') || ''
  const key = request.nextUrl.searchParams.get('key') || ''
  if (!/^\d+$/.test(orderId) || !key) {
    return NextResponse.json({ error: 'Missing order reference' }, { status: 400 })
  }
  try {
    const res = await fetch(buildWpApiUrl('/store/v1/order-pay', { order_id: orderId, key }))
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    console.error('[order-pay] summary error:', err)
    return NextResponse.json({ error: 'Could not load order' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { orderId, key, dataDescriptor, dataValue } = await request.json()
    if (!orderId || !key || !dataDescriptor || !dataValue) {
      return NextResponse.json({ error: 'Missing payment data' }, { status: 400 })
    }
    const res = await fetch(buildWpApiUrl('/store/v1/order-pay'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_id: orderId,
        key,
        data_descriptor: dataDescriptor,
        data_value: dataValue,
      }),
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    console.error('[order-pay] charge error:', err)
    return NextResponse.json({ error: 'Payment failed' }, { status: 500 })
  }
}
