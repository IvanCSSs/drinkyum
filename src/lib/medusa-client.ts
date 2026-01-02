/**
 * Medusa API Client
 *
 * Handles all API communication with the Medusa multistore backend.
 * Automatically includes tenant identification headers and auth tokens.
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'
const TENANT_SLUG = process.env.NEXT_PUBLIC_TENANT_SLUG || 'drinkyum'

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
  code?: string
}

export interface MedusaError {
  message: string
  code?: string
  type?: string
  details?: Record<string, unknown>
}

class MedusaClient {
  private authToken: string | null = null

  constructor() {
    // Load token from localStorage on init (client-side only)
    if (typeof window !== 'undefined') {
      this.authToken = localStorage.getItem('medusa_auth_token')
    }
  }

  /**
   * Set or clear the authentication token
   */
  setAuthToken(token: string | null) {
    this.authToken = token
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('medusa_auth_token', token)
      } else {
        localStorage.removeItem('medusa_auth_token')
      }
    }
  }

  /**
   * Get the current auth token
   */
  getAuthToken(): string | null {
    return this.authToken
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.authToken
  }

  /**
   * Build request headers with tenant ID and optional auth token
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'X-Tenant-ID': TENANT_SLUG,
    }
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`
    }
    return headers
  }

  /**
   * Make a GET request
   */
  async get<T>(path: string): Promise<T> {
    const res = await fetch(`${BACKEND_URL}${path}`, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Request failed' }))
      throw new Error(error.message || `HTTP ${res.status}`)
    }

    return res.json()
  }

  /**
   * Make a POST request
   */
  async post<T>(path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${BACKEND_URL}${path}`, {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include',
      body: body ? JSON.stringify(body) : undefined,
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Request failed' }))
      throw new Error(error.message || `HTTP ${res.status}`)
    }

    return res.json()
  }

  /**
   * Make a PATCH request
   */
  async patch<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${BACKEND_URL}${path}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Request failed' }))
      throw new Error(error.message || `HTTP ${res.status}`)
    }

    return res.json()
  }

  /**
   * Make a DELETE request
   */
  async delete<T>(path: string): Promise<T> {
    const res = await fetch(`${BACKEND_URL}${path}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
      credentials: 'include',
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Request failed' }))
      throw new Error(error.message || `HTTP ${res.status}`)
    }

    return res.json()
  }
}

// Singleton instance
export const medusa = new MedusaClient()

/**
 * Wrapper for API calls with error handling
 */
export async function apiCall<T>(
  fn: () => Promise<T>
): Promise<{ data?: T; error?: MedusaError }> {
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
