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
import { buildWpApiUrl } from '@/lib/wp-api-url'

// Using buildWpApiUrl for compatibility with subdirectory multisite
function getStoreApiUrl(path: string) { return buildWpApiUrl(`/wc/store/v1${path}`) }

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

  // Forward tracking headers for server-side analytics (GA4 MP + Meta CAPI)
  const trackingHeaders = ['X-Client-ID', 'X-Session-ID', 'X-FBP', 'X-FBC', 'X-Event-ID']
  for (const header of trackingHeaders) {
    const value = request.headers.get(header)
    if (value) {
      headers[header] = value
    }
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
    const wcResponse = await fetch(getStoreApiUrl("/cart"), {
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
        const gatewaysResponse = await fetch(getStoreApiUrl("/payment-gateways"), {
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

    const forwardHeaders = getForwardHeaders(request) as Record<string, string>
    const fullUrl = getStoreApiUrl(endpoint)

    const wcResponse = await fetch(fullUrl, {
      method,
      headers: forwardHeaders,
      body: JSON.stringify(payload),
    })

    const data = await wcResponse.json()

    if (!wcResponse.ok) {
      console.error('[Checkout API] WooCommerce error:', {
        status: wcResponse.status,
        code: data?.code,
        message: data?.message,
        fullError: JSON.stringify(data, null, 2),
      })
      // Return detailed error for debugging
      return NextResponse.json({
        ...data,
        _debug: {
          endpoint: fullUrl,
          status: wcResponse.status,
        }
      }, { status: wcResponse.status })
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
