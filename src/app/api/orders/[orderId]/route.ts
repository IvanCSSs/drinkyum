/**
 * Single Order API route
 *
 * Fetches order details from custom store/v1 endpoint
 * Falls back to WC Store API for unauthenticated requests (order confirmation)
 * GET /api/orders/[orderId] - Get order by ID
 */

import { NextRequest, NextResponse } from 'next/server'
import { buildWpApiUrl } from '@/lib/wp-api-url'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params
    const authHeader = request.headers.get('Authorization')

    if (authHeader) {
      // Authenticated: use store/v1 endpoint (JWT)
      const wcResponse = await fetch(buildWpApiUrl(`/store/v1/orders/${orderId}`), {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
      })

      const data = await wcResponse.json()

      if (!wcResponse.ok) {
        console.error('[Orders API] store/v1 error:', data)
        return NextResponse.json(
          { error: data.message || 'Failed to fetch order' },
          { status: wcResponse.status }
        )
      }

      // store/v1 already returns { order: ... }
      return NextResponse.json(data)
    }

    // Unauthenticated: use WC Store API order endpoint (for order confirmation)
    // WC Store API /order/{id} works with the order's cart token or key
    const cookie = request.headers.get('Cookie')
    const nonce = request.headers.get('Nonce')
    const cartToken = request.headers.get('Cart-Token')
    
    const headers: HeadersInit = { 'Content-Type': 'application/json' }
    if (cookie) headers['Cookie'] = cookie
    if (nonce) headers['Nonce'] = nonce
    if (cartToken) headers['Cart-Token'] = cartToken

    const wcResponse = await fetch(buildWpApiUrl(`/wc/store/v1/order/${orderId}`), {
      method: 'GET',
      headers,
    })

    const data = await wcResponse.json()

    if (!wcResponse.ok) {
      console.error('[Orders API] WC Store API error:', data)
      return NextResponse.json(
        { error: data.message || 'Failed to fetch order' },
        { status: wcResponse.status }
      )
    }

    // Transform WC Store API order format to match our frontend format
    const order = {
      id: String(data.id),
      display_id: data.number || data.id,
      status: data.status,
      email: data.billing_address?.email || '',
      currency_code: (data.totals?.currency_code || 'USD').toLowerCase(),
      items: (data.items || []).map((item: Record<string, unknown>) => ({
        id: String(item.id),
        title: item.name,
        thumbnail: (item.images as Array<Record<string, string>>)?.[0]?.src,
        quantity: item.quantity,
        unit_price: parseInt(String(item.prices && (item.prices as Record<string, string>).price || '0'), 10),
        subtotal: parseInt(String(item.totals && (item.totals as Record<string, string>).line_subtotal || '0'), 10),
        total: parseInt(String(item.totals && (item.totals as Record<string, string>).line_total || '0'), 10),
      })),
      subtotal: parseInt(String(data.totals?.total_items || '0'), 10) / 100,
      discount_total: parseInt(String(data.totals?.total_discount || '0'), 10) / 100,
      shipping_total: parseInt(String(data.totals?.total_shipping || '0'), 10) / 100,
      tax_total: parseInt(String(data.totals?.total_tax || '0'), 10) / 100,
      total: parseInt(String(data.totals?.total_price || '0'), 10) / 100,
      shipping_address: data.shipping_address ? {
        first_name: data.shipping_address.first_name,
        last_name: data.shipping_address.last_name,
        address_1: data.shipping_address.address_1,
        address_2: data.shipping_address.address_2 || undefined,
        city: data.shipping_address.city,
        province: data.shipping_address.state,
        postal_code: data.shipping_address.postcode,
        country_code: data.shipping_address.country,
        phone: data.shipping_address.phone || undefined,
      } : undefined,
      billing_address: data.billing_address ? {
        first_name: data.billing_address.first_name,
        last_name: data.billing_address.last_name,
        address_1: data.billing_address.address_1,
        address_2: data.billing_address.address_2 || undefined,
        city: data.billing_address.city,
        province: data.billing_address.state,
        postal_code: data.billing_address.postcode,
        country_code: data.billing_address.country,
        phone: data.billing_address.phone || undefined,
      } : undefined,
      created_at: data.date_created || new Date().toISOString(),
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error('[Orders API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}
