/**
 * Test endpoint to verify WooCommerce API connection
 *
 * GET /api/test-wc - Returns WooCommerce products or placeholder data
 *
 * This is a development-only endpoint to verify the WC client is working.
 */

import { NextResponse } from 'next/server'
import { woocommerce } from '@/lib/wc-client'
import { getWCProducts, getWCCategories, getSubscriptionOptions, getProductByHandle } from '@/lib/wc-products'

export async function GET() {
  const results: Record<string, unknown> = {
    configured: woocommerce.isConfigured(),
    baseUrl: woocommerce.getBaseUrl(),
    timestamp: new Date().toISOString(),
  }

  // Try to fetch products
  try {
    const productsResult = await getWCProducts({ per_page: 5 })
    results.products = {
      count: productsResult.total,
      items: productsResult.products.map(p => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        images: p.images.length,
      })),
    }
  } catch (error) {
    results.productsError = error instanceof Error ? error.message : 'Unknown error'
  }

  // Try to fetch categories
  try {
    const categoriesResult = await getWCCategories({ per_page: 5 })
    results.categories = {
      count: categoriesResult.total,
      items: categoriesResult.categories.map(c => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
      })),
    }
  } catch (error) {
    results.categoriesError = error instanceof Error ? error.message : 'Unknown error'
  }

  // Test subscription options for product 11
  try {
    const subOptions = await getSubscriptionOptions('yum-triple-play-bubble-gum-30ml')
    results.subscriptionOptions = subOptions
  } catch (error) {
    results.subscriptionOptionsError = error instanceof Error ? error.message : 'Unknown error'
  }

  // Test adapted product (Medusa-compatible format)
  try {
    const product = await getProductByHandle('yum-triple-play-bubble-gum-30ml')
    if (product) {
      results.adaptedProduct = {
        id: product.id,
        title: product.title,
        handle: product.handle,
        thumbnail: product.thumbnail,
        images: product.images,
        variantCount: product.variants?.length || 0,
      }
    }
  } catch (error) {
    results.adaptedProductError = error instanceof Error ? error.message : 'Unknown error'
  }

  return NextResponse.json(results, { status: 200 })
}
