/**
 * Resolve an obfuscated product id back to its numeric WooCommerce id.
 *
 * Product URLs use md5(numericId) as an opaque handle. Abandoned-cart records
 * (before 2026-09-21) stored that hash as `product_id`, which CoCart cannot
 * resolve — so every recovery link added zero items and dropped the customer on
 * an empty checkout. MD5 is one-way, so we hash candidate ids and match.
 *
 * Candidates come from the WooCommerce REST API rather than the storefront
 * catalog, because hidden products (free samples have catalog_visibility
 * "hidden") are exactly the ones that end up in these carts.
 *
 * GET /api/products/resolve-hash?hash=<md5>  ->  { id: "1674" } | 404
 */

import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { buildWpApiUrl } from '@/lib/wp-api-url'

const md5 = (s: string) => createHash('md5').update(s).digest('hex')

export async function GET(request: NextRequest) {
  const hash = (request.nextUrl.searchParams.get('hash') || '').toLowerCase()
  if (!/^[a-f0-9]{32}$/.test(hash)) {
    return NextResponse.json({ error: 'invalid hash' }, { status: 400 })
  }

  const key = process.env.WC_CONSUMER_KEY
  const secret = process.env.WC_CONSUMER_SECRET
  if (!key || !secret) {
    return NextResponse.json({ error: 'not configured' }, { status: 500 })
  }
  const auth = 'Basic ' + Buffer.from(`${key}:${secret}`).toString('base64')

  try {
    // Walk published products (including hidden ones) until the hash matches.
    for (let page = 1; page <= 5; page++) {
      const url = buildWpApiUrl('/wc/v3/products', {
        per_page: 100,
        page,
        status: 'publish',
        _fields: 'id,variations',
      })
      const res = await fetch(url, { headers: { Authorization: auth } })
      if (!res.ok) break
      const items = (await res.json()) as Array<{ id?: number; variations?: number[] }>
      if (!Array.isArray(items) || items.length === 0) break

      for (const p of items) {
        if (p?.id != null && md5(String(p.id)) === hash) {
          return NextResponse.json({ id: String(p.id) })
        }
        for (const v of p?.variations || []) {
          if (md5(String(v)) === hash) return NextResponse.json({ id: String(v) })
        }
      }
      if (items.length < 100) break
    }
    return NextResponse.json({ error: 'not found' }, { status: 404 })
  } catch (err) {
    console.error('[resolve-hash] error:', err)
    return NextResponse.json({ error: 'lookup failed' }, { status: 500 })
  }
}
