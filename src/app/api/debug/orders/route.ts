/**
 * Debug endpoint to inspect orders data
 */

import { NextRequest, NextResponse } from 'next/server'

const WP_URL = process.env.NEXT_PUBLIC_WP_URL || 'https://wordpress-production-7c0a.up.railway.app/drinkyum'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')

  if (!authHeader) {
    return NextResponse.json({ error: 'No auth header' })
  }

  const response = await fetch(
    `${WP_URL}/wp-json/store/v1/orders?limit=1`,
    {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    }
  )

  const data = await response.json()

  return NextResponse.json({
    status: response.status,
    ok: response.ok,
    data,
    firstOrder: data.orders?.[0] || null,
    itemsInFirstOrder: data.orders?.[0]?.items || null,
  })
}
