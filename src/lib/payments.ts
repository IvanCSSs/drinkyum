import { buildWpApiUrl } from "./wp-api-url"
/**
 * Payment Methods Management
 *
 * Handles saved payment methods for customers using WooCommerce/Stripe.
 */

import { getCurrentAuthToken } from './auth'

// WordPress API URL
const WP_API_URL = process.env.NEXT_PUBLIC_WP_URL

// Types
export interface PaymentMethod {
  id: string
  customer_id: string
  provider_id: string
  type: 'card' | 'bank_account' | 'paypal'
  is_default: boolean
  data: {
    brand?: string
    last4?: string
    exp_month?: number
    exp_year?: number
    funding?: string
  }
  created_at: string
  updated_at: string
}

export interface SetupIntent {
  client_secret: string
  id: string
}

/**
 * Get headers with auth token
 */
function getAuthHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }
  const token = getCurrentAuthToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

/**
 * Get all saved payment methods for the current customer
 */
export async function getPaymentMethods(): Promise<{
  payment_methods: PaymentMethod[]
}> {
  const response = await fetch(buildWpApiUrl("/store/v1/payment-methods"), {
    method: 'GET',
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch payment methods' }))
    throw new Error(error.message || 'Failed to fetch payment methods')
  }

  return response.json()
}

/**
 * Get Stripe SetupIntent for adding a new card
 */
export async function getSetupIntent(): Promise<SetupIntent> {
  const response = await fetch(buildWpApiUrl("/store/v1/payment-methods/setup-intent"), {
    method: 'POST',
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to create setup intent' }))
    throw new Error(error.message || 'Failed to create setup intent')
  }

  return response.json()
}

/**
 * Add a payment method after SetupIntent confirmation
 * Call this after Stripe.confirmSetupIntent() succeeds
 */
export async function addPaymentMethod(paymentMethodId: string): Promise<{
  payment_method: PaymentMethod
}> {
  const response = await fetch(buildWpApiUrl("/store/v1/payment-methods"), {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ payment_method_id: paymentMethodId }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to add payment method' }))
    throw new Error(error.message || 'Failed to add payment method')
  }

  return response.json()
}

/**
 * Set a payment method as default
 */
export async function setDefaultPaymentMethod(paymentMethodId: string): Promise<{
  payment_method: PaymentMethod
}> {
  const response = await fetch(buildWpApiUrl(`/store/v1/payment-methods/${paymentMethodId}/default`), {
    method: 'POST',
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to set default payment method' }))
    throw new Error(error.message || 'Failed to set default payment method')
  }

  return response.json()
}

/**
 * Remove a payment method
 */
export async function removePaymentMethod(paymentMethodId: string): Promise<void> {
  const response = await fetch(buildWpApiUrl(`/store/v1/payment-methods/${paymentMethodId}`), {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to remove payment method' }))
    throw new Error(error.message || 'Failed to remove payment method')
  }
}

/**
 * Get default payment method
 */
export async function getDefaultPaymentMethod(): Promise<PaymentMethod | null> {
  const { payment_methods } = await getPaymentMethods()
  return payment_methods.find(pm => pm.is_default) || payment_methods[0] || null
}

/**
 * Format card brand for display
 */
export function formatCardBrand(brand?: string): string {
  if (!brand) return 'Card'

  const brands: Record<string, string> = {
    visa: 'Visa',
    mastercard: 'Mastercard',
    amex: 'American Express',
    discover: 'Discover',
    diners: 'Diners Club',
    jcb: 'JCB',
    unionpay: 'UnionPay',
  }

  return brands[brand.toLowerCase()] || brand
}

/**
 * Format card expiration for display
 */
export function formatCardExpiry(expMonth?: number, expYear?: number): string {
  if (!expMonth || !expYear) return ''
  const month = String(expMonth).padStart(2, '0')
  const year = String(expYear).slice(-2)
  return `${month}/${year}`
}

/**
 * Check if card is expired
 */
export function isCardExpired(expMonth?: number, expYear?: number): boolean {
  if (!expMonth || !expYear) return false

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  if (expYear < currentYear) return true
  if (expYear === currentYear && expMonth < currentMonth) return true

  return false
}

/**
 * Get card icon name based on brand
 */
export function getCardIconName(brand?: string): string {
  if (!brand) return 'credit-card'

  const icons: Record<string, string> = {
    visa: 'visa',
    mastercard: 'mastercard',
    amex: 'amex',
    discover: 'discover',
    diners: 'diners',
    jcb: 'jcb',
  }

  return icons[brand.toLowerCase()] || 'credit-card'
}
