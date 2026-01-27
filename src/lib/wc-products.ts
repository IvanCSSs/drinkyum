/**
 * WooCommerce Product Functions
 *
 * Handles product fetching from WooCommerce REST API.
 * Falls back to placeholder data when no products exist.
 */

import { woocommerce } from './wc-client'
import { wpImageUrl } from './wordpress-images'
import { fetchStoreProducts, fetchStoreProduct, fetchStoreCategories, StoreProduct } from './wc-store-api'

// ============================================================================
// Types
// ============================================================================

export interface WCProductImage {
  id: number
  src: string
  name: string
  alt: string
}

export interface WCProductCategory {
  id: number
  name: string
  slug: string
}

export interface WCProductAttribute {
  id: number
  name: string
  position: number
  visible: boolean
  variation: boolean
  options: string[]
}

export interface WCProductVariation {
  id: number
  sku: string
  price: string
  regular_price: string
  sale_price: string
  stock_quantity: number | null
  stock_status: 'instock' | 'outofstock' | 'onbackorder'
  attributes: { id: number; name: string; option: string }[]
  image?: WCProductImage
}

export interface WCSubscribeSaveOption {
  period: 'week' | 'month' | 'year'
  interval: number
  label: string
  discount_percent: number
  price: number
  savings: number
}

export interface WCSubscribeSave {
  enabled: boolean
  base_price: number
  options: WCSubscribeSaveOption[]
}

export interface WCProduct {
  id: number
  name: string
  slug: string
  permalink: string
  type: 'simple' | 'variable' | 'grouped' | 'external'
  status: 'publish' | 'draft' | 'pending' | 'private'
  featured: boolean
  description: string
  short_description: string
  sku: string
  price: string
  regular_price: string
  sale_price: string
  on_sale: boolean
  purchasable: boolean
  total_sales: number
  virtual: boolean
  downloadable: boolean
  stock_quantity: number | null
  stock_status: 'instock' | 'outofstock' | 'onbackorder'
  manage_stock: boolean
  backorders: 'no' | 'notify' | 'yes'
  backorders_allowed: boolean
  weight: string
  dimensions: {
    length: string
    width: string
    height: string
  }
  categories: WCProductCategory[]
  tags: { id: number; name: string; slug: string }[]
  images: WCProductImage[]
  attributes: WCProductAttribute[]
  variations: number[]
  meta_data: { id: number; key: string; value: unknown }[]
  date_created: string
  date_modified: string
  // Subscribe & Save options (from custom plugin)
  subscribe_save?: WCSubscribeSave
}

export interface WCCategory {
  id: number
  name: string
  slug: string
  parent: number
  description: string
  display: string
  image: WCProductImage | null
  menu_order: number
  count: number
}

export interface WCProductListParams {
  page?: number
  per_page?: number
  search?: string
  order?: 'asc' | 'desc'
  orderby?: 'date' | 'id' | 'title' | 'slug' | 'price' | 'popularity' | 'rating'
  category?: number
  tag?: number
  status?: 'publish' | 'draft' | 'pending' | 'private'
  featured?: boolean
  on_sale?: boolean
  min_price?: string
  max_price?: string
  stock_status?: 'instock' | 'outofstock' | 'onbackorder'
}

// ============================================================================
// Placeholder Data (used when no products exist)
// ============================================================================

const PLACEHOLDER_PRODUCTS: WCProduct[] = [
  {
    id: 0,
    name: 'Sample Product',
    slug: 'sample-product',
    permalink: '/products/sample-product',
    type: 'simple',
    status: 'publish',
    featured: false,
    description: '<p>This is a placeholder product. Add products in WooCommerce to see real data.</p>',
    short_description: 'Placeholder product',
    sku: 'SAMPLE-001',
    price: '19.99',
    regular_price: '19.99',
    sale_price: '',
    on_sale: false,
    purchasable: false,
    total_sales: 0,
    virtual: false,
    downloadable: false,
    stock_quantity: null,
    stock_status: 'instock',
    manage_stock: false,
    backorders: 'no',
    backorders_allowed: false,
    weight: '',
    dimensions: { length: '', width: '', height: '' },
    categories: [],
    tags: [],
    images: [{
      id: 0,
      src: '/images/product-placeholder.png',
      name: 'Placeholder',
      alt: 'Placeholder image',
    }],
    attributes: [],
    variations: [],
    meta_data: [],
    date_created: new Date().toISOString(),
    date_modified: new Date().toISOString(),
  },
]

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Build query string from params
 * Adds cache-busting timestamp to bypass WP REST Cache
 */
function buildQuery(params?: WCProductListParams): string {
  const query = new URLSearchParams()

  // Add cache-busting timestamp to bypass WP REST Cache
  query.set('_', String(Date.now()))

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        query.set(key, String(value))
      }
    }
  }

  return `?${query.toString()}`
}

/**
 * Transform WC product images to use local proxy
 */
function transformProduct(product: WCProduct): WCProduct {
  return {
    ...product,
    images: product.images.map(img => ({
      ...img,
      src: wpImageUrl(img.src),
    })),
  }
}

// ============================================================================
// Product API Functions
// ============================================================================

/**
 * Convert Store API product to WCProduct format
 */
function storeProductToWCProduct(sp: StoreProduct): WCProduct {
  const priceMultiplier = Math.pow(10, sp.prices.currency_minor_unit || 2)
  return {
    id: sp.id,
    name: sp.name,
    slug: sp.slug,
    permalink: sp.permalink,
    type: (sp.type || 'simple') as WCProduct['type'],
    status: 'publish',
    featured: false,
    description: sp.description,
    short_description: sp.short_description,
    sku: sp.sku,
    price: (parseInt(sp.prices.price || '0') / priceMultiplier).toString(),
    regular_price: (parseInt(sp.prices.regular_price || '0') / priceMultiplier).toString(),
    sale_price: sp.prices.sale_price ? (parseInt(sp.prices.sale_price) / priceMultiplier).toString() : '',
    on_sale: sp.on_sale,
    purchasable: sp.is_purchasable,
    total_sales: 0,
    virtual: false,
    downloadable: false,
    stock_quantity: sp.low_stock_remaining,
    stock_status: sp.is_in_stock ? 'instock' : (sp.is_on_backorder ? 'onbackorder' : 'outofstock'),
    manage_stock: false,
    backorders: 'no',
    backorders_allowed: sp.is_on_backorder,
    weight: '',
    dimensions: { length: '', width: '', height: '' },
    images: sp.images.map(img => ({
      id: img.id,
      src: img.src,
      name: img.name,
      alt: img.alt,
    })),
    categories: sp.categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
    })),
    tags: sp.tags.map(tag => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
    })),
    attributes: sp.attributes.map(attr => ({
      id: attr.id,
      name: attr.name,
      position: 0,
      visible: true,
      variation: attr.has_variations,
      options: attr.terms.map(t => t.name),
    })),
    variations: sp.variations.map(v => v.id),
    meta_data: [],
    date_created: new Date().toISOString(),
    date_modified: new Date().toISOString(),
    subscribe_save: undefined,
  }
}

/**
 * Get list of products from WooCommerce Store API (public, no auth required)
 */
export async function getWCProducts(params?: WCProductListParams): Promise<{
  products: WCProduct[]
  total: number
  totalPages: number
}> {
  try {
    const storeProducts = await fetchStoreProducts({
      per_page: params?.per_page || 10,
      page: params?.page,
      search: params?.search,
      category: params?.category,
      orderby: params?.orderby,
      order: params?.order,
    })

    if (!storeProducts || storeProducts.length === 0) {
      console.info('[WC Products] No products found, returning placeholders')
      return {
        products: PLACEHOLDER_PRODUCTS,
        total: PLACEHOLDER_PRODUCTS.length,
        totalPages: 1,
      }
    }

    return {
      products: storeProducts.map(sp => transformProduct(storeProductToWCProduct(sp))),
      total: storeProducts.length,
      totalPages: 1,
    }
  } catch (error) {
    console.error('[WC Products] Error fetching products:', error)
    return {
      products: PLACEHOLDER_PRODUCTS,
      total: PLACEHOLDER_PRODUCTS.length,
      totalPages: 1,
    }
  }
}

/**
 * Get single product by ID using Store API
 */
export async function getWCProduct(productId: number): Promise<WCProduct | null> {
  try {
    const storeProduct = await fetchStoreProduct(productId)
    return transformProduct(storeProductToWCProduct(storeProduct))
  } catch (error) {
    console.error('[WC Products] Error fetching product:', error)
    return null
  }
}

/**
 * Get single product by slug (handle)
 */
export async function getWCProductBySlug(slug: string): Promise<WCProduct | null> {
  try {
    if (!woocommerce.isConfigured()) {
      console.warn('[WC Products] API not configured')
      if (slug === 'sample-product') {
        return PLACEHOLDER_PRODUCTS[0]
      }
      return null
    }

    const products = await woocommerce.get<WCProduct[]>(`/products?slug=${encodeURIComponent(slug)}&_=${Date.now()}`)

    if (!products || products.length === 0) {
      // Check if it's the placeholder
      if (slug === 'sample-product') {
        return PLACEHOLDER_PRODUCTS[0]
      }
      return null
    }

    return transformProduct(products[0])
  } catch (error) {
    console.error('[WC Products] Error fetching product by slug:', error)
    return null
  }
}

/**
 * Search products
 */
export async function searchWCProducts(query: string, limit: number = 10): Promise<WCProduct[]> {
  const result = await getWCProducts({ search: query, per_page: limit })
  return result.products
}

/**
 * Get product variations (for variable products)
 */
export async function getWCProductVariations(productId: number): Promise<WCProductVariation[]> {
  try {
    if (!woocommerce.isConfigured()) {
      return []
    }

    const variations = await woocommerce.get<WCProductVariation[]>(
      `/products/${productId}/variations`
    )

    return variations.map(v => ({
      ...v,
      image: v.image ? { ...v.image, src: wpImageUrl(v.image.src) } : undefined,
    }))
  } catch (error) {
    console.error('[WC Products] Error fetching variations:', error)
    return []
  }
}

// ============================================================================
// Category API Functions
// ============================================================================

/**
 * Get all product categories
 */
export async function getWCCategories(params?: {
  page?: number
  per_page?: number
  parent?: number
  hide_empty?: boolean
}): Promise<{
  categories: WCCategory[]
  total: number
}> {
  try {
    if (!woocommerce.isConfigured()) {
      return { categories: [], total: 0 }
    }

    const query = buildQuery(params)
    const categories = await woocommerce.get<WCCategory[]>(`/products/categories${query}`)

    return {
      categories: categories.map(cat => ({
        ...cat,
        image: cat.image ? { ...cat.image, src: wpImageUrl(cat.image.src) } : null,
      })),
      total: categories.length,
    }
  } catch (error) {
    console.error('[WC Products] Error fetching categories:', error)
    return { categories: [], total: 0 }
  }
}

/**
 * Get single category by slug
 */
export async function getWCCategoryBySlug(slug: string): Promise<WCCategory | null> {
  try {
    if (!woocommerce.isConfigured()) {
      return null
    }

    const categories = await woocommerce.get<WCCategory[]>(
      `/products/categories?slug=${encodeURIComponent(slug)}&_=${Date.now()}`
    )

    if (!categories || categories.length === 0) {
      return null
    }

    const cat = categories[0]
    return {
      ...cat,
      image: cat.image ? { ...cat.image, src: wpImageUrl(cat.image.src) } : null,
    }
  } catch (error) {
    console.error('[WC Products] Error fetching category:', error)
    return null
  }
}

/**
 * Get products by category
 */
export async function getWCProductsByCategory(
  categoryId: number,
  params?: Omit<WCProductListParams, 'category'>
): Promise<{
  products: WCProduct[]
  total: number
}> {
  const result = await getWCProducts({ ...params, category: categoryId })
  return {
    products: result.products,
    total: result.total,
  }
}

// ============================================================================
// Price Formatting
// ============================================================================

/**
 * Format price for display
 * WooCommerce stores prices as strings (e.g., "19.99")
 */
export function formatWCPrice(price: string, currencyCode: string = 'USD'): string {
  const amount = parseFloat(price)
  if (isNaN(amount)) return ''

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode.toUpperCase(),
  })

  return formatter.format(amount)
}

/**
 * Get the display price for a product (handles sale prices)
 */
export function getWCProductPrice(product: WCProduct, currencyCode: string = 'USD'): {
  price: string
  regularPrice?: string
  onSale: boolean
} {
  const price = formatWCPrice(product.price, currencyCode)

  if (product.on_sale && product.sale_price) {
    return {
      price,
      regularPrice: formatWCPrice(product.regular_price, currencyCode),
      onSale: true,
    }
  }

  return {
    price,
    onSale: false,
  }
}

// ============================================================================
// Medusa-Compatible Adapter Types
// ============================================================================

/**
 * Medusa-compatible Product type for UI components
 * This allows existing components to work with WooCommerce data
 */
export interface Product {
  id: string
  title: string
  handle: string
  subtitle?: string
  description?: string
  thumbnail?: string
  images: { id: string; url: string; alt?: string }[]
  options: { id: string; title: string; values: { id: string; value: string }[] }[]
  variants: {
    id: string
    title: string
    sku?: string
    prices: { id: string; amount: number; currency_code: string }[]
    options: { id: string; value: string }[]
    inventory_quantity?: number
    allow_backorder: boolean
    manage_inventory: boolean
  }[]
  collection_id?: string
  collection?: { id: string; title: string; handle: string }
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
  interval: 'week' | 'month' | 'year'
  interval_count: number
  label: string
  discount_percent: number
  price: number
  savings: number
}

export type ProductSectionType = 'text' | 'list' | 'table'

export interface ProductSection {
  id: string
  title: string
  type: ProductSectionType
  content: string | string[] | { label: string; value: string }[]
  order: number
}

export interface ProductListParams {
  collection_id?: string
  limit?: number
  offset?: number
  order?: string
  q?: string
  tags?: string[]
}

// ============================================================================
// Adapter Functions - Convert WC to Medusa-compatible format
// ============================================================================

/**
 * Convert WooCommerce product to Medusa-compatible format
 */
function adaptWCProduct(wc: WCProduct): Product {
  const priceAmount = parseFloat(wc.price) || 0

  return {
    id: String(wc.id),
    title: wc.name,
    handle: wc.slug,
    subtitle: wc.short_description?.replace(/<[^>]*>/g, '') || undefined,
    description: wc.description?.replace(/<[^>]*>/g, '') || undefined,
    // Transform image URLs to use /wp-media/ proxy for cleaner URLs
    thumbnail: wpImageUrl(wc.images[0]?.src),
    images: wc.images.map((img, idx) => ({
      id: String(img.id || idx),
      url: wpImageUrl(img.src),
      alt: img.alt || wc.name,
    })),
    options: wc.attributes.map(attr => ({
      id: String(attr.id),
      title: attr.name,
      values: attr.options.map((opt, idx) => ({
        id: `${attr.id}-${idx}`,
        value: opt,
      })),
    })),
    variants: [{
      id: String(wc.id), // Use product ID as variant ID for simple products
      title: wc.name,
      sku: wc.sku || undefined,
      prices: [{
        id: `price-${wc.id}`,
        amount: priceAmount,
        currency_code: 'usd',
      }],
      options: [],
      inventory_quantity: wc.stock_quantity ?? undefined,
      allow_backorder: wc.backorders_allowed,
      manage_inventory: wc.manage_stock,
    }],
    collection_id: wc.categories[0] ? String(wc.categories[0].id) : undefined,
    collection: wc.categories[0] ? {
      id: String(wc.categories[0].id),
      title: wc.categories[0].name,
      handle: wc.categories[0].slug,
    } : undefined,
    tags: wc.tags.map(tag => ({
      id: String(tag.id),
      value: tag.name,
    })),
    metadata: wc.meta_data.reduce((acc, meta) => {
      acc[meta.key] = meta.value
      return acc
    }, {} as Record<string, unknown>),
    created_at: wc.date_created,
    updated_at: wc.date_modified,
  }
}

/**
 * Convert WooCommerce category to Medusa-compatible Collection
 */
function adaptWCCategory(wc: WCCategory): Collection {
  return {
    id: String(wc.id),
    title: wc.name,
    handle: wc.slug,
    metadata: {
      description: wc.description,
      featured_image: wc.image?.src,
      product_count: wc.count,
    },
  }
}

// ============================================================================
// Medusa-Compatible API Functions (drop-in replacements)
// ============================================================================

/**
 * Get list of products (Medusa-compatible)
 */
export async function getProducts(params?: ProductListParams): Promise<{
  products: Product[]
  count: number
  offset: number
  limit: number
}> {
  const wcParams: WCProductListParams = {
    per_page: params?.limit || 10,
    search: params?.q,
  }

  // Handle collection_id - need to convert string to number
  if (params?.collection_id) {
    wcParams.category = parseInt(params.collection_id, 10)
  }

  const result = await getWCProducts(wcParams)

  return {
    products: result.products.map(adaptWCProduct),
    count: result.total,
    offset: params?.offset || 0,
    limit: params?.limit || 10,
  }
}

/**
 * Get single product by ID (Medusa-compatible)
 */
export async function getProduct(productId: string): Promise<{ product: Product } | null> {
  const wc = await getWCProduct(parseInt(productId, 10))
  if (!wc) return null
  return { product: adaptWCProduct(wc) }
}

/**
 * Get single product by handle (Medusa-compatible)
 */
export async function getProductByHandle(handle: string): Promise<Product | null> {
  const wc = await getWCProductBySlug(handle)
  if (!wc) return null
  return adaptWCProduct(wc)
}

/**
 * Search products (Medusa-compatible)
 */
export async function searchProducts(query: string, limit: number = 10): Promise<Product[]> {
  const wcProducts = await searchWCProducts(query, limit)
  return wcProducts.map(adaptWCProduct)
}

/**
 * Get subscription options for a product
 * Reads from the subscribe_save field added by our custom WooCommerce plugin
 */
export async function getSubscriptionOptions(productId: string): Promise<SubscriptionOption[]> {
  try {
    // Try by slug first (handle), then by ID
    const product = await getWCProductBySlug(productId) || await getWCProduct(parseInt(productId, 10))
    if (!product) return []

    // Check for subscribe_save at root level (from our custom plugin)
    if (product.subscribe_save?.enabled && product.subscribe_save.options?.length > 0) {
      return product.subscribe_save.options.map(opt => ({
        interval: opt.period,
        interval_count: opt.interval,
        label: opt.label,
        discount_percent: opt.discount_percent,
        price: opt.price,
        savings: opt.savings,
      }))
    }

    return []
  } catch {
    return []
  }
}

/**
 * Get all collections (Medusa-compatible)
 */
export async function getCollections(params?: {
  limit?: number
  offset?: number
}): Promise<{
  collections: Collection[]
  count: number
}> {
  const result = await getWCCategories({
    per_page: params?.limit || 20,
  })

  // Filter out 'uncategorized' category
  const filtered = result.categories.filter(cat => cat.slug !== 'uncategorized')

  return {
    collections: filtered.map(adaptWCCategory),
    count: filtered.length,
  }
}

/**
 * Get single collection by handle (Medusa-compatible)
 */
export async function getCollectionByHandle(handle: string): Promise<Collection | null> {
  const wc = await getWCCategoryBySlug(handle)
  if (!wc) return null
  return adaptWCCategory(wc)
}

/**
 * Get products in a collection (Medusa-compatible)
 */
export async function getProductsByCollection(
  collectionId: string,
  params?: Omit<ProductListParams, 'collection_id'>
): Promise<{
  products: Product[]
  count: number
}> {
  const result = await getWCProductsByCategory(parseInt(collectionId, 10), {
    per_page: params?.limit || 10,
    search: params?.q,
  })

  return {
    products: result.products.map(adaptWCProduct),
    count: result.total,
  }
}

/**
 * Format price for display (Medusa-compatible)
 * Prices are stored as dollars (1 = $1.00)
 */
export function formatPrice(amount: number, currencyCode: string = 'usd'): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode.toUpperCase(),
  })
  return formatter.format(amount)
}

/**
 * Get the cheapest variant price for a product (Medusa-compatible)
 */
export function getProductPrice(product: Product, currencyCode: string = 'usd'): string | null {
  if (!product.variants || product.variants.length === 0) return null

  const prices = product.variants
    .flatMap(v => v.prices || [])
    .filter(p => p && p.currency_code === currencyCode)
    .map(p => p.amount)

  if (prices.length === 0) return null

  const minPrice = Math.min(...prices)
  return formatPrice(minPrice, currencyCode)
}
