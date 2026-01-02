/**
 * Analytics & Event Tracking
 *
 * Tracks customer behavior for analytics and personalization.
 * Uses fingerprint ID for anonymous visitors and merges identity on login.
 */

import { medusa } from './medusa-client'

// Types
export type EventType =
  | 'page.viewed'
  | 'product.viewed'
  | 'collection.browsed'
  | 'search.performed'
  | 'cart.viewed'
  | 'cart.item_added'
  | 'cart.item_removed'
  | 'cart.updated'
  | 'checkout.started'
  | 'checkout.email_entered'
  | 'checkout.shipping_entered'
  | 'checkout.shipping_selected'
  | 'checkout.payment_started'
  | 'checkout.completed'
  | 'customer.registered'
  | 'customer.logged_in'

const FINGERPRINT_KEY = '_fp'
const SESSION_KEY = '_sid'

/**
 * Generate or retrieve fingerprint ID for anonymous tracking
 */
function getFingerprint(): string {
  if (typeof window === 'undefined') return ''

  let fp = localStorage.getItem(FINGERPRINT_KEY)
  if (!fp) {
    fp = crypto.randomUUID()
    localStorage.setItem(FINGERPRINT_KEY, fp)
  }
  return fp
}

/**
 * Generate or retrieve session ID
 */
function getSessionId(): string {
  if (typeof window === 'undefined') return ''

  let sid = sessionStorage.getItem(SESSION_KEY)
  if (!sid) {
    sid = crypto.randomUUID()
    sessionStorage.setItem(SESSION_KEY, sid)
  }
  return sid
}

/**
 * Track an event
 */
export async function trackEvent(
  eventType: EventType | string,
  properties?: Record<string, unknown>
): Promise<void> {
  if (typeof window === 'undefined') return

  try {
    await medusa.post('/store/webhooks/track', {
      event_type: eventType,
      fingerprint_id: getFingerprint(),
      session_id: getSessionId(),
      properties: {
        ...properties,
        url: window.location.href,
        referrer: document.referrer,
        user_agent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    // Silently fail - don't break UX for analytics
    console.error('Failed to track event:', error)
  }
}

/**
 * Identify customer (call after login/register to merge anonymous activity)
 */
export async function identifyCustomer(
  customerId: string,
  email: string
): Promise<void> {
  if (typeof window === 'undefined') return

  try {
    await medusa.post('/store/webhooks/identify', {
      fingerprint_id: getFingerprint(),
      customer_id: customerId,
      email,
    })
  } catch (error) {
    console.error('Failed to identify customer:', error)
  }
}

// Convenience tracking functions

/**
 * Track page view
 */
export function trackPageView(pageName: string, pageType: string): void {
  trackEvent('page.viewed', {
    page_name: pageName,
    page_type: pageType,
  })
}

/**
 * Track product view
 */
export function trackProductView(product: {
  id: string
  handle: string
  title: string
  price?: number
  collection?: string
}): void {
  trackEvent('product.viewed', {
    product_id: product.id,
    product_handle: product.handle,
    product_title: product.title,
    product_price: product.price,
    collection: product.collection,
  })
}

/**
 * Track collection browse
 */
export function trackCollectionBrowse(collection: {
  id: string
  handle: string
  title: string
}): void {
  trackEvent('collection.browsed', {
    collection_id: collection.id,
    collection_handle: collection.handle,
    collection_title: collection.title,
  })
}

/**
 * Track search
 */
export function trackSearch(query: string, resultsCount: number): void {
  trackEvent('search.performed', {
    query,
    results_count: resultsCount,
  })
}

/**
 * Track add to cart
 */
export function trackAddToCart(item: {
  productId: string
  variantId: string
  title: string
  quantity: number
  price: number
  isSubscription?: boolean
}): void {
  trackEvent('cart.item_added', {
    product_id: item.productId,
    variant_id: item.variantId,
    product_title: item.title,
    quantity: item.quantity,
    price: item.price,
    is_subscription: item.isSubscription,
  })
}

/**
 * Track remove from cart
 */
export function trackRemoveFromCart(lineItemId: string): void {
  trackEvent('cart.item_removed', {
    line_item_id: lineItemId,
  })
}

/**
 * Track cart update
 */
export function trackCartUpdate(lineItemId: string, newQuantity: number): void {
  trackEvent('cart.updated', {
    line_item_id: lineItemId,
    new_quantity: newQuantity,
  })
}

/**
 * Track checkout step
 */
export function trackCheckoutStep(
  step:
    | 'started'
    | 'email_entered'
    | 'shipping_entered'
    | 'shipping_selected'
    | 'payment_started'
    | 'completed',
  data?: Record<string, unknown>
): void {
  trackEvent(`checkout.${step}`, data)
}

/**
 * Track customer registration
 */
export function trackRegistration(method: string = 'email'): void {
  trackEvent('customer.registered', { method })
}

/**
 * Track customer login
 */
export function trackLogin(method: string = 'email'): void {
  trackEvent('customer.logged_in', { method })
}

/**
 * Initialize analytics on page load
 * Call this in your root layout or _app
 */
export function initAnalytics(): void {
  if (typeof window === 'undefined') return

  // Ensure fingerprint and session IDs are created
  getFingerprint()
  getSessionId()
}
