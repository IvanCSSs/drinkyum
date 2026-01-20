import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

/**
 * WordPress Webhook Handler for ISR Revalidation
 *
 * Receives webhooks from WP Webhooks plugin and triggers
 * Next.js Incremental Static Regeneration for affected pages.
 *
 * Configure in WordPress:
 * - WP Webhooks → Send Data → Add Webhook
 * - URL: https://your-domain.vercel.app/api/webhooks/wordpress
 * - Secret: Set WORDPRESS_WEBHOOK_SECRET env var
 */

// Verify webhook signature from WP Webhooks
function verifySignature(payload: string, signature: string | null): boolean {
  const secret = process.env.WORDPRESS_WEBHOOK_SECRET
  if (!secret) {
    console.warn('WORDPRESS_WEBHOOK_SECRET not set - skipping signature verification')
    return true // Allow in development
  }

  if (!signature) {
    return false
  }

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}

// WP Webhooks payload types
interface WPWebhookPayload {
  // Common fields
  action?: string
  webhook_name?: string
  webhook_url_name?: string

  // Product webhook
  post?: {
    ID: number
    post_name: string
    post_type: string
    post_status: string
  }

  // WooCommerce product
  product?: {
    id: number
    slug: string
    name: string
    status: string
    categories?: Array<{ id: number; slug: string }>
  }

  // Order webhook
  order?: {
    id: number
    status: string
    customer_id: number
  }

  // Inventory/stock change
  product_id?: number
  stock_quantity?: number
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text()
    const signature = request.headers.get('x-wp-webhook-signature')

    // Verify webhook authenticity
    if (!verifySignature(payload, signature)) {
      console.error('Invalid webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const data: WPWebhookPayload = JSON.parse(payload)
    const action = data.action || data.webhook_name || 'unknown'

    console.log(`[WordPress Webhook] Received: ${action}`)

    // Handle different webhook types
    switch (action) {
      // Product created/updated/deleted
      case 'product_created':
      case 'product_updated':
      case 'post_updated':
      case 'save_post': {
        const slug = data.product?.slug || data.post?.post_name
        const postType = data.post?.post_type

        // Only handle products
        if (postType && postType !== 'product') {
          return NextResponse.json({ message: 'Skipped non-product post type' })
        }

        if (slug) {
          // Revalidate specific product page
          revalidatePath(`/products/${slug}`)
          console.log(`[Revalidate] /products/${slug}`)
        }

        // Revalidate product listing pages
        revalidatePath('/products')
        revalidateTag('products', 'max')

        // Revalidate category pages if product has categories
        if (data.product?.categories) {
          for (const cat of data.product.categories) {
            revalidatePath(`/collections/${cat.slug}`)
            console.log(`[Revalidate] /collections/${cat.slug}`)
          }
        }

        // Revalidate homepage (may show featured products)
        revalidatePath('/')

        return NextResponse.json({
          success: true,
          revalidated: ['/', '/products', slug ? `/products/${slug}` : null].filter(
            Boolean
          ),
        })
      }

      // Product deleted
      case 'product_deleted':
      case 'delete_post': {
        revalidatePath('/products')
        revalidatePath('/')
        revalidateTag('products', 'max')

        return NextResponse.json({
          success: true,
          revalidated: ['/', '/products'],
        })
      }

      // Inventory/stock changed
      case 'woocommerce_product_set_stock':
      case 'stock_updated': {
        const productId = data.product_id || data.product?.id

        if (productId) {
          // We don't have slug from stock webhook, revalidate by tag
          revalidateTag('products', 'max')
          revalidateTag(`product-${productId}`, 'max')
        }

        return NextResponse.json({
          success: true,
          revalidated: [`product-${productId}`],
        })
      }

      // Order completed (may want to update stock display)
      case 'order_completed':
      case 'woocommerce_order_status_completed': {
        // Revalidate products as stock may have changed
        revalidateTag('products', 'max')

        return NextResponse.json({
          success: true,
          revalidated: ['products'],
        })
      }

      // Category created/updated
      case 'term_created':
      case 'term_updated': {
        revalidatePath('/collections')
        revalidateTag('collections', 'max')

        return NextResponse.json({
          success: true,
          revalidated: ['/collections'],
        })
      }

      default:
        console.log(`[WordPress Webhook] Unhandled action: ${action}`)
        return NextResponse.json({
          message: `Unhandled webhook action: ${action}`,
        })
    }
  } catch (error) {
    console.error('[WordPress Webhook] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'WordPress Webhook Handler',
    supportedActions: [
      'product_created',
      'product_updated',
      'product_deleted',
      'stock_updated',
      'order_completed',
      'term_created',
      'term_updated',
    ],
  })
}
