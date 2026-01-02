/**
 * Authentication Functions
 *
 * Handles customer authentication: register, login, logout,
 * password reset, and email verification.
 */

import { medusa } from './medusa-client'

// Types
export interface RegisterData {
  email: string
  password: string
  first_name: string
  last_name: string
  phone?: string
}

export interface Customer {
  id: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  has_account: boolean
  metadata?: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface AuthResponse {
  token?: string
  customer?: Customer
}

/**
 * Register a new customer account
 */
export async function registerCustomer(data: RegisterData): Promise<AuthResponse> {
  const response = await medusa.post<AuthResponse>('/store/auth/register', data)

  if (response.token) {
    medusa.setAuthToken(response.token)
  }

  return response
}

/**
 * Login with email and password
 */
export async function loginCustomer(email: string, password: string): Promise<AuthResponse> {
  const response = await medusa.post<AuthResponse>('/store/auth/login', { email, password })

  if (response.token) {
    medusa.setAuthToken(response.token)
  }

  return response
}

/**
 * Logout current customer
 */
export async function logoutCustomer(): Promise<void> {
  try {
    await medusa.post('/store/auth/logout')
  } finally {
    medusa.setAuthToken(null)
  }
}

/**
 * Get current authenticated customer
 */
export async function getCustomer(): Promise<{ customer: Customer }> {
  return medusa.get<{ customer: Customer }>('/store/customers/me')
}

/**
 * Update customer profile
 */
export async function updateCustomer(data: {
  first_name?: string
  last_name?: string
  phone?: string
  metadata?: Record<string, unknown>
}): Promise<{ customer: Customer }> {
  return medusa.patch<{ customer: Customer }>('/store/customers/me', data)
}

/**
 * Change customer password
 */
export async function changePassword(
  oldPassword: string,
  newPassword: string
): Promise<void> {
  await medusa.post('/store/customers/me/password', {
    old_password: oldPassword,
    new_password: newPassword,
  })
}

/**
 * Request password reset email
 */
export async function requestPasswordReset(email: string): Promise<void> {
  await medusa.post('/store/auth/password-reset', { email })
}

/**
 * Confirm password reset with token from email
 */
export async function confirmPasswordReset(
  token: string,
  password: string
): Promise<void> {
  await medusa.post('/store/auth/password-reset/confirm', { token, password })
}

/**
 * Verify email with token from email link
 */
export async function verifyEmail(token: string): Promise<void> {
  await medusa.post('/store/auth/verify-email', { token })
}

/**
 * Request new verification email
 */
export async function resendVerificationEmail(): Promise<void> {
  await medusa.post('/store/auth/verify-email/resend')
}

/**
 * Get customer account summary (orders, subscriptions, etc.)
 */
export async function getAccountSummary(): Promise<{
  orders_count: number
  subscriptions_count: number
  total_spent: number
}> {
  return medusa.get('/store/account/me/summary')
}

/**
 * Check if user is currently authenticated
 */
export function isAuthenticated(): boolean {
  return medusa.isAuthenticated()
}
