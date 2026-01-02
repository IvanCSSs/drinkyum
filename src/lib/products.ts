/**
 * Product Functions
 *
 * Handles product fetching, search, and subscription options.
 */

import { medusa } from './medusa-client'

// Types
export interface ProductImage {
  id: string
  url: string
  alt?: string
}

export interface ProductOption {
  id: string
  title: string
  values: { id: string; value: string }[]
}

export interface ProductVariant {
  id: string
  title: string
  sku?: string
  barcode?: string
  prices: {
    id: string
    amount: number
    currency_code: string
  }[]
  options: { id: string; value: string }[]
  inventory_quantity?: number
  allow_backorder: boolean
  manage_inventory: boolean
}

export interface Product {
  id: string
  title: string
  handle: string
  subtitle?: string
  description?: string
  thumbnail?: string
  images: ProductImage[]
  options: ProductOption[]
  variants: ProductVariant[]
  collection_id?: string
  collection?: {
    id: string
    title: string
    handle: string
  }
  tags?: { id: string; value: string }[]
  metadata?: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface Collection {
  id: string
  title: string
  handle: string
  metadata?: Record<string, unknown>
}

export interface SubscriptionOption {
  id: string
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'bimonthly' | 'quarterly' | 'yearly'
  discount_percent: number
  interval_count: number
  label?: string
}

export interface ProductListParams {
  collection_id?: string
  limit?: number
  offset?: number
  order?: string
  q?: string // search query
  tags?: string[]
}

/**
 * Build query string from params
 */
function buildQuery(params?: ProductListParams | { limit?: number; offset?: number }): string {
  if (!params) return ''

  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach(v => query.append(key, String(v)))
      } else {
        query.set(key, String(value))
      }
    }
  }

  const str = query.toString()
  return str ? `?${str}` : ''
}

/**
 * Get list of products
 */
export async function getProducts(params?: ProductListParams): Promise<{
  products: Product[]
  count: number
  offset: number
  limit: number
}> {
  const query = buildQuery(params)
  return medusa.get(`/store/products${query}`)
}

/**
 * Get single product by ID
 */
export async function getProduct(productId: string): Promise<{ product: Product }> {
  return medusa.get(`/store/products/${productId}`)
}

/**
 * Get single product by handle (URL slug)
 */
export async function getProductByHandle(handle: string): Promise<Product | null> {
  const response = await medusa.get<{ products: Product[] }>(
    `/store/products?handle=${encodeURIComponent(handle)}`
  )
  return response.products?.[0] || null
}

/**
 * Search products
 */
export async function searchProducts(query: string, limit: number = 10): Promise<Product[]> {
  const response = await getProducts({ q: query, limit })
  return response.products
}

/**
 * Get subscription options for a product
 */
export async function getSubscriptionOptions(productId: string): Promise<SubscriptionOption[]> {
  try {
    const response = await medusa.get<{ options: SubscriptionOption[] }>(
      `/store/products/${productId}/subscription-options`
    )
    return response.options || []
  } catch {
    // Product may not have subscription options
    return []
  }
}

/**
 * Get all collections
 */
export async function getCollections(params?: {
  limit?: number
  offset?: number
}): Promise<{
  collections: Collection[]
  count: number
}> {
  const query = buildQuery(params)
  return medusa.get(`/store/collections${query}`)
}

/**
 * Get single collection by handle
 */
export async function getCollectionByHandle(handle: string): Promise<Collection | null> {
  const response = await medusa.get<{ collections: Collection[] }>(
    `/store/collections?handle=${encodeURIComponent(handle)}`
  )
  return response.collections?.[0] || null
}

/**
 * Get products in a collection
 */
export async function getProductsByCollection(
  collectionId: string,
  params?: Omit<ProductListParams, 'collection_id'>
): Promise<{
  products: Product[]
  count: number
}> {
  return getProducts({ ...params, collection_id: collectionId })
}

/**
 * Format price for display
 */
export function formatPrice(amount: number, currencyCode: string = 'usd'): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode.toUpperCase(),
  })
  // Medusa stores prices in cents
  return formatter.format(amount / 100)
}

/**
 * Get the cheapest variant price for a product
 */
export function getProductPrice(product: Product, currencyCode: string = 'usd'): string | null {
  const prices = product.variants
    .flatMap(v => v.prices)
    .filter(p => p.currency_code === currencyCode)
    .map(p => p.amount)

  if (prices.length === 0) return null

  const minPrice = Math.min(...prices)
  return formatPrice(minPrice, currencyCode)
}
