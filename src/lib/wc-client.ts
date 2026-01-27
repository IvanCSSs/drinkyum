/**
 * WooCommerce API Client
 *
 * Handles all API communication with the WordPress/WooCommerce backend.
 * Uses OAuth 1.0a authentication with consumer key/secret.
 */

const WC_URL = process.env.NEXT_PUBLIC_WP_URL || 'https://wordpress-production-7c0a.up.railway.app/drinkyum'
const WC_CONSUMER_KEY = process.env.WC_CONSUMER_KEY || ''
const WC_CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET || ''

export interface WCError {
  message: string
  code?: string
  data?: {
    status?: number
    [key: string]: unknown
  }
}

/**
 * Build Basic Auth header for WooCommerce REST API
 * WooCommerce uses Basic Auth over HTTPS with consumer key/secret
 */
function buildAuthHeader(): string {
  if (!WC_CONSUMER_KEY || !WC_CONSUMER_SECRET) {
    return ''
  }
  const credentials = Buffer.from(`${WC_CONSUMER_KEY}:${WC_CONSUMER_SECRET}`).toString('base64')
  return `Basic ${credentials}`
}

class WooCommerceClient {
  private siteUrl: string

  constructor() {
    // Base site URL (without /wp-json)
    this.siteUrl = WC_URL
  }

  /**
   * Build full API URL using rest_route query parameter
   * This bypasses permalink issues with WordPress multisite subdirectories
   */
  private buildUrl(path: string): string {
    // Use ?rest_route= format for compatibility with subdirectory multisite
    const restPath = `/wc/v3${path}`
    return `${this.siteUrl}?rest_route=${encodeURIComponent(restPath)}`
  }

  /**
   * Build request headers
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    const authHeader = buildAuthHeader()
    if (authHeader) {
      headers['Authorization'] = authHeader
    }

    return headers
  }

  /**
   * Make a GET request to WooCommerce API
   */
  async get<T>(path: string): Promise<T> {
    const url = this.buildUrl(path)

    const res = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
      // WooCommerce doesn't use cookies for API auth
      cache: 'no-store',
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Request failed' }))
      throw new Error(error.message || `HTTP ${res.status}`)
    }

    return res.json()
  }

  /**
   * Make a POST request to WooCommerce API
   */
  async post<T>(path: string, body?: unknown): Promise<T> {
    const url = this.buildUrl(path)

    const res = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Request failed' }))
      throw new Error(error.message || `HTTP ${res.status}`)
    }

    return res.json()
  }

  /**
   * Make a PUT request to WooCommerce API
   */
  async put<T>(path: string, body: unknown): Promise<T> {
    const url = this.buildUrl(path)

    const res = await fetch(url, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Request failed' }))
      throw new Error(error.message || `HTTP ${res.status}`)
    }

    return res.json()
  }

  /**
   * Make a DELETE request to WooCommerce API
   */
  async delete<T>(path: string): Promise<T> {
    const url = this.buildUrl(path)

    const res = await fetch(url, {
      method: 'DELETE',
      headers: this.getHeaders(),
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Request failed' }))
      throw new Error(error.message || `HTTP ${res.status}`)
    }

    return res.json()
  }

  /**
   * Check if API credentials are configured
   */
  isConfigured(): boolean {
    return !!(WC_CONSUMER_KEY && WC_CONSUMER_SECRET)
  }

  /**
   * Get base URL for debugging
   */
  getBaseUrl(): string {
    return this.siteUrl
  }
}

// Singleton instance
export const woocommerce = new WooCommerceClient()

/**
 * Wrapper for API calls with error handling
 */
export async function wcApiCall<T>(
  fn: () => Promise<T>
): Promise<{ data?: T; error?: WCError }> {
  try {
    const data = await fn()
    return { data }
  } catch (error: unknown) {
    const err = error as Error
    return {
      error: {
        message: err.message || 'An error occurred',
      },
    }
  }
}
