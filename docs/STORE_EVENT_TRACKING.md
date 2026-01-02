# Store Event Tracking Guide

> Track user behavior across the entire store to build customer profiles, enable personalization, and power abandoned cart/browse recovery.

---

## Table of Contents

1. [Overview](#overview)
2. [Identity Resolution](#identity-resolution)
3. [Event Taxonomy](#event-taxonomy)
4. [Frontend Implementation](#frontend-implementation)
5. [Backend Webhooks](#backend-webhooks)
6. [Identity Merge Strategy](#identity-merge-strategy)
7. [Use Cases](#use-cases)

---

## Overview

### The Problem

You capture an email at checkout, but by then you've lost all the browsing context:
- What products did they view?
- How many times did they visit?
- What did they search for?
- What did they add/remove from cart?

### The Solution

Track everything from the first visit using an anonymous identifier, then **merge** that data when they identify themselves (email, phone, account).

### Identity Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│  ANONYMOUS (everyone starts here)                           │
│  Identifier: fingerprint_id (cookie/localStorage)           │
│  + IP address (for geo, not primary ID)                     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼ (newsletter signup, checkout email, etc.)
┌─────────────────────────────────────────────────────────────┐
│  IDENTIFIED (email or phone captured)                       │
│  Identifier: email or phone                                 │
│  Link: fingerprint_id → email                               │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼ (creates account or logs in)
┌─────────────────────────────────────────────────────────────┐
│  CUSTOMER (has account)                                     │
│  Identifier: customer_id                                    │
│  Link: fingerprint_id → email → customer_id                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Identity Resolution

### Fingerprint ID

Generate a persistent anonymous ID on first visit:

```typescript
// src/lib/fingerprint.ts

const FINGERPRINT_KEY = "yum_fp"

export function getFingerprint(): string {
  if (typeof window === "undefined") return ""
  
  // Check localStorage first
  let fp = localStorage.getItem(FINGERPRINT_KEY)
  
  if (!fp) {
    // Generate new fingerprint
    fp = `fp_${Date.now()}_${Math.random().toString(36).substr(2, 12)}`
    localStorage.setItem(FINGERPRINT_KEY, fp)
    
    // Also set as cookie for server-side access
    document.cookie = `${FINGERPRINT_KEY}=${fp}; max-age=31536000; path=/; SameSite=Lax`
  }
  
  return fp
}

export function getSessionId(): string {
  // Session-scoped ID (resets on browser close)
  let sessionId = sessionStorage.getItem("yum_session")
  
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`
    sessionStorage.setItem("yum_session", sessionId)
  }
  
  return sessionId
}
```

### Identity State

```typescript
// src/lib/identity.ts

interface Identity {
  fingerprintId: string
  sessionId: string
  email?: string
  phone?: string
  customerId?: string
  identifiedAt?: string
}

const IDENTITY_KEY = "yum_identity"

export function getIdentity(): Identity {
  const fp = getFingerprint()
  const sessionId = getSessionId()
  
  try {
    const stored = localStorage.getItem(IDENTITY_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return { ...parsed, fingerprintId: fp, sessionId }
    }
  } catch {}
  
  return { fingerprintId: fp, sessionId }
}

export function setIdentity(updates: Partial<Identity>) {
  const current = getIdentity()
  const updated = {
    ...current,
    ...updates,
    identifiedAt: updates.email || updates.phone 
      ? current.identifiedAt || new Date().toISOString()
      : current.identifiedAt,
  }
  localStorage.setItem(IDENTITY_KEY, JSON.stringify(updated))
  
  // Trigger identity merge if newly identified
  if ((updates.email || updates.phone) && !current.email && !current.phone) {
    mergeAnonymousProfile(updated)
  }
  
  return updated
}

async function mergeAnonymousProfile(identity: Identity) {
  // Send to backend to merge anonymous events with identified profile
  await fetch("/api/tracking/identify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(identity),
  })
}
```

---

## Event Taxonomy

### All Trackable Events

| Event | Trigger | Key Data |
|-------|---------|----------|
| **Browsing** |||
| `page.viewed` | Any page load | url, referrer, title |
| `product.viewed` | Product page | product_id, product_name, price, category |
| `collection.viewed` | Collection page | collection_id, collection_name |
| `search.performed` | Search submitted | query, results_count |
| `search.result_clicked` | Click search result | query, product_id, position |
| **Cart** |||
| `cart.viewed` | Cart page/drawer opened | items, total |
| `product.added_to_cart` | Add to cart click | product_id, quantity, price, source |
| `product.removed_from_cart` | Remove from cart | product_id, quantity |
| `cart.quantity_changed` | +/- quantity | product_id, old_qty, new_qty |
| **Checkout** |||
| `checkout.started` | Enter checkout | cart_id, items, total |
| `checkout.email_entered` | Email field blur | email |
| `checkout.phone_entered` | Phone field blur | phone |
| `checkout.address_entered` | Address complete | city, state, zip |
| `checkout.shipping_selected` | Shipping chosen | method, cost |
| `checkout.payment_started` | Payment step | total |
| `checkout.completed` | Order placed | order_id, total |
| `checkout.abandoned` | Left checkout | step, cart_id |
| **Identity** |||
| `visitor.identified` | Email/phone captured | email, phone, source |
| `newsletter.subscribed` | Newsletter signup | email |
| `account.created` | Account registration | customer_id, email |
| `account.logged_in` | Login | customer_id |
| **Engagement** |||
| `product.image_zoomed` | Image zoom/gallery | product_id |
| `product.reviews_viewed` | Scrolled to reviews | product_id |
| `product.variant_selected` | Changed variant | product_id, variant_id |
| `faq.viewed` | FAQ page | - |
| `faq.question_expanded` | Opened FAQ item | question_id |
| `contact.form_submitted` | Contact form | subject |

---

## Frontend Implementation

### Event Tracker Service

```typescript
// src/lib/tracker.ts

import { getIdentity } from "./identity"

const TRACKING_ENDPOINT = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL + "/store/webhooks/track"

interface TrackingEvent {
  event: string
  properties?: Record<string, unknown>
  timestamp?: string
}

// Queue for batching events
let eventQueue: TrackingEvent[] = []
let flushTimeout: NodeJS.Timeout | null = null

export async function track(event: string, properties: Record<string, unknown> = {}) {
  const identity = getIdentity()
  
  const payload: TrackingEvent = {
    event,
    properties: {
      ...properties,
      // Always include identity
      fingerprint_id: identity.fingerprintId,
      session_id: identity.sessionId,
      email: identity.email,
      phone: identity.phone,
      customer_id: identity.customerId,
      // Page context
      url: window.location.href,
      path: window.location.pathname,
      referrer: document.referrer,
      user_agent: navigator.userAgent,
      // Timestamp
      timestamp: new Date().toISOString(),
    },
    timestamp: new Date().toISOString(),
  }
  
  // Add to queue
  eventQueue.push(payload)
  
  // Debounce flush (send every 2 seconds or when queue has 10+ events)
  if (eventQueue.length >= 10) {
    flushEvents()
  } else if (!flushTimeout) {
    flushTimeout = setTimeout(flushEvents, 2000)
  }
}

async function flushEvents() {
  if (flushTimeout) {
    clearTimeout(flushTimeout)
    flushTimeout = null
  }
  
  if (eventQueue.length === 0) return
  
  const events = [...eventQueue]
  eventQueue = []
  
  try {
    await fetch(TRACKING_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ events }),
      // Use keepalive for page unload
      keepalive: true,
    })
  } catch (error) {
    console.error("[Tracker] Failed to send events:", error)
    // Re-queue failed events
    eventQueue = [...events, ...eventQueue]
  }
}

// Flush on page unload
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", flushEvents)
  window.addEventListener("pagehide", flushEvents)
}

// Convenience methods
export const Tracker = {
  // Browsing
  pageViewed: (title: string) => 
    track("page.viewed", { title }),
  
  productViewed: (product: { id: string; name: string; price: number; category?: string }) => 
    track("product.viewed", product),
  
  collectionViewed: (collection: { id: string; name: string; productCount?: number }) => 
    track("collection.viewed", collection),
  
  searchPerformed: (query: string, resultsCount: number) => 
    track("search.performed", { query, results_count: resultsCount }),
  
  searchResultClicked: (query: string, productId: string, position: number) => 
    track("search.result_clicked", { query, product_id: productId, position }),
  
  // Cart
  cartViewed: (items: Array<{ id: string; quantity: number }>, total: number) => 
    track("cart.viewed", { items, total, item_count: items.length }),
  
  productAddedToCart: (product: { id: string; name: string; price: number; quantity: number }, source: string) => 
    track("product.added_to_cart", { ...product, source }),
  
  productRemovedFromCart: (productId: string, quantity: number) => 
    track("product.removed_from_cart", { product_id: productId, quantity }),
  
  cartQuantityChanged: (productId: string, oldQty: number, newQty: number) => 
    track("cart.quantity_changed", { product_id: productId, old_quantity: oldQty, new_quantity: newQty }),
  
  // Checkout
  checkoutStarted: (cartId: string, items: unknown[], total: number) => 
    track("checkout.started", { cart_id: cartId, items, total }),
  
  checkoutEmailEntered: (email: string) => 
    track("checkout.email_entered", { email }),
  
  checkoutPhoneEntered: (phone: string) => 
    track("checkout.phone_entered", { phone }),
  
  checkoutAddressEntered: (city: string, state: string, zip: string) => 
    track("checkout.address_entered", { city, state, zip }),
  
  checkoutShippingSelected: (method: string, cost: number) => 
    track("checkout.shipping_selected", { method, cost }),
  
  checkoutPaymentStarted: (total: number) => 
    track("checkout.payment_started", { total }),
  
  checkoutCompleted: (orderId: string, total: number) => 
    track("checkout.completed", { order_id: orderId, total }),
  
  checkoutAbandoned: (step: number, cartId: string) => 
    track("checkout.abandoned", { step, cart_id: cartId }),
  
  // Identity
  visitorIdentified: (email?: string, phone?: string, source?: string) => 
    track("visitor.identified", { email, phone, source }),
  
  newsletterSubscribed: (email: string) => 
    track("newsletter.subscribed", { email }),
  
  accountCreated: (customerId: string, email: string) => 
    track("account.created", { customer_id: customerId, email }),
  
  accountLoggedIn: (customerId: string) => 
    track("account.logged_in", { customer_id: customerId }),
  
  // Engagement
  productImageZoomed: (productId: string) => 
    track("product.image_zoomed", { product_id: productId }),
  
  productReviewsViewed: (productId: string) => 
    track("product.reviews_viewed", { product_id: productId }),
  
  productVariantSelected: (productId: string, variantId: string, variantName: string) => 
    track("product.variant_selected", { product_id: productId, variant_id: variantId, variant_name: variantName }),
  
  faqViewed: () => 
    track("faq.viewed", {}),
  
  faqQuestionExpanded: (questionId: string, question: string) => 
    track("faq.question_expanded", { question_id: questionId, question }),
  
  contactFormSubmitted: (subject: string) => 
    track("contact.form_submitted", { subject }),
}
```

### Usage in Components

#### Product Page

```typescript
// src/app/products/[handle]/page.tsx

"use client"

import { useEffect } from "react"
import { Tracker } from "@/lib/tracker"

export default function ProductPage({ product }) {
  // Track product view on mount
  useEffect(() => {
    Tracker.productViewed({
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category,
    })
  }, [product.id])

  const handleAddToCart = () => {
    // ... add to cart logic
    
    Tracker.productAddedToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
    }, "product_page") // source: where they added from
  }

  const handleImageZoom = () => {
    Tracker.productImageZoomed(product.id)
  }

  const handleVariantChange = (variant) => {
    Tracker.productVariantSelected(product.id, variant.id, variant.name)
  }

  // ... rest of component
}
```

#### Collection Page

```typescript
// src/app/collections/[handle]/page.tsx

"use client"

import { useEffect } from "react"
import { Tracker } from "@/lib/tracker"

export default function CollectionPage({ collection, products }) {
  useEffect(() => {
    Tracker.collectionViewed({
      id: collection.id,
      name: collection.name,
      productCount: products.length,
    })
  }, [collection.id])

  const handleProductClick = (product, index) => {
    // Track as a "search result click" equivalent for collection browsing
    Tracker.searchResultClicked(
      `collection:${collection.handle}`,
      product.id,
      index
    )
  }

  // ... rest of component
}
```

#### Navbar (Cart Drawer)

```typescript
// src/components/Navbar.tsx

import { Tracker } from "@/lib/tracker"

// When cart drawer opens
const handleCartOpen = () => {
  setCartOpen(true)
  Tracker.cartViewed(
    cartItems.map(item => ({ id: item.id, quantity: item.quantity })),
    cartItems.reduce((sum, item) => sum + item.priceNum * item.quantity, 0)
  )
}

// When quantity changes
const updateQuantity = (id: number, newQuantity: number) => {
  const item = cartItems.find(i => i.id === id)
  if (item) {
    Tracker.cartQuantityChanged(String(id), item.quantity, newQuantity)
  }
  // ... rest of logic
}

// When item removed
const removeItem = (id: number) => {
  const item = cartItems.find(i => i.id === id)
  if (item) {
    Tracker.productRemovedFromCart(String(id), item.quantity)
  }
  // ... rest of logic
}
```

#### Newsletter Component

```typescript
// src/components/Newsletter.tsx

import { Tracker } from "@/lib/tracker"
import { setIdentity } from "@/lib/identity"

const handleSubmit = async (email: string) => {
  // ... submit logic
  
  // Update identity (triggers merge)
  setIdentity({ email })
  
  // Track subscription
  Tracker.newsletterSubscribed(email)
  Tracker.visitorIdentified(email, undefined, "newsletter")
}
```

#### Checkout Page

```typescript
// src/app/checkout/page.tsx

import { Tracker } from "@/lib/tracker"
import { setIdentity } from "@/lib/identity"

// On checkout page mount
useEffect(() => {
  Tracker.checkoutStarted(checkoutId, cartItems, total)
}, [])

// Email blur handler
const handleEmailBlur = async () => {
  if (!email) return
  
  // Update identity
  setIdentity({ email })
  
  // Track
  Tracker.checkoutEmailEntered(email)
  Tracker.visitorIdentified(email, undefined, "checkout")
  
  // Save to backend
  await saveEmail(checkoutId, email, emailMarketing)
}

// Phone blur handler
const handlePhoneBlur = async () => {
  if (!phone) return
  
  setIdentity({ phone })
  Tracker.checkoutPhoneEntered(phone)
  
  if (!getIdentity().email) {
    Tracker.visitorIdentified(undefined, phone, "checkout")
  }
  
  await savePhone(checkoutId, phone, smsMarketing)
}

// Step changes
const handleStepChange = (newStep: number) => {
  if (newStep === 2) {
    Tracker.checkoutAddressEntered(city, state, zipCode)
  }
  if (newStep === 3) {
    Tracker.checkoutShippingSelected(selectedShipping, shippingCost)
    Tracker.checkoutPaymentStarted(total)
  }
  // ... rest of logic
}

// On successful order
const handleOrderComplete = (orderId: string) => {
  Tracker.checkoutCompleted(orderId, total)
}

// Detect abandonment (on unmount if not completed)
useEffect(() => {
  return () => {
    if (!orderCompleted && currentStep > 0) {
      Tracker.checkoutAbandoned(currentStep, checkoutId)
    }
  }
}, [orderCompleted, currentStep])
```

#### Layout (Global Page Tracking)

```typescript
// src/app/layout.tsx

"use client"

import { usePathname } from "next/navigation"
import { useEffect } from "react"
import { Tracker } from "@/lib/tracker"

export default function RootLayout({ children }) {
  const pathname = usePathname()

  // Track all page views
  useEffect(() => {
    Tracker.pageViewed(document.title)
  }, [pathname])

  return (
    <html>
      <body>{children}</body>
    </html>
  )
}
```

---

## Backend Webhooks

### Tracking Endpoint

**File:** `src/api/store/webhooks/track/route.ts`

```typescript
import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

interface TrackingEvent {
  event: string
  properties: {
    fingerprint_id: string
    session_id: string
    email?: string
    phone?: string
    customer_id?: string
    url: string
    path: string
    referrer?: string
    user_agent?: string
    timestamp: string
    [key: string]: unknown
  }
  timestamp: string
}

interface TrackingPayload {
  events: TrackingEvent[]
}

export async function POST(req: MedusaRequest<TrackingPayload>, res: MedusaResponse) {
  const { events } = req.body
  const logger = req.scope.resolve("logger")

  if (!events || !Array.isArray(events)) {
    return res.status(400).json({ error: "events array required" })
  }

  // Get IP for geo enrichment
  const ip = req.ip || req.headers["x-forwarded-for"] || "unknown"

  try {
    for (const event of events) {
      // Enrich with server-side data
      const enrichedEvent = {
        ...event,
        properties: {
          ...event.properties,
          ip,
          received_at: new Date().toISOString(),
        },
      }

      // Log for debugging
      logger.info(`[Track] ${event.event}`, {
        fingerprint: event.properties.fingerprint_id,
        email: event.properties.email,
      })

      // Store event (choose your storage)
      await storeEvent(req.scope, enrichedEvent)

      // Forward to analytics services
      await forwardToAnalytics(enrichedEvent)
    }

    return res.json({ success: true, processed: events.length })

  } catch (error) {
    logger.error("[Track] Failed:", error)
    return res.status(500).json({ error: "Failed to process events" })
  }
}

// Store in database (for your own analytics/queries)
async function storeEvent(scope: any, event: TrackingEvent) {
  // Option 1: Store in Medusa custom table
  // const eventService = scope.resolve("eventTrackingService")
  // await eventService.create(event)

  // Option 2: Store in separate analytics DB (recommended for scale)
  // await analyticsDB.events.insert(event)

  // Option 3: Just forward to third-party (Segment, Mixpanel, etc.)
  // No local storage needed
}

// Forward to analytics services
async function forwardToAnalytics(event: TrackingEvent) {
  const { fingerprint_id, email, customer_id } = event.properties

  // Determine best identifier
  const userId = customer_id || email || fingerprint_id

  // === KLAVIYO ===
  if (process.env.KLAVIYO_API_KEY) {
    await pushToKlaviyo(event, userId)
  }

  // === SEGMENT ===
  if (process.env.SEGMENT_WRITE_KEY) {
    await pushToSegment(event, userId)
  }

  // === MIXPANEL ===
  if (process.env.MIXPANEL_TOKEN) {
    await pushToMixpanel(event, userId)
  }

  // === GOOGLE ANALYTICS 4 ===
  if (process.env.GA4_MEASUREMENT_ID) {
    await pushToGA4(event, userId)
  }
}

// Klaviyo integration
async function pushToKlaviyo(event: TrackingEvent, userId: string) {
  const apiKey = process.env.KLAVIYO_API_KEY!

  // If we have an email, use Klaviyo's track endpoint
  if (event.properties.email) {
    await fetch("https://a.klaviyo.com/api/events/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Klaviyo-API-Key ${apiKey}`,
        "revision": "2024-02-15",
      },
      body: JSON.stringify({
        data: {
          type: "event",
          attributes: {
            profile: {
              data: {
                type: "profile",
                attributes: {
                  email: event.properties.email,
                  phone_number: event.properties.phone,
                  properties: {
                    fingerprint_id: event.properties.fingerprint_id,
                  },
                },
              },
            },
            metric: {
              data: {
                type: "metric",
                attributes: { name: event.event },
              },
            },
            properties: event.properties,
            time: event.timestamp,
          },
        },
      }),
    })
  }
}

// Segment integration
async function pushToSegment(event: TrackingEvent, userId: string) {
  const writeKey = process.env.SEGMENT_WRITE_KEY!
  const auth = Buffer.from(`${writeKey}:`).toString("base64")

  await fetch("https://api.segment.io/v1/track", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Basic ${auth}`,
    },
    body: JSON.stringify({
      userId,
      anonymousId: event.properties.fingerprint_id,
      event: event.event,
      properties: event.properties,
      timestamp: event.timestamp,
    }),
  })
}

// Mixpanel integration
async function pushToMixpanel(event: TrackingEvent, userId: string) {
  const token = process.env.MIXPANEL_TOKEN!

  await fetch("https://api.mixpanel.com/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify([{
      event: event.event,
      properties: {
        token,
        distinct_id: userId,
        ...event.properties,
        time: new Date(event.timestamp).getTime(),
      },
    }]),
  })
}

// Google Analytics 4 Measurement Protocol
async function pushToGA4(event: TrackingEvent, userId: string) {
  const measurementId = process.env.GA4_MEASUREMENT_ID!
  const apiSecret = process.env.GA4_API_SECRET!

  await fetch(
    `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`,
    {
      method: "POST",
      body: JSON.stringify({
        client_id: event.properties.fingerprint_id,
        user_id: event.properties.customer_id || event.properties.email,
        events: [{
          name: event.event.replace(/\./g, "_"), // GA4 doesn't allow dots
          params: event.properties,
        }],
      }),
    }
  )
}
```

### Identity Merge Endpoint

**File:** `src/api/store/webhooks/identify/route.ts`

```typescript
import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

interface IdentifyPayload {
  fingerprintId: string
  sessionId: string
  email?: string
  phone?: string
  customerId?: string
}

export async function POST(req: MedusaRequest<IdentifyPayload>, res: MedusaResponse) {
  const { fingerprintId, email, phone, customerId } = req.body
  const logger = req.scope.resolve("logger")

  if (!fingerprintId) {
    return res.status(400).json({ error: "fingerprintId required" })
  }

  if (!email && !phone && !customerId) {
    return res.status(400).json({ error: "At least one identifier required" })
  }

  logger.info(`[Identity] Merging ${fingerprintId} → ${email || phone || customerId}`)

  try {
    // 1. Find all events with this fingerprint
    // 2. Update them with the new identifier
    // 3. Create/update profile in analytics services

    // === KLAVIYO: Merge profiles ===
    if (process.env.KLAVIYO_API_KEY && email) {
      await mergeKlaviyoProfile(fingerprintId, email, phone)
    }

    // === SEGMENT: Alias ===
    if (process.env.SEGMENT_WRITE_KEY) {
      await segmentAlias(fingerprintId, email || customerId!)
    }

    // === MIXPANEL: Alias ===
    if (process.env.MIXPANEL_TOKEN) {
      await mixpanelAlias(fingerprintId, email || customerId!)
    }

    return res.json({ success: true })

  } catch (error) {
    logger.error("[Identity] Merge failed:", error)
    return res.status(500).json({ error: "Failed to merge identity" })
  }
}

async function mergeKlaviyoProfile(fingerprintId: string, email: string, phone?: string) {
  const apiKey = process.env.KLAVIYO_API_KEY!

  // Create or update profile with email + fingerprint link
  await fetch("https://a.klaviyo.com/api/profiles/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Klaviyo-API-Key ${apiKey}`,
      "revision": "2024-02-15",
    },
    body: JSON.stringify({
      data: {
        type: "profile",
        attributes: {
          email,
          phone_number: phone,
          properties: {
            fingerprint_id: fingerprintId,
            identified_at: new Date().toISOString(),
          },
        },
      },
    }),
  })
}

async function segmentAlias(anonymousId: string, userId: string) {
  const writeKey = process.env.SEGMENT_WRITE_KEY!
  const auth = Buffer.from(`${writeKey}:`).toString("base64")

  await fetch("https://api.segment.io/v1/alias", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Basic ${auth}`,
    },
    body: JSON.stringify({
      previousId: anonymousId,
      userId,
    }),
  })
}

async function mixpanelAlias(anonymousId: string, userId: string) {
  const token = process.env.MIXPANEL_TOKEN!

  await fetch("https://api.mixpanel.com/track#create-alias", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify([{
      event: "$create_alias",
      properties: {
        token,
        distinct_id: userId,
        alias: anonymousId,
      },
    }]),
  })
}
```

---

## Identity Merge Strategy

### When to Merge

| Trigger | Source | Priority |
|---------|--------|----------|
| Newsletter signup | Newsletter form | High |
| Checkout email entered | Checkout | Critical |
| Checkout phone entered | Checkout | High |
| Account created | Registration | Critical |
| Account logged in | Login | Critical |
| Contact form | Contact page | Medium |

### Merge Logic

```
1. User browses (fingerprint_id = fp_abc123)
   └── Events stored with fingerprint_id only

2. User enters email in checkout (email = test@example.com)
   └── Call /identify endpoint
   └── Link: fp_abc123 → test@example.com
   └── All past events now associated with email
   └── Future events include email

3. User creates account (customer_id = cust_xyz)
   └── Link: fp_abc123 → test@example.com → cust_xyz
   └── Full customer profile with complete history
```

---

## Use Cases

### 1. Browse Abandonment Emails

> "You viewed [Product] but didn't buy..."

```typescript
// Scheduled job: Find fingerprints that viewed products but didn't purchase
// AND later provided email (via newsletter, checkout, etc.)

const browseAbandoners = await db.query(`
  SELECT DISTINCT e.properties->>'email' as email,
         array_agg(e.properties->>'product_id') as viewed_products
  FROM events e
  WHERE e.event = 'product.viewed'
    AND e.properties->>'email' IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM events o
      WHERE o.event = 'checkout.completed'
        AND o.properties->>'email' = e.properties->>'email'
    )
  GROUP BY e.properties->>'email'
`)
```

### 2. Cart Abandonment with Context

> "You left [Product] in your cart. You also looked at [Related Product]..."

```typescript
// When sending abandoned cart email, include browsing history
const userEvents = await getEventsByEmail(email)
const viewedProducts = userEvents
  .filter(e => e.event === "product.viewed")
  .map(e => e.properties.product_id)
```

### 3. Personalized Product Recommendations

> Based on viewed categories, show relevant products

```typescript
const viewedCategories = userEvents
  .filter(e => e.event === "product.viewed")
  .map(e => e.properties.category)
  .filter(Boolean)

const recommendations = await getProductsByCategories(viewedCategories)
```

### 4. Re-engagement Campaigns

> Users who visited 3+ times but never purchased

```typescript
const highIntentNonBuyers = await db.query(`
  SELECT properties->>'email' as email,
         COUNT(DISTINCT properties->>'session_id') as sessions
  FROM events
  WHERE properties->>'email' IS NOT NULL
  GROUP BY properties->>'email'
  HAVING COUNT(DISTINCT properties->>'session_id') >= 3
    AND NOT EXISTS (
      SELECT 1 FROM events
      WHERE event = 'checkout.completed'
        AND properties->>'email' = email
    )
`)
```

### 5. Funnel Analysis

> Where do users drop off?

```typescript
const funnel = {
  viewed_product: await countEvents("product.viewed"),
  added_to_cart: await countEvents("product.added_to_cart"),
  started_checkout: await countEvents("checkout.started"),
  entered_email: await countEvents("checkout.email_entered"),
  entered_address: await countEvents("checkout.address_entered"),
  selected_shipping: await countEvents("checkout.shipping_selected"),
  started_payment: await countEvents("checkout.payment_started"),
  completed: await countEvents("checkout.completed"),
}
```

---

## Environment Variables

```bash
# Analytics services (pick what you use)
KLAVIYO_API_KEY=pk_...
SEGMENT_WRITE_KEY=...
MIXPANEL_TOKEN=...
GA4_MEASUREMENT_ID=G-...
GA4_API_SECRET=...
```

---

## Checklist

### Frontend

- [ ] Fingerprint ID generation (localStorage + cookie)
- [ ] Session ID generation (sessionStorage)
- [ ] Identity state management
- [ ] Event tracker service with batching
- [ ] Page view tracking (layout)
- [ ] Product view tracking
- [ ] Collection view tracking
- [ ] Cart events (view, add, remove, quantity change)
- [ ] Checkout events (all steps)
- [ ] Identity merge on email/phone capture
- [ ] Newsletter subscription tracking
- [ ] Search tracking (if applicable)

### Backend

- [ ] `POST /store/webhooks/track` endpoint
- [ ] `POST /store/webhooks/identify` endpoint
- [ ] Event storage (DB or forward to analytics)
- [ ] Klaviyo integration
- [ ] Segment integration (optional)
- [ ] Browse abandonment job (optional)

---

## Revision History

| Date | Version | Changes |
|------|---------|---------|
| 2024-12-29 | 1.0 | Initial documentation |

