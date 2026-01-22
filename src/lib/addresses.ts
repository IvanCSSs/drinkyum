/**
 * Address Management Functions
 *
 * Handles customer address CRUD operations for shipping
 * and billing addresses using WooCommerce backend.
 */

import { getCurrentAuthToken } from './auth'

// WordPress API URL
const WP_API_URL = process.env.NEXT_PUBLIC_WP_URL

// Types
export interface Address {
  id: string
  customer_id: string
  first_name: string
  last_name: string
  company?: string
  address_1: string
  address_2?: string
  city: string
  province: string
  postal_code: string
  country_code: string
  phone?: string
  is_default_shipping: boolean
  is_default_billing: boolean
  metadata?: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface AddressInput {
  first_name: string
  last_name: string
  company?: string
  address_1: string
  address_2?: string
  city: string
  province: string
  postal_code: string
  country_code: string
  phone?: string
  is_default_shipping?: boolean
  is_default_billing?: boolean
  metadata?: Record<string, unknown>
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
 * Get all addresses for the current customer
 */
export async function getAddresses(): Promise<{
  addresses: Address[]
}> {
  const response = await fetch(`/api/addresses`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch addresses' }))
    throw new Error(error.message || 'Failed to fetch addresses')
  }

  return response.json()
}

/**
 * Get a single address by ID
 */
export async function getAddress(addressId: string): Promise<{
  address: Address
}> {
  const response = await fetch(`/api/addresses/${addressId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Address not found' }))
    throw new Error(error.message || 'Address not found')
  }

  return response.json()
}

/**
 * Add a new address
 */
export async function addAddress(address: AddressInput): Promise<{
  address: Address
}> {
  const response = await fetch(`/api/addresses`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(address),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to add address' }))
    throw new Error(error.message || 'Failed to add address')
  }

  return response.json()
}

/**
 * Update an existing address
 */
export async function updateAddress(
  addressId: string,
  data: Partial<AddressInput>
): Promise<{
  address: Address
}> {
  const response = await fetch(`/api/addresses/${addressId}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to update address' }))
    throw new Error(error.message || 'Failed to update address')
  }

  return response.json()
}

/**
 * Delete an address
 */
export async function deleteAddress(addressId: string): Promise<void> {
  const response = await fetch(`/api/addresses/${addressId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to delete address' }))
    throw new Error(error.message || 'Failed to delete address')
  }
}

/**
 * Set address as default shipping
 */
export async function setDefaultShipping(addressId: string): Promise<{
  address: Address
}> {
  return updateAddress(addressId, { is_default_shipping: true })
}

/**
 * Set address as default billing
 */
export async function setDefaultBilling(addressId: string): Promise<{
  address: Address
}> {
  return updateAddress(addressId, { is_default_billing: true })
}

/**
 * Get default shipping address
 */
export async function getDefaultShippingAddress(): Promise<Address | null> {
  const { addresses } = await getAddresses()
  return addresses.find(a => a.is_default_shipping) || addresses[0] || null
}

/**
 * Get default billing address
 */
export async function getDefaultBillingAddress(): Promise<Address | null> {
  const { addresses } = await getAddresses()
  return addresses.find(a => a.is_default_billing) || addresses[0] || null
}

/**
 * Format address for display
 */
export function formatAddress(address: Address): string {
  const parts = [
    `${address.first_name} ${address.last_name}`,
    address.company,
    address.address_1,
    address.address_2,
    `${address.city}, ${address.province} ${address.postal_code}`,
    address.country_code.toUpperCase(),
  ].filter(Boolean)

  return parts.join('\n')
}

/**
 * Format address as single line
 */
export function formatAddressLine(address: Address): string {
  return `${address.address_1}, ${address.city}, ${address.province} ${address.postal_code}`
}

/**
 * US state codes for dropdowns
 */
export const US_STATES: { code: string; name: string }[] = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
  { code: 'DC', name: 'District of Columbia' },
]
