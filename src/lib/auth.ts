/**
 * Authentication Functions
 *
 * Handles customer authentication: register, login, logout,
 * password reset, and profile management.
 *
 * Uses WooCommerce/WordPress backend with JWT authentication.
 */

// Types
export interface RegisterData {
  email: string
  password: string
  first_name: string
  last_name: string
  phone?: string
}

export interface Customer {
  id: number | string
  email: string
  first_name: string
  last_name: string
  phone?: string
  has_account: boolean
  billing?: {
    first_name: string
    last_name: string
    email: string
    phone: string
    address_1: string
    address_2: string
    city: string
    state: string
    postcode: string
    country: string
  }
  shipping?: {
    first_name: string
    last_name: string
    address_1: string
    address_2: string
    city: string
    state: string
    postcode: string
    country: string
  }
  created_at: string
  updated_at: string
}

export interface AuthResponse {
  token?: string
  customer?: Customer
}

// WordPress API URL
const WP_API_URL = process.env.NEXT_PUBLIC_WP_URL

// Auth token storage key
const AUTH_TOKEN_KEY = 'wp_auth_token'

/**
 * Get auth token from localStorage
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

/**
 * Set auth token in localStorage
 */
function setAuthToken(token: string | null): void {
  if (typeof window === 'undefined') return
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token)
  } else {
    localStorage.removeItem(AUTH_TOKEN_KEY)
  }
}

/**
 * Get headers with auth token
 */
function getAuthHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }
  const token = getAuthToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

/**
 * Register a new customer account
 */
export async function registerCustomer(data: RegisterData): Promise<AuthResponse> {
  const response = await fetch(`${WP_API_URL}/wp-json/auth/v1/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Registration failed' }))
    throw new Error(error.message || 'Registration failed')
  }

  const result = await response.json()

  if (result.token) {
    setAuthToken(result.token)
  }

  return result
}

/**
 * Login with email and password
 */
export async function loginCustomer(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${WP_API_URL}/wp-json/auth/v1/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Login failed' }))
    throw new Error(error.message || 'Invalid email or password')
  }

  const result = await response.json()

  if (result.token) {
    setAuthToken(result.token)
  }

  return result
}

/**
 * Logout current customer
 */
export async function logoutCustomer(): Promise<void> {
  try {
    const token = getAuthToken()
    if (token) {
      await fetch(`${WP_API_URL}/wp-json/auth/v1/logout`, {
        method: 'POST',
        headers: getAuthHeaders(),
      })
    }
  } finally {
    setAuthToken(null)
  }
}

/**
 * Get current authenticated customer
 */
export async function getCustomer(): Promise<{ customer: Customer }> {
  const response = await fetch(`/api/customer`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to get customer' }))
    throw new Error(error.message || 'Not authenticated')
  }

  return response.json()
}

/**
 * Update customer profile
 */
export async function updateCustomer(data: {
  first_name?: string
  last_name?: string
  phone?: string
}): Promise<{ customer: Customer }> {
  const response = await fetch(`/api/customer`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Update failed' }))
    throw new Error(error.message || 'Failed to update profile')
  }

  return response.json()
}

/**
 * Change customer password
 */
export async function changePassword(
  oldPassword: string,
  newPassword: string
): Promise<void> {
  const response = await fetch(`${WP_API_URL}/wp-json/auth/v1/change-password`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      old_password: oldPassword,
      new_password: newPassword,
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Password change failed' }))
    throw new Error(error.message || 'Failed to change password')
  }
}

/**
 * Request password reset email (WooCommerce)
 */
export async function requestPasswordReset(email: string): Promise<void> {
  const response = await fetch(`${WP_API_URL}/wp-json/auth/v1/password-reset/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })

  if (!response.ok) {
    throw new Error('Failed to request password reset')
  }
}

/**
 * Confirm password reset with token from email (WooCommerce)
 * Note: WordPress requires both token AND email to verify the reset key
 */
export async function confirmPasswordReset(
  token: string,
  password: string,
  email?: string
): Promise<void> {
  if (!email) {
    throw new Error('Email is required for password reset')
  }

  const response = await fetch(`${WP_API_URL}/wp-json/auth/v1/password-reset/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password, email }),
  })

  if (!response.ok) {
    throw new Error('Invalid or expired reset link')
  }
}

/**
 * Refresh auth token
 */
export async function refreshToken(): Promise<AuthResponse> {
  const response = await fetch(`${WP_API_URL}/wp-json/auth/v1/refresh`, {
    method: 'POST',
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    setAuthToken(null)
    throw new Error('Session expired')
  }

  const result = await response.json()

  if (result.token) {
    setAuthToken(result.token)
  }

  return result
}

/**
 * Check if user is currently authenticated
 */
export function isAuthenticated(): boolean {
  return !!getAuthToken()
}

/**
 * Get the current auth token (for use in other API calls)
 */
export function getCurrentAuthToken(): string | null {
  return getAuthToken()
}

// ============================================================================
// Account Summary & Email Verification
// These are placeholder implementations - update when backend endpoints exist
// ============================================================================

export interface AccountSummary {
  orders_count: number
  subscriptions_count: number
  total_spent: number
  addresses_count?: number
  recent_orders?: Array<{
    id: string
    created_at: string
    total: number
    status: string
  }>
}

/**
 * Get account summary (orders count, subscriptions, etc.)
 * Calculates summary from orders and subscriptions APIs
 */
export async function getAccountSummary(): Promise<AccountSummary> {
  try {
    // Fetch orders and subscriptions in parallel
    const [ordersResponse, subscriptionsResponse] = await Promise.all([
      fetch('/api/orders', {
        method: 'GET',
        headers: getAuthHeaders(),
      }),
      fetch('/api/subscriptions', {
        method: 'GET',
        headers: getAuthHeaders(),
      }),
    ])

    // Parse responses
    const ordersData = ordersResponse.ok ? await ordersResponse.json() : { orders: [] }
    const subscriptionsData = subscriptionsResponse.ok ? await subscriptionsResponse.json() : { subscriptions: [] }

    const orders = ordersData.orders || []
    const subscriptions = subscriptionsData.subscriptions || []

    // Calculate total spent from orders
    const totalSpent = orders.reduce((sum: number, order: any) => {
      return sum + parseFloat(order.total || 0)
    }, 0)

    // Count active subscriptions (status: active, pending, or on-hold)
    const activeSubscriptions = subscriptions.filter((sub: any) =>
      ['active', 'pending', 'on-hold'].includes(sub.status)
    )

    return {
      orders_count: orders.length,
      subscriptions_count: activeSubscriptions.length,
      total_spent: totalSpent,
      addresses_count: 0, // Not calculated here
      recent_orders: orders.slice(0, 5),
    }
  } catch (error) {
    console.error('Failed to fetch account summary:', error)
    // Return zeros on error
    return {
      orders_count: 0,
      subscriptions_count: 0,
      total_spent: 0,
      addresses_count: 0,
      recent_orders: [],
    }
  }
}

/**
 * Verify email with token
 * Note: WordPress doesn't require email verification by default
 * This is a stub for compatibility
 */
export async function verifyEmail(_token: string): Promise<void> {
  // WordPress doesn't use email verification by default
  // This is a no-op for compatibility
  return
}

/**
 * Resend verification email
 * Note: WordPress doesn't require email verification by default
 * This is a stub for compatibility
 */
export async function resendVerificationEmail(_email?: string): Promise<void> {
  // WordPress doesn't use email verification by default
  // This is a no-op for compatibility
  return
}
