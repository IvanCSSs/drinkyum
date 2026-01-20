/**
 * Checkout API proxy route
 *
 * Proxies checkout requests to WooCommerce Store API
 * This avoids CORS issues by making server-to-server requests
 *
 * GET /api/checkout - Get current checkout state (cart with totals)
 * POST /api/checkout - Various checkout operations
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
function buildResponse(wcResponse: Response, data: unknown, status?: number): NextResponse {
  const response = NextResponse.json(data, { status: status || wcResponse.status })

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

/**
 * GET /api/checkout - Get current checkout state
 * Returns cart data with calculated shipping and totals
 */
export async function GET(request: NextRequest) {
  try {
    // Get cart data (which includes checkout-ready info)
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
    console.error('[Checkout API] Error fetching checkout state:', error)
    return NextResponse.json(
      { error: 'Failed to fetch checkout state' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/checkout - Handle checkout operations
 *
 * Actions:
 * - update-customer: Update billing/shipping address and email
 * - select-shipping-rate: Select a shipping method
 * - complete: Process payment and complete checkout
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...payload } = body

    let endpoint = '/checkout'
    let method = 'POST'

    switch (action) {
      case 'update-customer':
        // Update customer info (email, addresses) via cart endpoint
        endpoint = '/cart/update-customer'
        break

      case 'select-shipping-rate':
        // Select shipping method
        endpoint = '/cart/select-shipping-rate'
        break

      case 'complete':
        // Complete checkout - this is the main checkout endpoint
        // WooCommerce Store API expects payment data in the request
        endpoint = '/checkout'
        break

      case 'get-payment-gateways':
        // List available payment gateways
        const gatewaysResponse = await fetch(`${STORE_API_BASE}/payment-gateways`, {
          method: 'GET',
          headers: getForwardHeaders(request),
        })
        const gateways = await gatewaysResponse.json()
        return buildResponse(gatewaysResponse, gateways)

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }

    const wcResponse = await fetch(`${STORE_API_BASE}${endpoint}`, {
      method,
      headers: getForwardHeaders(request),
      body: JSON.stringify(payload),
    })

    const data = await wcResponse.json()

    if (!wcResponse.ok) {
      console.error('[Checkout API] WooCommerce error:', data)
      return NextResponse.json(data, { status: wcResponse.status })
    }

    return buildResponse(wcResponse, data)
  } catch (error) {
    console.error('[Checkout API] Error:', error)
    return NextResponse.json(
      { error: 'Checkout operation failed' },
      { status: 500 }
    )
  }
}
