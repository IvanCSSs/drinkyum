/**
 * WooCommerce Store API Client
 * 
 * Uses the public WC Store API (no authentication required)
 * for storefront operations like fetching products, cart, checkout.
 * 
 * Uses ?rest_route= format for WordPress multisite subdirectory compatibility.
 */

const WC_URL = process.env.NEXT_PUBLIC_WP_URL || 'https://wordpress-production-7c0a.up.railway.app/drinkyum'

/**
 * Build Store API URL using rest_route query parameter
 */
function buildStoreApiUrl(path: string, params?: Record<string, string | number | undefined>): string {
  const url = new URL(WC_URL)
  url.searchParams.set('rest_route', `/wc/store/v1${path}`)
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, String(value))
      }
    })
  }
  
  return url.toString()
}

export interface StoreProduct {
  id: number
  name: string
  slug: string
  parent: number
  type: string
  variation: string
  permalink: string
  sku: string
  short_description: string
  description: string
  on_sale: boolean
  prices: {
    price: string
    regular_price: string
    sale_price: string
    currency_code: string
    currency_symbol: string
    currency_minor_unit: number
    currency_prefix: string
    currency_suffix: string
  }
  price_html: string
  average_rating: string
  review_count: number
  images: Array<{
    id: number
    src: string
    thumbnail: string
    srcset: string
    sizes: string
    name: string
    alt: string
  }>
  categories: Array<{
    id: number
    name: string
    slug: string
    link: string
  }>
  tags: Array<{
    id: number
    name: string
    slug: string
  }>
  attributes: Array<{
    id: number
    name: string
    taxonomy: string
    has_variations: boolean
    terms: Array<{
      id: number
      name: string
      slug: string
    }>
  }>
  variations: Array<{
    id: number
    attributes: Array<{
      name: string
      value: string
    }>
  }>
  has_options: boolean
  is_purchasable: boolean
  is_in_stock: boolean
  is_on_backorder: boolean
  low_stock_remaining: number | null
  sold_individually: boolean
  add_to_cart: {
    text: string
    description: string
    url: string
    minimum: number
    maximum: number
    multiple_of: number
  }
}

export interface StoreCategory {
  id: number
  name: string
  slug: string
  description: string
  parent: number
  count: number
  image: {
    id: number
    src: string
    thumbnail: string
    srcset: string
    sizes: string
    name: string
    alt: string
  } | null
  review_count: number
  permalink: string
}

/**
 * Fetch products from WC Store API
 */
export async function fetchStoreProducts(params?: {
  per_page?: number
  page?: number
  search?: string
  category?: number
  slug?: string
  orderby?: string
  order?: 'asc' | 'desc'
}): Promise<StoreProduct[]> {
  const url = buildStoreApiUrl('/products', params as Record<string, string | number | undefined>)
  
  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    next: { revalidate: 60 }, // Cache for 60 seconds
  })
  
  if (!res.ok) {
    throw new Error(`Store API error: ${res.status}`)
  }
  
  return res.json()
}

/**
 * Fetch single product from WC Store API
 */
export async function fetchStoreProduct(productId: number): Promise<StoreProduct> {
  const url = buildStoreApiUrl(`/products/${productId}`)
  
  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    next: { revalidate: 60 },
  })
  
  if (!res.ok) {
    throw new Error(`Store API error: ${res.status}`)
  }
  
  return res.json()
}

/**
 * Fetch categories from WC Store API
 */
export async function fetchStoreCategories(params?: {
  per_page?: number
  page?: number
  parent?: number
}): Promise<StoreCategory[]> {
  const url = buildStoreApiUrl('/products/categories', params as Record<string, string | number | undefined>)
  
  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    next: { revalidate: 300 }, // Cache categories for 5 minutes
  })
  
  if (!res.ok) {
    throw new Error(`Store API error: ${res.status}`)
  }
  
  return res.json()
}

/**
 * Fetch single category from WC Store API  
 */
export async function fetchStoreCategory(categoryId: number): Promise<StoreCategory> {
  const url = buildStoreApiUrl(`/products/categories/${categoryId}`)
  
  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    next: { revalidate: 300 },
  })
  
  if (!res.ok) {
    throw new Error(`Store API error: ${res.status}`)
  }
  
  return res.json()
}
