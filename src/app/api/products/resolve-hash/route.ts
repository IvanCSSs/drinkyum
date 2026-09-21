/**
 * Resolve an obfuscated product id back to its numeric WooCommerce id.
 *
 * Product URLs use md5(numericId) as an opaque handle. Abandoned-cart records
 * (before 2026-09-21) stored that hash as `product_id`, which CoCart cannot
 * resolve — so every recovery link added zero items and dropped the customer on
 * an empty checkout. MD5 is one-way, so we hash each catalog id and match.
 *
 * GET /api/products/resolve-hash?hash=<md5>  ->  { id: "1674" } | 404
 */

import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { getProducts } from '@/lib/wc-products'

export async function GET(request: NextRequest) {
  const hash = (request.nextUrl.searchParams.get('hash') || '').toLowerCase()
  if (!/^[a-f0-9]{32}$/.test(hash)) {
    return NextResponse.json({ error: 'invalid hash' }, { status: 400 })
  }

  try {
    const result = await getProducts({ limit: 250 })
    const products = (result?.products || []) as Array<{
      id?: string | number
      variants?: Array<{ id?: string | number }>
    }>

    for (const p of products) {
      const candidates: Array<string | number | undefined> = [
        p?.id,
        ...((p?.variants || []).map(v => v?.id)),
      ]
      for (const c of candidates) {
        if (c == null) continue
        const num = String(c)
        if (!/^\d+$/.test(num)) continue
        if (createHash('md5').update(num).digest('hex') === hash) {
          return NextResponse.json({ id: num })
        }
      }
    }
    return NextResponse.json({ error: 'not found' }, { status: 404 })
  } catch (err) {
    console.error('[resolve-hash] error:', err)
    return NextResponse.json({ error: 'lookup failed' }, { status: 500 })
  }
}
