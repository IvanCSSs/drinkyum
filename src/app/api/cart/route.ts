/**
 * Cart API proxy route
 *
 * Proxies cart requests to WooCommerce Store API
 * This avoids CORS issues by making server-to-server requests
 *
 * GET /api/cart - Get current cart
 * POST /api/cart - Various cart operations (add, update, remove)
 */

import { NextRequest, NextResponse } from 'next/server'

const WC_URL = process.env.NEXT_PUBLIC_WP_URL || 'https://wordpress-production-7c0a.up.railway.app/drinkyum'
const STORE_API_BASE = `${WC_URL}/wp-json/wc/store/v1`

// Forward headers from client to WooCommerce
function getForwardHeaders(request: NextRequest): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }

  // Forward cart token if present
  const cartToken = request.headers.get('Cart-Token')
  if (cartToken) {
    headers['Cart-Token'] = cartToken
  }

  // Forward nonce if present
  const nonce = request.headers.get('Nonce')
  if (nonce) {
    headers['Nonce'] = nonce
  }

  return headers
}

// Copy response headers from WooCommerce to our response
function buildResponse(wcResponse: Response, data: unknown): NextResponse {
  const response = NextResponse.json(data)

  // Forward Cart-Token and Nonce headers
  const cartToken = wcResponse.headers.get('Cart-Token')
  if (cartToken) {
    response.headers.set('Cart-Token', cartToken)
  }

  const nonce = wcResponse.headers.get('Nonce')
  if (nonce) {
    response.headers.set('Nonce', nonce)
  }

  return response
}

export async function GET(request: NextRequest) {
  try {
    const wcResponse = await fetch(`${STORE_API_BASE}/cart`, {
      method: 'GET',
      headers: getForwardHeaders(request),
    })

    const data = await wcResponse.json()

    if (!wcResponse.ok) {
      return NextResponse.json(data, { status: wcResponse.status })
    }

    return buildResponse(wcResponse, data)
  } catch (error) {
    console.error('[Cart API] Error fetching cart:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...payload } = body

    let endpoint = '/cart'
    let baseUrl = STORE_API_BASE

    switch (action) {
      case 'add-item':
        endpoint = '/cart/add-item'
        break
      case 'add-subscription':
        // Use the standard add-item endpoint - the Subscribe & Save plugin's
        // woocommerce_add_cart_item_data filter will pick up subscribe_save_period
        // and subscribe_save_interval from the request body
        endpoint = '/cart/add-item'
        break
      case 'update-item':
        endpoint = '/cart/update-item'
        break
      case 'remove-item':
        endpoint = '/cart/remove-item'
        break
      case 'update-customer':
        endpoint = '/cart/update-customer'
        break
      case 'apply-coupon':
        endpoint = '/cart/apply-coupon'
        break
      case 'remove-coupon':
        endpoint = '/cart/remove-coupon'
        break
      case 'select-shipping-rate':
        endpoint = '/cart/select-shipping-rate'
        break
      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }

    console.log(`[Cart API] ${action} request to ${endpoint}`, { payload })

    const wcResponse = await fetch(`${baseUrl}${endpoint}`, {
      method: 'POST',
      headers: getForwardHeaders(request),
      body: JSON.stringify(payload),
    })

    const data = await wcResponse.json()

    console.log(`[Cart API] ${action} response:`, { status: wcResponse.status, data })

    if (!wcResponse.ok) {
      return NextResponse.json(data, { status: wcResponse.status })
    }

    return buildResponse(wcResponse, data)
  } catch (error) {
    console.error('[Cart API] Error:', error)
    return NextResponse.json(
      { error: 'Cart operation failed' },
      { status: 500 }
    )
  }
}
