# Medusa Webhook Integration Guide

> Step-by-step guide for setting up inbound and outbound webhooks in a Medusa v2 backend.

---

## Table of Contents

1. [Overview](#overview)
2. [Project Setup](#project-setup)
3. [Inbound Webhooks (Frontend → Medusa)](#inbound-webhooks-frontend--medusa)
4. [Inbound Webhooks (External Services → Medusa)](#inbound-webhooks-external-services--medusa)
5. [Outbound Webhooks (Medusa → External Services)](#outbound-webhooks-medusa--external-services)
6. [Scheduled Jobs](#scheduled-jobs)
7. [Workflows](#workflows)
8. [Security](#security)
9. [Testing](#testing)
10. [Troubleshooting](#troubleshooting)

---

## Overview

### Webhook Types

| Type | Direction | Example |
|------|-----------|---------|
| **Store Webhooks** | Frontend → Medusa | Email saved, phone saved, address saved |
| **External Webhooks** | 3rd Party → Medusa | Stripe payment, Klaviyo unsubscribe |
| **Outbound Webhooks** | Medusa → 3rd Party | Order created → Klaviyo, Slack notification |

### File Structure

```
my-medusa-backend/
├── src/
│   ├── api/
│   │   ├── store/
│   │   │   └── webhooks/           # Frontend → Medusa
│   │   │       ├── email-saved/
│   │   │       │   └── route.ts
│   │   │       ├── phone-saved/
│   │   │       │   └── route.ts
│   │   │       └── address-saved/
│   │   │           └── route.ts
│   │   │
│   │   └── webhooks/               # External → Medusa
│   │       ├── stripe/
│   │       │   └── route.ts
│   │       ├── authorize-net/
│   │       │   └── route.ts
│   │       └── klaviyo/
│   │           └── route.ts
│   │
│   ├── subscribers/                 # Internal event listeners
│   │   ├── cart-updated.ts
│   │   └── order-placed.ts
│   │
│   ├── jobs/                        # Scheduled tasks
│   │   └── abandoned-cart.ts
│   │
│   └── workflows/                   # Multi-step processes
│       └── send-abandoned-cart-email.ts
│
├── medusa-config.ts
└── .env
```

---

## Project Setup

### 1. Initialize Medusa Project (if new)

```bash
npx create-medusa-app@latest my-store-backend
cd my-store-backend
```

### 2. Required Dependencies

```bash
# For external API calls
npm install node-fetch

# For signature verification
# (crypto is built into Node.js)

# For specific integrations
npm install stripe           # If using Stripe
npm install @sendgrid/mail   # If using SendGrid
npm install twilio           # If using Twilio
```

### 3. Environment Variables

Create/update `.env`:

```bash
# =============================================================================
# CORE
# =============================================================================
DATABASE_URL=postgresql://user:pass@localhost:5432/medusa
STORE_CORS=http://localhost:3000
ADMIN_CORS=http://localhost:9000

# =============================================================================
# FRONTEND APP
# =============================================================================
STOREFRONT_URL=http://localhost:3000

# =============================================================================
# RECAPTCHA (for bot protection)
# =============================================================================
RECAPTCHA_SECRET_KEY=6Le...your_secret_key

# =============================================================================
# PAYMENT - STRIPE
# =============================================================================
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# =============================================================================
# PAYMENT - AUTHORIZE.NET
# =============================================================================
AUTHORIZE_NET_API_LOGIN_ID=...
AUTHORIZE_NET_TRANSACTION_KEY=...
AUTHORIZE_NET_WEBHOOK_SECRET=...

# =============================================================================
# EMAIL - SENDGRID
# =============================================================================
SENDGRID_API_KEY=SG...
SENDGRID_FROM_EMAIL=hello@yourstore.com
SENDGRID_FROM_NAME=Your Store

# =============================================================================
# EMAIL - RESEND (alternative)
# =============================================================================
RESEND_API_KEY=re_...

# =============================================================================
# SMS - TWILIO
# =============================================================================
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...

# =============================================================================
# MARKETING - KLAVIYO
# =============================================================================
KLAVIYO_API_KEY=pk_...
KLAVIYO_LIST_ID=...

# =============================================================================
# NOTIFICATIONS - SLACK (optional)
# =============================================================================
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
```

---

## Inbound Webhooks (Frontend → Medusa)

These endpoints receive data from your Next.js frontend.

### Endpoint: Email Saved

**Path:** `POST /store/webhooks/email-saved`

**File:** `src/api/store/webhooks/email-saved/route.ts`

```typescript
import type { 
  MedusaRequest, 
  MedusaResponse 
} from "@medusajs/framework/http"
import type { ICartModuleService } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

type EmailSavedBody = {
  cartId: string
  email: string
  marketingOptIn?: boolean
}

export async function POST(
  req: MedusaRequest<EmailSavedBody>,
  res: MedusaResponse
) {
  const { cartId, email, marketingOptIn } = req.body

  // Validate required fields
  if (!cartId || !email) {
    return res.status(400).json({
      success: false,
      error: "cartId and email are required",
    })
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      error: "Invalid email format",
    })
  }

  try {
    const cartService = req.scope.resolve<ICartModuleService>(Modules.CART)
    const logger = req.scope.resolve("logger")

    // Get existing cart
    const cart = await cartService.retrieveCart(cartId)
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        error: "Cart not found",
      })
    }

    // Update cart with email
    await cartService.updateCarts([{
      id: cartId,
      email,
      metadata: {
        ...(cart.metadata || {}),
        email_captured_at: new Date().toISOString(),
        marketing_email_opt_in: marketingOptIn ?? false,
      },
    }])

    logger.info(`[Webhook] Email saved for cart ${cartId}: ${email}`)

    // Optional: Sync to Klaviyo immediately
    // await syncToKlaviyo(email, { cart_id: cartId, opted_in: marketingOptIn })

    return res.status(200).json({ success: true })

  } catch (error) {
    const logger = req.scope.resolve("logger")
    logger.error(`[Webhook] Email save failed for cart ${cartId}:`, error)
    
    return res.status(500).json({
      success: false,
      error: "Failed to save email",
    })
  }
}
```

### Endpoint: Phone Saved

**Path:** `POST /store/webhooks/phone-saved`

**File:** `src/api/store/webhooks/phone-saved/route.ts`

```typescript
import type { 
  MedusaRequest, 
  MedusaResponse 
} from "@medusajs/framework/http"
import type { ICartModuleService } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

type PhoneSavedBody = {
  cartId: string
  phone: string
  smsOptIn?: boolean
}

export async function POST(
  req: MedusaRequest<PhoneSavedBody>,
  res: MedusaResponse
) {
  const { cartId, phone, smsOptIn } = req.body

  if (!cartId || !phone) {
    return res.status(400).json({
      success: false,
      error: "cartId and phone are required",
    })
  }

  try {
    const cartService = req.scope.resolve<ICartModuleService>(Modules.CART)
    const logger = req.scope.resolve("logger")

    const cart = await cartService.retrieveCart(cartId)
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        error: "Cart not found",
      })
    }

    // Store phone in metadata (not a native cart field)
    await cartService.updateCarts([{
      id: cartId,
      metadata: {
        ...(cart.metadata || {}),
        phone,
        phone_captured_at: new Date().toISOString(),
        marketing_sms_opt_in: smsOptIn ?? false,
      },
    }])

    logger.info(`[Webhook] Phone saved for cart ${cartId}: ${phone}`)

    return res.status(200).json({ success: true })

  } catch (error) {
    const logger = req.scope.resolve("logger")
    logger.error(`[Webhook] Phone save failed for cart ${cartId}:`, error)
    
    return res.status(500).json({
      success: false,
      error: "Failed to save phone",
    })
  }
}
```

### Endpoint: Address Saved

**Path:** `POST /store/webhooks/address-saved`

**File:** `src/api/store/webhooks/address-saved/route.ts`

```typescript
import type { 
  MedusaRequest, 
  MedusaResponse 
} from "@medusajs/framework/http"
import type { ICartModuleService } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

type AddressSavedBody = {
  cartId: string
  address: {
    firstName: string
    lastName: string
    address: string
    apartment?: string
    city: string
    state: string
    zipCode: string
    country?: string
  }
}

export async function POST(
  req: MedusaRequest<AddressSavedBody>,
  res: MedusaResponse
) {
  const { cartId, address } = req.body

  if (!cartId || !address) {
    return res.status(400).json({
      success: false,
      error: "cartId and address are required",
    })
  }

  // Validate required address fields
  const required = ["firstName", "lastName", "address", "city", "state", "zipCode"]
  const missing = required.filter(field => !address[field as keyof typeof address])
  
  if (missing.length > 0) {
    return res.status(400).json({
      success: false,
      error: `Missing required fields: ${missing.join(", ")}`,
    })
  }

  try {
    const cartService = req.scope.resolve<ICartModuleService>(Modules.CART)
    const logger = req.scope.resolve("logger")

    const cart = await cartService.retrieveCart(cartId)
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        error: "Cart not found",
      })
    }

    // Update shipping address
    await cartService.updateCarts([{
      id: cartId,
      shipping_address: {
        first_name: address.firstName,
        last_name: address.lastName,
        address_1: address.address,
        address_2: address.apartment || "",
        city: address.city,
        province: address.state,
        postal_code: address.zipCode,
        country_code: address.country || "us",
      },
      metadata: {
        ...(cart.metadata || {}),
        address_captured_at: new Date().toISOString(),
      },
    }])

    logger.info(`[Webhook] Address saved for cart ${cartId}`)

    return res.status(200).json({ success: true })

  } catch (error) {
    const logger = req.scope.resolve("logger")
    logger.error(`[Webhook] Address save failed for cart ${cartId}:`, error)
    
    return res.status(500).json({
      success: false,
      error: "Failed to save address",
    })
  }
}
```

### Frontend Integration

Create a helper file in your Next.js frontend:

**File:** `src/lib/medusa-webhooks.ts`

```typescript
const MEDUSA_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"

async function callWebhook<T>(endpoint: string, data: T): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${MEDUSA_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Include cookies for session
      body: JSON.stringify(data),
    })

    return await response.json()
  } catch (error) {
    console.error(`[Webhook] ${endpoint} failed:`, error)
    return { success: false, error: "Network error" }
  }
}

export async function saveEmail(
  cartId: string,
  email: string,
  marketingOptIn: boolean = false
) {
  return callWebhook("/store/webhooks/email-saved", {
    cartId,
    email,
    marketingOptIn,
  })
}

export async function savePhone(
  cartId: string,
  phone: string,
  smsOptIn: boolean = false
) {
  return callWebhook("/store/webhooks/phone-saved", {
    cartId,
    phone,
    smsOptIn,
  })
}

export async function saveAddress(
  cartId: string,
  address: {
    firstName: string
    lastName: string
    address: string
    apartment?: string
    city: string
    state: string
    zipCode: string
  }
) {
  return callWebhook("/store/webhooks/address-saved", {
    cartId,
    address,
  })
}
```

---

## Inbound Webhooks (External Services → Medusa)

These endpoints receive webhooks from payment processors, email platforms, etc.

### Stripe Webhook

**Path:** `POST /webhooks/stripe`

**File:** `src/api/webhooks/stripe/route.ts`

```typescript
import type { 
  MedusaRequest, 
  MedusaResponse 
} from "@medusajs/framework/http"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const logger = req.scope.resolve("logger")
  const signature = req.headers["stripe-signature"] as string

  if (!signature) {
    logger.warn("[Stripe Webhook] Missing signature header")
    return res.status(400).json({ error: "Missing signature" })
  }

  let event: Stripe.Event

  try {
    // Note: You may need raw body access - see troubleshooting section
    const rawBody = JSON.stringify(req.body)
    event = stripe.webhooks.constructEvent(rawBody, signature, WEBHOOK_SECRET)
  } catch (err) {
    logger.error("[Stripe Webhook] Signature verification failed:", err)
    return res.status(401).json({ error: "Invalid signature" })
  }

  logger.info(`[Stripe Webhook] Received: ${event.type}`)

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        logger.info(`[Stripe] Payment succeeded: ${paymentIntent.id}`)
        
        // Get cart ID from metadata (you'd pass this when creating the PI)
        const cartId = paymentIntent.metadata?.cart_id
        if (cartId) {
          // Complete the order in Medusa
          // await completeOrder(req.scope, cartId, paymentIntent.id)
        }
        break
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        logger.warn(`[Stripe] Payment failed: ${paymentIntent.id}`)
        logger.warn(`[Stripe] Failure reason: ${paymentIntent.last_payment_error?.message}`)
        break
      }

      case "charge.dispute.created": {
        const dispute = event.data.object as Stripe.Dispute
        logger.error(`[Stripe] DISPUTE CREATED: ${dispute.id}`)
        // Flag the customer, notify team, etc.
        break
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge
        logger.info(`[Stripe] Refund processed: ${charge.id}`)
        break
      }

      default:
        logger.info(`[Stripe Webhook] Unhandled event type: ${event.type}`)
    }

    return res.status(200).json({ received: true })

  } catch (error) {
    logger.error(`[Stripe Webhook] Handler error:`, error)
    return res.status(500).json({ error: "Webhook handler failed" })
  }
}
```

### Authorize.net Webhook

**Path:** `POST /webhooks/authorize-net`

**File:** `src/api/webhooks/authorize-net/route.ts`

```typescript
import type { 
  MedusaRequest, 
  MedusaResponse 
} from "@medusajs/framework/http"
import crypto from "crypto"

const WEBHOOK_SECRET = process.env.AUTHORIZE_NET_WEBHOOK_SECRET!

function verifyAuthorizeNetSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    // Authorize.net uses SHA-512 HMAC
    const hash = crypto
      .createHmac("sha512", secret)
      .update(payload)
      .digest("hex")
      .toUpperCase()

    // Signature comes as "sha512=HASH"
    const expectedHash = signature.replace("sha512=", "").toUpperCase()

    return crypto.timingSafeEqual(
      Buffer.from(hash),
      Buffer.from(expectedHash)
    )
  } catch {
    return false
  }
}

interface AuthorizeNetEvent {
  notificationId: string
  eventType: string
  eventDate: string
  webhookId: string
  payload: {
    responseCode: number
    authCode: string
    avsResponse: string
    authAmount: number
    entityName: string
    id: string
    // merchantReferenceId contains your cartId
    merchantReferenceId?: string
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const logger = req.scope.resolve("logger")
  const signature = req.headers["x-anet-signature"] as string

  if (!signature) {
    logger.warn("[Authorize.net] Missing signature header")
    return res.status(400).json({ error: "Missing signature" })
  }

  const rawBody = JSON.stringify(req.body)

  if (!verifyAuthorizeNetSignature(rawBody, signature, WEBHOOK_SECRET)) {
    logger.error("[Authorize.net] Signature verification failed")
    return res.status(401).json({ error: "Invalid signature" })
  }

  const event = req.body as AuthorizeNetEvent

  logger.info(`[Authorize.net] Received: ${event.eventType}`)

  try {
    switch (event.eventType) {
      case "net.authorize.payment.authcapture.created": {
        // Payment authorized and captured
        const transactionId = event.payload.id
        const cartId = event.payload.merchantReferenceId
        
        logger.info(`[Authorize.net] Payment captured: ${transactionId}`)
        
        if (cartId) {
          // Complete order
          // await completeOrder(req.scope, cartId, transactionId)
        }
        break
      }

      case "net.authorize.payment.authorization.created": {
        // Payment authorized only (not captured)
        logger.info(`[Authorize.net] Payment authorized: ${event.payload.id}`)
        break
      }

      case "net.authorize.payment.fraud.held": {
        // Held for fraud review
        logger.warn(`[Authorize.net] FRAUD HOLD: ${event.payload.id}`)
        // Notify team
        break
      }

      case "net.authorize.payment.fraud.declined": {
        // Declined due to fraud
        logger.error(`[Authorize.net] FRAUD DECLINED: ${event.payload.id}`)
        break
      }

      case "net.authorize.payment.refund.created": {
        logger.info(`[Authorize.net] Refund created: ${event.payload.id}`)
        break
      }

      case "net.authorize.payment.void.created": {
        logger.info(`[Authorize.net] Void created: ${event.payload.id}`)
        break
      }

      default:
        logger.info(`[Authorize.net] Unhandled: ${event.eventType}`)
    }

    return res.status(200).json({ received: true })

  } catch (error) {
    logger.error("[Authorize.net] Handler error:", error)
    return res.status(500).json({ error: "Webhook handler failed" })
  }
}
```

### Klaviyo Webhook

**Path:** `POST /webhooks/klaviyo`

**File:** `src/api/webhooks/klaviyo/route.ts`

```typescript
import type { 
  MedusaRequest, 
  MedusaResponse 
} from "@medusajs/framework/http"

interface KlaviyoEvent {
  type: string
  data: {
    email: string
    list_id?: string
    reason?: string
    timestamp: string
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const logger = req.scope.resolve("logger")
  const event = req.body as KlaviyoEvent

  logger.info(`[Klaviyo] Received: ${event.type}`)

  try {
    switch (event.type) {
      case "unsubscribed": {
        const email = event.data.email
        logger.info(`[Klaviyo] Unsubscribe: ${email}`)

        // Find customer by email and update preferences
        const customerService = req.scope.resolve("customerModuleService")
        
        const [customer] = await customerService.listCustomers({
          email,
        })

        if (customer) {
          await customerService.updateCustomers([{
            id: customer.id,
            metadata: {
              ...customer.metadata,
              marketing_email_opt_in: false,
              unsubscribed_at: new Date().toISOString(),
              unsubscribe_reason: event.data.reason || "user_request",
            },
          }])
          logger.info(`[Klaviyo] Updated customer ${customer.id}`)
        }
        break
      }

      case "subscribed": {
        // User re-subscribed
        const email = event.data.email
        logger.info(`[Klaviyo] Subscribe: ${email}`)
        break
      }

      case "bounced": {
        // Email bounced - mark as invalid
        logger.warn(`[Klaviyo] Bounce: ${event.data.email}`)
        break
      }

      case "marked_as_spam": {
        // Spam complaint - serious, must stop emailing
        logger.error(`[Klaviyo] SPAM COMPLAINT: ${event.data.email}`)
        break
      }

      default:
        logger.info(`[Klaviyo] Unhandled: ${event.type}`)
    }

    return res.status(200).json({ received: true })

  } catch (error) {
    logger.error("[Klaviyo] Handler error:", error)
    return res.status(500).json({ error: "Webhook handler failed" })
  }
}
```

---

## Outbound Webhooks (Medusa → External Services)

Use **Subscribers** to listen for Medusa events and send data to external services.

### Cart Updated Subscriber

**File:** `src/subscribers/cart-updated.ts`

```typescript
import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"

type CartUpdatedData = {
  id: string
}

export default async function cartUpdatedHandler({
  event,
  container,
}: SubscriberArgs<CartUpdatedData>) {
  const logger = container.resolve("logger")
  const cartService = container.resolve(Modules.CART)
  
  const cartId = event.data.id

  try {
    const cart = await cartService.retrieveCart(cartId, {
      relations: ["items", "items.variant", "items.variant.product"],
    })

    if (!cart) return

    // Log for debugging
    logger.info(`[Cart Updated] ${cartId}, email: ${cart.email || "none"}`)

    // Example: Push to Klaviyo when email is captured
    if (cart.email && cart.metadata?.email_captured_at) {
      await pushToKlaviyo({
        email: cart.email,
        event: "Started Checkout",
        properties: {
          cart_id: cart.id,
          items: cart.items?.map(item => ({
            name: item.title,
            quantity: item.quantity,
            price: item.unit_price,
          })),
          total: cart.total,
        },
      })
    }

  } catch (error) {
    logger.error(`[Cart Updated] Handler failed for ${cartId}:`, error)
  }
}

export const config: SubscriberConfig = {
  event: "cart.updated",
}

// Helper function
async function pushToKlaviyo(data: {
  email: string
  event: string
  properties: Record<string, unknown>
}) {
  const apiKey = process.env.KLAVIYO_API_KEY
  if (!apiKey) return

  await fetch("https://a.klaviyo.com/api/track", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Klaviyo-API-Key ${apiKey}`,
    },
    body: JSON.stringify({
      data: {
        type: "event",
        attributes: {
          profile: { email: data.email },
          metric: { name: data.event },
          properties: data.properties,
        },
      },
    }),
  })
}
```

### Order Placed Subscriber

**File:** `src/subscribers/order-placed.ts`

```typescript
import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"

type OrderPlacedData = {
  id: string
}

export default async function orderPlacedHandler({
  event,
  container,
}: SubscriberArgs<OrderPlacedData>) {
  const logger = container.resolve("logger")
  const orderId = event.data.id

  logger.info(`[Order Placed] ${orderId}`)

  // Send Slack notification
  await sendSlackNotification(`🎉 New order: ${orderId}`)

  // Push to Klaviyo
  // Push to Google Analytics
  // Update inventory in external system
  // etc.
}

export const config: SubscriberConfig = {
  event: "order.placed",
}

async function sendSlackNotification(message: string) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL
  if (!webhookUrl) return

  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: message }),
  })
}
```

---

## Scheduled Jobs

### Abandoned Cart Job

**File:** `src/jobs/abandoned-cart.ts`

```typescript
import type { MedusaContainer } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

export default async function abandonedCartJob(container: MedusaContainer) {
  const logger = container.resolve("logger")
  const cartService = container.resolve(Modules.CART)
  const workflowEngine = container.resolve("workflowEngine")

  logger.info("[Abandoned Cart Job] Starting...")

  // Time windows
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
  const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000)

  try {
    // Find abandoned carts
    const carts = await cartService.listCarts(
      {
        // Has email (required for recovery)
        email: { $ne: null },
        // Not completed
        completed_at: null,
        // Updated between 1 hour and 48 hours ago
        updated_at: {
          $lt: oneHourAgo.toISOString(),
          $gt: fortyEightHoursAgo.toISOString(),
        },
      },
      {
        relations: ["items", "shipping_address"],
      }
    )

    // Filter: has items, recovery email not sent
    const eligibleCarts = carts.filter(cart =>
      cart.items?.length > 0 &&
      !cart.metadata?.abandoned_email_sent
    )

    logger.info(`[Abandoned Cart Job] Found ${eligibleCarts.length} carts to recover`)

    for (const cart of eligibleCarts) {
      try {
        // Run email workflow
        await workflowEngine.run("send-abandoned-cart-email", {
          input: {
            cartId: cart.id,
            email: cart.email!,
            customerName: cart.shipping_address?.first_name || "there",
            items: cart.items!.map(item => ({
              title: item.title,
              quantity: item.quantity,
              unit_price: item.unit_price,
              thumbnail: item.thumbnail,
            })),
            phone: cart.metadata?.phone,
          },
        })

        // Mark as sent
        await cartService.updateCarts([{
          id: cart.id,
          metadata: {
            ...cart.metadata,
            abandoned_email_sent: true,
            abandoned_email_sent_at: new Date().toISOString(),
          },
        }])

        logger.info(`[Abandoned Cart Job] Email sent for cart ${cart.id}`)

      } catch (err) {
        logger.error(`[Abandoned Cart Job] Failed for cart ${cart.id}:`, err)
      }
    }

    logger.info("[Abandoned Cart Job] Completed")

  } catch (error) {
    logger.error("[Abandoned Cart Job] Failed:", error)
  }
}

export const config = {
  name: "abandoned-cart-recovery",
  schedule: "*/15 * * * *", // Every 15 minutes
}
```

---

## Workflows

### Send Abandoned Cart Email

**File:** `src/workflows/send-abandoned-cart-email.ts`

```typescript
import {
  createWorkflow,
  createStep,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"

type WorkflowInput = {
  cartId: string
  email: string
  customerName: string
  items: Array<{
    title: string
    quantity: number
    unit_price: number
    thumbnail?: string
  }>
  phone?: string
}

// Step 1: Send email
const sendEmailStep = createStep(
  "send-abandoned-cart-email",
  async (input: WorkflowInput, { container }) => {
    const logger = container.resolve("logger")

    // Calculate cart total
    const cartTotal = input.items.reduce(
      (sum, item) => sum + (item.unit_price * item.quantity),
      0
    )

    // Build recovery link with cart ID
    const recoveryLink = `${process.env.STOREFRONT_URL}/checkout?cart=${input.cartId}`

    // Email template data
    const emailData = {
      to: input.email,
      subject: `Hey ${input.customerName}, you left something behind! 🛒`,
      template: "abandoned-cart", // Your email template ID
      data: {
        customerName: input.customerName,
        items: input.items,
        cartTotal: (cartTotal / 100).toFixed(2), // Cents to dollars
        recoveryLink,
        // Optional incentive
        discountCode: "COMEBACK10",
        discountPercent: 10,
      },
    }

    // TODO: Replace with your email service
    // Example with SendGrid:
    // const sgMail = require("@sendgrid/mail")
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    // await sgMail.send({
    //   to: emailData.to,
    //   from: process.env.SENDGRID_FROM_EMAIL,
    //   subject: emailData.subject,
    //   templateId: "d-your-template-id",
    //   dynamicTemplateData: emailData.data,
    // })

    logger.info(`[Abandoned Cart Email] Sent to ${input.email}`)

    return new StepResponse({
      sent: true,
      email: input.email,
      cartId: input.cartId,
    })
  }
)

// Step 2: Optional - Send SMS
const sendSmsStep = createStep(
  "send-abandoned-cart-sms",
  async (input: WorkflowInput, { container }) => {
    const logger = container.resolve("logger")

    if (!input.phone) {
      return new StepResponse({ sent: false, reason: "no_phone" })
    }

    // TODO: Replace with Twilio
    // const twilio = require("twilio")(
    //   process.env.TWILIO_ACCOUNT_SID,
    //   process.env.TWILIO_AUTH_TOKEN
    // )
    // await twilio.messages.create({
    //   to: input.phone,
    //   from: process.env.TWILIO_PHONE_NUMBER,
    //   body: `Hey ${input.customerName}! You left items in your cart. Complete your order: ${recoveryLink}`,
    // })

    logger.info(`[Abandoned Cart SMS] Would send to ${input.phone}`)

    return new StepResponse({
      sent: true,
      phone: input.phone,
    })
  }
)

// Workflow
export const sendAbandonedCartEmailWorkflow = createWorkflow(
  "send-abandoned-cart-email",
  (input: WorkflowInput) => {
    const emailResult = sendEmailStep(input)
    const smsResult = sendSmsStep(input)

    return new WorkflowResponse({
      email: emailResult,
      sms: smsResult,
    })
  }
)
```

---

## Security

### 1. CORS Configuration

In `medusa-config.ts`:

```typescript
export default defineConfig({
  projectConfig: {
    http: {
      // Only allow requests from your frontend
      storeCors: process.env.STORE_CORS || "https://yourstore.com",
      adminCors: process.env.ADMIN_CORS || "https://admin.yourstore.com",
    },
  },
})
```

### 2. Rate Limiting (optional)

Create middleware at `src/api/middlewares.ts`:

```typescript
import type { MedusaNextFunction, MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

// Simple in-memory rate limiter
const requestCounts = new Map<string, { count: number; resetAt: number }>()

export function rateLimiter(limit: number, windowMs: number) {
  return (req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
    const key = req.ip || "unknown"
    const now = Date.now()
    
    const record = requestCounts.get(key)
    
    if (!record || now > record.resetAt) {
      requestCounts.set(key, { count: 1, resetAt: now + windowMs })
      return next()
    }
    
    if (record.count >= limit) {
      return res.status(429).json({ error: "Too many requests" })
    }
    
    record.count++
    return next()
  }
}

// Apply to webhook routes
export const config = {
  routes: [
    {
      matcher: "/store/webhooks/*",
      middlewares: [rateLimiter(100, 60000)], // 100 requests per minute
    },
  ],
}
```

### 3. Signature Verification

Always verify signatures for external webhooks. Examples provided in each webhook section above.

---

## Testing

### Local Testing with ngrok

```bash
# Expose your local Medusa to the internet
ngrok http 9000

# Use the ngrok URL for webhook configuration
# https://abc123.ngrok.io/webhooks/stripe
```

### Testing Frontend Webhooks

```bash
# Test email-saved endpoint
curl -X POST http://localhost:9000/store/webhooks/email-saved \
  -H "Content-Type: application/json" \
  -d '{"cartId": "cart_123", "email": "test@example.com", "marketingOptIn": true}'
```

### Testing Stripe Webhooks

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Forward webhooks to local
stripe listen --forward-to localhost:9000/webhooks/stripe

# Trigger test event
stripe trigger payment_intent.succeeded
```

---

## Troubleshooting

### Raw Body for Signature Verification

Some services (Stripe, especially) need the raw request body for signature verification. If you're having issues:

1. Check if Medusa is parsing the body before your handler
2. You may need custom middleware to preserve raw body
3. Consider using a separate Express endpoint for raw body access

### CORS Errors

If frontend can't reach webhooks:

1. Check `STORE_CORS` in `.env`
2. Verify origin header matches allowed origin
3. Check for trailing slashes in URL

### Webhook Not Firing

1. Check scheduled job logs: `medusa develop`
2. Verify subscriber is registered correctly
3. Check event name matches exactly
4. Verify the file is in the correct directory

### Signature Verification Failing

1. Check secret key matches what's in service dashboard
2. Verify you're using the correct hashing algorithm
3. Check for encoding issues (UTF-8 vs ASCII)
4. Ensure raw body isn't being modified

---

## Revision History

| Date | Version | Changes |
|------|---------|---------|
| 2024-12-29 | 1.0 | Initial documentation |

