# Drinkyum + Medusa Multistore Full Integration Guide

## Overview

This document provides complete integration instructions for connecting the **Drinkyum Next.js storefront** (`/Users/ivan/Drinkyum`) to the **Medusa Multistore backend** (`/Users/ivan/medusa-multistore-v2`).

**Frontend**: Next.js 16 + React 19 + TypeScript + Tailwind CSS 4
**Backend**: Medusa v2 with custom multi-tenant modules

---

## Table of Contents

0. [New Tenant Setup Checklist](#0-new-tenant-setup-checklist) ⬅️ START HERE
1. [Environment Configuration](#1-environment-configuration)
2. [Tenant Context Setup](#2-tenant-context-setup)
3. [API Client Setup](#3-api-client-setup)
4. [Authentication Integration](#4-authentication-integration)
5. [Products Integration](#5-products-integration)
6. [Cart & Checkout Integration](#6-cart--checkout-integration)
7. [Shipping Integration](#7-shipping-integration)
8. [Payment Integration](#8-payment-integration)
9. [Subscriptions (Subscribe & Save)](#9-subscriptions-subscribe--save)
10. [Customer Account Integration](#10-customer-account-integration)
11. [Blog/Content Integration](#11-blogcontent-integration)
12. [Customer Activity Tracking](#12-customer-activity-tracking)
13. [Webhook Endpoints](#13-webhook-endpoints)
14. [File Uploads (CDN)](#14-file-uploads-cdn)
15. [Error Handling](#15-error-handling)

---

## 0. New Tenant Setup Checklist

When creating a new tenant like "DrinkYUM", follow these steps in order:

### Step 1: Create the Tenant (Backend Admin)

```bash
# Via API (as super admin)
curl -X POST https://api.yourbackend.com/admin/tenants \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "drinkyum",
    "name": "DrinkYUM",
    "domain": "drinkyum.com"
  }'
```

This automatically:
- Creates PostgreSQL schema `tenant_drinkyum`
- Copies all 131 Medusa tables
- Seeds: store, currencies (USD/EUR/GBP/CAD/AUD), sales channel, region, payment/fulfillment providers
- Creates CMS and LMS tables

### Step 2: Configure Email (SES/SendGrid/Resend)

```bash
# Update tenant with email config
curl -X PATCH https://api.yourbackend.com/admin/tenants/drinkyum \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email_config": {
      "provider": "ses",
      "sender_email": "orders@drinkyum.com",
      "sender_name": "DrinkYUM",
      "ses_region": "us-east-1"
    }
  }'
```

**For SES specifically:**
1. Verify sender email in AWS SES Console
2. If in sandbox mode, verify recipient emails too
3. Request production access when ready
4. Global env vars needed:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_SES_REGION=us-east-1`

**For SendGrid:**
- Set `SENDGRID_API_KEY` globally
- Provider auto-detects from env

### Step 3: Configure Payment Gateway

```bash
# Add Stripe credentials (encrypted at rest)
curl -X POST https://api.yourbackend.com/admin/tenants/drinkyum/payment-gateways \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "gateway_id": "stripe",
    "credentials": {
      "api_key": "sk_live_...",
      "webhook_secret": "whsec_...",
      "publishable_key": "pk_live_..."
    },
    "is_default": true
  }'
```

**Required global env:**
- `ENCRYPTION_KEY` - 32-byte base64 key for credential encryption

### Step 4: S3 File Storage (Product Images)

**Current architecture:** Single S3 bucket with tenant prefixes
- Files stored as: `{tenant-slug}/{category}/{filename}`
- Example: `drinkyum/products/abc123.jpg`

**Global env vars (already configured):**
```env
S3_BUCKET=medusa-multistore-assets
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=AKIA...
S3_SECRET_ACCESS_KEY=...
S3_FILE_URL=https://medusa-multistore-assets.s3.us-east-1.amazonaws.com
```

**No per-tenant S3 config needed** - files auto-prefix with tenant slug.

### Step 5: Frontend CDN URL Rewriting ⚠️ CRITICAL

The backend returns relative URLs like `/cdn/products/abc123.jpg`.
The frontend MUST rewrite these to the actual S3 URL.

**Add to `next.config.ts`:**

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/cdn/:path*',
        destination: `${process.env.S3_FILE_URL}/${process.env.NEXT_PUBLIC_TENANT_SLUG}/:path*`,
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'medusa-multistore-assets.s3.us-east-1.amazonaws.com',
      },
    ],
  },
}

export default nextConfig
```

**Frontend `.env.local`:**
```env
S3_FILE_URL=https://medusa-multistore-assets.s3.us-east-1.amazonaws.com
NEXT_PUBLIC_TENANT_SLUG=drinkyum
```

**How it works:**
1. Product image in DB: `/cdn/products/abc123.jpg`
2. Frontend renders `<img src="/cdn/products/abc123.jpg">`
3. Vercel rewrites to: `https://medusa-multistore-assets.s3.us-east-1.amazonaws.com/drinkyum/products/abc123.jpg`

### Step 6: Assign Admin Users

```bash
curl -X POST https://api.yourbackend.com/admin/tenants/drinkyum/users \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user_abc123",
    "role": "owner"
  }'
```

Roles: `owner`, `admin`, `editor`, `viewer`

### Step 7: Activate Tenant

```bash
curl -X PATCH https://api.yourbackend.com/admin/tenants/drinkyum \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "active"}'
```

### Step 8: Configure Webhooks in External Services

| Service | Webhook URL | Purpose |
|---------|-------------|---------|
| Stripe | `https://api.drinkyum.com/webhooks/stripe` | Payment events |
| Stripe (subs) | `https://api.drinkyum.com/webhooks/stripe-subscription` | Subscription events |
| EasyPost | `https://api.drinkyum.com/webhooks/easypost` | Shipping tracking |

### Quick Reference: What's Automatic vs Manual

| Item | Automatic | Manual |
|------|-----------|--------|
| DB schema creation | ✅ | |
| Table seeding | ✅ | |
| S3 file prefixing | ✅ | |
| Email provider config | | ✅ |
| Payment gateway setup | | ✅ |
| User assignment | | ✅ |
| Frontend CDN rewrites | | ✅ |
| External webhooks | | ✅ |
| DNS/domain setup | | ✅ |

---

## 1. Environment Configuration

### Frontend `.env.local`

```env
# Medusa Backend
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://api.drinkyum.com
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_xxxxxxxxxxxxxxxx

# Tenant Identification
NEXT_PUBLIC_TENANT_SLUG=drinkyum

# Stripe (for payment elements)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxx

# Google Places (existing)
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=AIzaSyDVI9VKtlMCUL1t-8eGrerNAfWlBk-Ffr4

# reCAPTCHA (move secret to backend!)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6Lef7TUsAAAAANALvxWg6MERR4J_O6i2evG9bd91

# Analytics (optional)
NEXT_PUBLIC_SEGMENT_WRITE_KEY=xxxxxxxx
```

### Backend Environment (medusa-multistore-v2)

Ensure these are set:
```env
# Tenant for Drinkyum
TENANT_BASE_DOMAIN=drinkyum.com

# Payment Providers
STRIPE_API_KEY=sk_live_xxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxx
AUTHORIZE_NET_API_LOGIN_ID=xxxxxxxx
AUTHORIZE_NET_TRANSACTION_KEY=xxxxxxxx

# Email
RESEND_API_KEY=re_xxxxxxxx
RESEND_FROM_EMAIL=orders@drinkyum.com

# S3 Storage
S3_BUCKET=drinkyum-assets
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=xxxxxxxx
S3_SECRET_ACCESS_KEY=xxxxxxxx
S3_FILE_URL=https://drinkyum-assets.s3.amazonaws.com
```

---

## 2. Tenant Context Setup

Every API request must include tenant identification.

### Option A: Header-Based (Recommended for API calls)

```typescript
// src/lib/api-client.ts
const TENANT_SLUG = process.env.NEXT_PUBLIC_TENANT_SLUG || 'drinkyum'

export function getHeaders(authToken?: string): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'X-Tenant-ID': TENANT_SLUG,
  }

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`
  }

  return headers
}
```

### Option B: Cookie-Based (For browser persistence)

```typescript
// Set tenant cookie on app load
document.cookie = `x-tenant-id=${TENANT_SLUG}; path=/; secure; samesite=strict`
```

---

## 3. API Client Setup

### Create `/src/lib/medusa-client.ts`

```typescript
const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'
const TENANT_SLUG = process.env.NEXT_PUBLIC_TENANT_SLUG || 'drinkyum'

interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

class MedusaClient {
  private authToken: string | null = null

  constructor() {
    // Load token from localStorage on init
    if (typeof window !== 'undefined') {
      this.authToken = localStorage.getItem('medusa_auth_token')
    }
  }

  setAuthToken(token: string | null) {
    this.authToken = token
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('medusa_auth_token', token)
      } else {
        localStorage.removeItem('medusa_auth_token')
      }
    }
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'X-Tenant-ID': TENANT_SLUG,
    }
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`
    }
    return headers
  }

  async get<T>(path: string): Promise<ApiResponse<T>> {
    const res = await fetch(`${BACKEND_URL}${path}`, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
    })
    return res.json()
  }

  async post<T>(path: string, body?: any): Promise<ApiResponse<T>> {
    const res = await fetch(`${BACKEND_URL}${path}`, {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include',
      body: body ? JSON.stringify(body) : undefined,
    })
    return res.json()
  }

  async patch<T>(path: string, body: any): Promise<ApiResponse<T>> {
    const res = await fetch(`${BACKEND_URL}${path}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify(body),
    })
    return res.json()
  }

  async delete<T>(path: string): Promise<ApiResponse<T>> {
    const res = await fetch(`${BACKEND_URL}${path}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
      credentials: 'include',
    })
    return res.json()
  }
}

export const medusa = new MedusaClient()
```

---

## 4. Authentication Integration

### 4.1 Customer Registration

**Endpoint**: `POST /store/auth/register`

```typescript
// src/lib/auth.ts
interface RegisterData {
  email: string
  password: string
  first_name: string
  last_name: string
  phone?: string
}

export async function registerCustomer(data: RegisterData) {
  const response = await medusa.post('/store/auth/register', data)

  if (response.token) {
    medusa.setAuthToken(response.token)
  }

  return response
}
```

### 4.2 Customer Login

**Endpoint**: `POST /store/auth/login`

```typescript
export async function loginCustomer(email: string, password: string) {
  const response = await medusa.post('/store/auth/login', { email, password })

  if (response.token) {
    medusa.setAuthToken(response.token)
  }

  return response
}
```

### 4.3 Logout

**Endpoint**: `POST /store/auth/logout`

```typescript
export async function logoutCustomer() {
  await medusa.post('/store/auth/logout')
  medusa.setAuthToken(null)
}
```

### 4.4 Password Reset Flow

```typescript
// Request reset
export async function requestPasswordReset(email: string) {
  return medusa.post('/store/auth/password-reset', { email })
}

// Confirm reset (from email link)
export async function confirmPasswordReset(token: string, password: string) {
  return medusa.post('/store/auth/password-reset/confirm', { token, password })
}
```

### 4.5 Email Verification

```typescript
export async function verifyEmail(token: string) {
  return medusa.post('/store/auth/verify-email', { token })
}

export async function resendVerificationEmail() {
  return medusa.post('/store/auth/verify-email/resend')
}
```

---

## 5. Products Integration

### 5.1 Fetch Products (Use Medusa SDK)

```typescript
// Use Medusa's built-in store API
export async function getProducts(params?: {
  collection_id?: string
  limit?: number
  offset?: number
}) {
  const query = new URLSearchParams()
  if (params?.collection_id) query.set('collection_id', params.collection_id)
  if (params?.limit) query.set('limit', params.limit.toString())
  if (params?.offset) query.set('offset', params.offset.toString())

  return medusa.get(`/store/products?${query}`)
}

export async function getProductByHandle(handle: string) {
  return medusa.get(`/store/products?handle=${handle}`)
}
```

### 5.2 Get Subscription Options for Product

**Endpoint**: `GET /store/products/:id/subscription-options`

```typescript
interface SubscriptionOption {
  id: string
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'bimonthly' | 'quarterly' | 'yearly'
  discount_percent: number
  interval_count: number
}

export async function getSubscriptionOptions(productId: string): Promise<SubscriptionOption[]> {
  const response = await medusa.get(`/store/products/${productId}/subscription-options`)
  return response.options || []
}
```

### 5.3 Replace Hardcoded Products

Current hardcoded products in `/src/app/products/[handle]/page.tsx`:

```typescript
// REPLACE THIS:
const products = [
  { id: 1, handle: "triple-play-bubble-gum-30ml", name: "Triple Play - Bubble Gum 30ml", price: "$70.00" },
  // ...
]

// WITH:
import { getProductByHandle } from '@/lib/products'

export default async function ProductPage({ params }: { params: { handle: string } }) {
  const { products } = await getProductByHandle(params.handle)
  const product = products?.[0]

  if (!product) {
    notFound()
  }

  // Get subscription options
  const subscriptionOptions = await getSubscriptionOptions(product.id)

  return <ProductDetail product={product} subscriptionOptions={subscriptionOptions} />
}
```

---

## 6. Cart & Checkout Integration

### 6.1 Cart Management

Replace the current `window.addToCart()` system with Medusa cart:

```typescript
// src/lib/cart.ts
const CART_ID_KEY = 'medusa_cart_id'

export async function getOrCreateCart(): Promise<string> {
  let cartId = localStorage.getItem(CART_ID_KEY)

  if (!cartId) {
    const response = await medusa.post('/store/carts')
    cartId = response.cart.id
    localStorage.setItem(CART_ID_KEY, cartId)
  }

  return cartId
}

export async function getCart() {
  const cartId = await getOrCreateCart()
  return medusa.get(`/store/carts/${cartId}`)
}

export async function addToCart(variantId: string, quantity: number = 1) {
  const cartId = await getOrCreateCart()
  return medusa.post(`/store/carts/${cartId}/line-items`, {
    variant_id: variantId,
    quantity,
  })
}

export async function updateCartItem(lineItemId: string, quantity: number) {
  const cartId = await getOrCreateCart()
  return medusa.post(`/store/carts/${cartId}/line-items/${lineItemId}`, {
    quantity,
  })
}

export async function removeCartItem(lineItemId: string) {
  const cartId = await getOrCreateCart()
  return medusa.delete(`/store/carts/${cartId}/line-items/${lineItemId}`)
}
```

### 6.2 Checkout Flow

Replace stub functions in `/src/app/checkout/page.tsx`:

```typescript
// Step 1: Update customer email
export async function updateCheckoutEmail(email: string) {
  const cartId = await getOrCreateCart()
  return medusa.post(`/store/carts/${cartId}`, { email })
}

// Step 2: Update shipping address
export async function updateCheckoutShippingAddress(address: {
  first_name: string
  last_name: string
  address_1: string
  address_2?: string
  city: string
  province: string  // state code
  postal_code: string
  country_code: string  // 'us'
  phone: string
}) {
  const cartId = await getOrCreateCart()
  return medusa.post(`/store/carts/${cartId}`, {
    shipping_address: address,
  })
}

// Step 3: Get shipping options
export async function getShippingOptions() {
  const cartId = await getOrCreateCart()
  return medusa.get(`/store/shipping-options/${cartId}`)
}

// Step 4: Select shipping method
export async function selectShippingMethod(optionId: string) {
  const cartId = await getOrCreateCart()
  return medusa.post(`/store/carts/${cartId}/shipping-methods`, {
    option_id: optionId,
  })
}

// Step 5: Initialize payment session
export async function initializePaymentSession(providerId: string) {
  const cartId = await getOrCreateCart()
  return medusa.post(`/store/carts/${cartId}/payment-sessions`, {
    provider_id: providerId,  // 'stripe' or 'authorize-net'
  })
}

// Step 6: Complete checkout
export async function completeCheckout() {
  const cartId = await getOrCreateCart()
  const response = await medusa.post(`/store/carts/${cartId}/complete`)

  // Clear cart ID after successful order
  if (response.type === 'order') {
    localStorage.removeItem(CART_ID_KEY)
  }

  return response
}
```

---

## 7. Shipping Integration

### 7.1 Get Real-Time Shipping Rates

**Endpoint**: `POST /store/shipping/rates`

```typescript
interface ShippingRateRequest {
  ship_to: {
    name?: string
    street1: string
    street2?: string
    city: string
    state: string
    zip: string
    country?: string
  }
  items?: {
    product_id?: string
    variant_id?: string
    quantity: number
    weight_oz?: number
    price?: number
  }[]
  order_total?: number
  order_subtotal?: number
  customer_id?: string
}

export async function getShippingRates(request: ShippingRateRequest) {
  return medusa.post('/store/shipping/rates', request)
}
```

Response includes:
- `rates[]` - Available shipping options with prices
- `rules_applied` - Whether shipping rules modified prices
- `applied_actions` - Free shipping, discounts, etc.

### 7.2 Track Shipment

**Endpoint**: `GET /store/shipping/track/:tracking_number`

```typescript
export async function trackShipment(trackingNumber: string) {
  return medusa.get(`/store/shipping/track/${trackingNumber}`)
}
```

---

## 8. Payment Integration

### 8.1 Stripe Integration

```typescript
// src/lib/payments/stripe.ts
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export async function initializeStripePayment() {
  const cartId = await getOrCreateCart()

  // Create payment session
  const { cart } = await medusa.post(`/store/carts/${cartId}/payment-sessions`, {
    provider_id: 'stripe',
  })

  // Select Stripe as payment provider
  await medusa.post(`/store/carts/${cartId}/payment-session`, {
    provider_id: 'stripe',
  })

  return cart.payment_session.data.client_secret
}

// Use with Stripe Elements
export async function confirmStripePayment(clientSecret: string, paymentMethod: any) {
  const stripe = await stripePromise
  const result = await stripe!.confirmCardPayment(clientSecret, {
    payment_method: paymentMethod,
  })

  if (result.error) {
    throw new Error(result.error.message)
  }

  // Complete the order
  return completeCheckout()
}
```

### 8.2 Authorize.net Integration

```typescript
// For Authorize.net, use Accept.js for card tokenization
export async function initializeAuthorizeNet() {
  const cartId = await getOrCreateCart()

  const { cart } = await medusa.post(`/store/carts/${cartId}/payment-sessions`, {
    provider_id: 'authorize-net',
  })

  return cart.payment_session.data
}

// After Accept.js tokenization
export async function completeAuthorizeNetPayment(opaqueData: {
  dataDescriptor: string
  dataValue: string
}) {
  const cartId = await getOrCreateCart()

  await medusa.post(`/store/carts/${cartId}/payment-session`, {
    provider_id: 'authorize-net',
    data: {
      opaque_data: opaqueData,
    },
  })

  return completeCheckout()
}
```

### 8.3 Saved Payment Methods

```typescript
// List saved payment methods
export async function getPaymentMethods() {
  return medusa.get('/store/payment-methods/me')
}

// Get Stripe SetupIntent for adding new card
export async function getSetupIntent() {
  return medusa.post('/store/payment-methods/me/setup-intent')
}

// Add payment method after SetupIntent confirmation
export async function addPaymentMethod(paymentMethodId: string) {
  return medusa.post('/store/payment-methods/me', {
    payment_method_id: paymentMethodId,
  })
}

// Set default payment method
export async function setDefaultPaymentMethod(paymentMethodId: string) {
  return medusa.post(`/store/payment-methods/me/${paymentMethodId}/default`)
}

// Remove payment method
export async function removePaymentMethod(paymentMethodId: string) {
  return medusa.delete(`/store/payment-methods/me/${paymentMethodId}`)
}
```

---

## 9. Subscriptions (Subscribe & Save)

### 9.1 Add Subscription Product to Cart

```typescript
export async function addSubscriptionToCart(
  variantId: string,
  quantity: number,
  subscriptionOptionId: string
) {
  const cartId = await getOrCreateCart()

  return medusa.post(`/store/carts/${cartId}/line-items`, {
    variant_id: variantId,
    quantity,
    metadata: {
      subscription_option_id: subscriptionOptionId,
      is_subscription: true,
    },
  })
}
```

### 9.2 Manage Customer Subscriptions

```typescript
// List my subscriptions
export async function getMySubscriptions() {
  return medusa.get('/store/product-subscriptions/me')
}

// Get subscription details
export async function getSubscription(subscriptionId: string) {
  return medusa.get(`/store/product-subscriptions/me/${subscriptionId}`)
}

// Pause subscription
export async function pauseSubscription(subscriptionId: string) {
  return medusa.post(`/store/product-subscriptions/me/${subscriptionId}/pause`)
}

// Resume subscription
export async function resumeSubscription(subscriptionId: string) {
  return medusa.post(`/store/product-subscriptions/me/${subscriptionId}/resume`)
}

// Cancel subscription
export async function cancelSubscription(subscriptionId: string, reason?: string) {
  return medusa.post(`/store/product-subscriptions/me/${subscriptionId}/cancel`, {
    reason,
  })
}

// Skip next shipment
export async function skipNextShipment(subscriptionId: string) {
  return medusa.post(`/store/product-subscriptions/me/${subscriptionId}/skip`)
}

// Change frequency
export async function changeSubscriptionFrequency(
  subscriptionId: string,
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'bimonthly' | 'quarterly' | 'yearly'
) {
  return medusa.patch(`/store/product-subscriptions/me/${subscriptionId}/frequency`, {
    frequency,
  })
}

// Update payment method
export async function updateSubscriptionPaymentMethod(
  subscriptionId: string,
  paymentMethodId: string
) {
  return medusa.patch(`/store/product-subscriptions/me/${subscriptionId}/payment-method`, {
    payment_method_id: paymentMethodId,
  })
}
```

---

## 10. Customer Account Integration

### 10.1 Profile Management

```typescript
// Get current customer
export async function getCustomer() {
  return medusa.get('/store/customers/me')
}

// Update profile
export async function updateCustomer(data: {
  first_name?: string
  last_name?: string
  phone?: string
  metadata?: Record<string, any>
}) {
  return medusa.patch('/store/customers/me', data)
}

// Change password
export async function changePassword(oldPassword: string, newPassword: string) {
  return medusa.post('/store/customers/me/password', {
    old_password: oldPassword,
    new_password: newPassword,
  })
}

// Get account summary (orders, subscriptions, etc.)
export async function getAccountSummary() {
  return medusa.get('/store/account/me/summary')
}
```

### 10.2 Address Management

```typescript
// List addresses
export async function getAddresses() {
  return medusa.get('/store/addresses/me')
}

// Add address
export async function addAddress(address: {
  first_name: string
  last_name: string
  address_1: string
  address_2?: string
  city: string
  province: string
  postal_code: string
  country_code: string
  phone?: string
  is_default_shipping?: boolean
  is_default_billing?: boolean
}) {
  return medusa.post('/store/addresses/me', address)
}

// Update address
export async function updateAddress(addressId: string, data: Partial<typeof address>) {
  return medusa.patch(`/store/addresses/me/${addressId}`, data)
}

// Delete address
export async function deleteAddress(addressId: string) {
  return medusa.delete(`/store/addresses/me/${addressId}`)
}
```

### 10.3 Order History

```typescript
// List purchases
export async function getPurchases() {
  return medusa.get('/store/purchases/me')
}

// Get purchase details
export async function getPurchase(purchaseId: string) {
  return medusa.get(`/store/purchases/me/${purchaseId}`)
}
```

### 10.4 Returns

```typescript
// Create return request
export async function createReturn(data: {
  order_id: string
  items: { item_id: string; quantity: number; reason: string }[]
}) {
  return medusa.post('/store/returns', data)
}

// List my returns
export async function getReturns() {
  return medusa.get('/store/returns/me')
}
```

---

## 11. Blog/Content Integration

### 11.1 Fetch Content

**Endpoint**: `GET /store/content/:type`

```typescript
type ContentType = 'blog' | 'page' | 'faq' | 'banner'

interface ContentEntry {
  id: string
  slug: string
  title: string
  content: string
  excerpt?: string
  featured_image?: string
  seo_title?: string
  seo_description?: string
  status: 'draft' | 'published' | 'scheduled'
  published_at?: string
  metadata?: Record<string, any>
}

// List content by type
export async function getContent(type: ContentType, params?: {
  limit?: number
  offset?: number
  status?: string
}): Promise<ContentEntry[]> {
  const query = new URLSearchParams()
  if (params?.limit) query.set('limit', params.limit.toString())
  if (params?.offset) query.set('offset', params.offset.toString())
  if (params?.status) query.set('status', params.status)

  const response = await medusa.get(`/store/content/${type}?${query}`)
  return response.entries || []
}

// Get single content by slug
export async function getContentBySlug(type: ContentType, slug: string): Promise<ContentEntry | null> {
  const response = await medusa.get(`/store/content/${type}/${slug}`)
  return response.entry || null
}
```

### 11.2 Blog Pages

```typescript
// src/app/blog/page.tsx
export default async function BlogPage() {
  const posts = await getContent('blog', { status: 'published', limit: 10 })

  return (
    <div className="grid gap-8">
      {posts.map(post => (
        <BlogCard key={post.id} post={post} />
      ))}
    </div>
  )
}

// src/app/blog/[slug]/page.tsx
export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getContentBySlug('blog', params.slug)

  if (!post) {
    notFound()
  }

  return <BlogPost post={post} />
}
```

### 11.3 FAQ Integration

```typescript
// src/app/faq/page.tsx
export default async function FAQPage() {
  const faqs = await getContent('faq', { status: 'published' })

  return (
    <div className="space-y-4">
      {faqs.map(faq => (
        <FAQItem key={faq.id} question={faq.title} answer={faq.content} />
      ))}
    </div>
  )
}
```

### 11.4 Banner/Promo Content

```typescript
// Fetch active banners for homepage
export async function getActiveBanners() {
  const banners = await getContent('banner', { status: 'published' })
  return banners.filter(b => {
    const now = new Date()
    const start = b.metadata?.start_date ? new Date(b.metadata.start_date) : null
    const end = b.metadata?.end_date ? new Date(b.metadata.end_date) : null
    return (!start || now >= start) && (!end || now <= end)
  })
}
```

---

## 12. Customer Activity Tracking

### 12.1 Frontend Event Tracking

**Endpoint**: `POST /store/webhooks/track`

```typescript
// src/lib/analytics.ts

// Generate or retrieve fingerprint ID for anonymous tracking
function getFingerprint(): string {
  let fp = localStorage.getItem('_fp')
  if (!fp) {
    fp = crypto.randomUUID()
    localStorage.setItem('_fp', fp)
  }
  return fp
}

// Generate session ID
function getSessionId(): string {
  let sid = sessionStorage.getItem('_sid')
  if (!sid) {
    sid = crypto.randomUUID()
    sessionStorage.setItem('_sid', sid)
  }
  return sid
}

export async function trackEvent(
  eventType: string,
  properties?: Record<string, any>
) {
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
      },
    })
  } catch (error) {
    console.error('Failed to track event:', error)
  }
}

// Track page views
export function trackPageView(pageName: string, pageType: string) {
  trackEvent('page.viewed', { page_name: pageName, page_type: pageType })
}

// Track product views
export function trackProductView(product: { id: string; handle: string; title: string }) {
  trackEvent('product.viewed', {
    product_id: product.id,
    product_handle: product.handle,
    product_title: product.title,
  })
}

// Track add to cart
export function trackAddToCart(product: any, quantity: number) {
  trackEvent('cart.item_added', {
    product_id: product.id,
    variant_id: product.variant_id,
    quantity,
    price: product.price,
  })
}

// Track checkout progress
export function trackCheckoutStep(step: string, data?: Record<string, any>) {
  trackEvent(`checkout.${step}`, data)
}

// Identify customer (call after login)
export async function identifyCustomer(customerId: string, email: string) {
  await medusa.post('/store/webhooks/identify', {
    fingerprint_id: getFingerprint(),
    customer_id: customerId,
    email,
  })
}
```

### 12.2 Event Types to Track

| Event | When | Properties |
|-------|------|------------|
| `page.viewed` | Every page load | page_name, page_type |
| `product.viewed` | Product detail page | product_id, handle, title |
| `collection.browsed` | Collection page | collection_id, handle |
| `search.performed` | Search submitted | query, results_count |
| `cart.viewed` | Cart page opened | item_count, total |
| `cart.item_added` | Add to cart | product_id, variant_id, quantity |
| `cart.item_removed` | Remove from cart | line_item_id |
| `cart.updated` | Quantity changed | line_item_id, new_quantity |
| `checkout.started` | Begin checkout | cart_id, item_count |
| `checkout.email_entered` | Email step | email (hashed) |
| `checkout.shipping_entered` | Address step | city, state, zip |
| `checkout.shipping_selected` | Shipping method | method, price |
| `checkout.payment_started` | Payment step | provider |
| `checkout.completed` | Order placed | order_id, total |
| `customer.registered` | Account created | email (hashed) |
| `customer.logged_in` | Login success | method |

---

## 13. Webhook Endpoints

### 13.1 Backend Webhooks to Configure

Configure these in your payment/service providers:

| Provider | Webhook URL | Events |
|----------|-------------|--------|
| Stripe | `https://api.drinkyum.com/webhooks/stripe-subscription` | subscription.*, invoice.* |
| EasyPost | `https://api.drinkyum.com/webhooks/easypost` | tracker.*, batch.* |

### 13.2 Vercel Rewrites (for CDN)

Add to `next.config.ts`:

```typescript
const nextConfig = {
  async rewrites() {
    return [
      // CDN rewrites for tenant-scoped assets
      {
        source: '/cdn/:path*',
        destination: `${process.env.S3_FILE_URL}/drinkyum/:path*`,
      },
    ]
  },
}
```

---

## 14. File Uploads (CDN)

### 14.1 Using Presigned URLs

For user uploads (profile images, etc.):

```typescript
export async function uploadFile(file: File, category: string = 'files') {
  // Get presigned URL
  const { upload_url, file: fileInfo } = await medusa.post('/admin/files/presign', {
    filename: file.name,
    category,
    contentType: file.type,
  })

  // Upload directly to S3
  await fetch(upload_url, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type,
    },
  })

  // Return the CDN URL
  return fileInfo.url  // e.g., /cdn/files/abc123.jpg
}
```

---

## 15. Error Handling

### 15.1 Standard Error Response Format

```typescript
interface MedusaError {
  message: string
  code?: string
  type?: string
  details?: Record<string, any>
}

// Wrapper for API calls
export async function apiCall<T>(
  fn: () => Promise<T>
): Promise<{ data?: T; error?: MedusaError }> {
  try {
    const data = await fn()
    return { data }
  } catch (error: any) {
    return {
      error: {
        message: error.message || 'An error occurred',
        code: error.code,
        type: error.type,
      },
    }
  }
}
```

### 15.2 Common Error Codes

| Code | Meaning | Action |
|------|---------|--------|
| `UNAUTHORIZED` | Not logged in | Redirect to login |
| `FORBIDDEN` | No permission | Show access denied |
| `TENANT_NOT_FOUND` | Invalid tenant | Check X-Tenant-ID header |
| `TENANT_ACCESS_DENIED` | Wrong tenant | User assigned to different tenant |
| `NOT_FOUND` | Resource missing | Show 404 |
| `VALIDATION_ERROR` | Invalid input | Show field errors |
| `PAYMENT_FAILED` | Payment declined | Retry with different method |

---

## Implementation Checklist

### Phase 1: Foundation
- [ ] Create `/src/lib/medusa-client.ts`
- [ ] Set up environment variables
- [ ] Configure tenant header/cookie

### Phase 2: Products
- [ ] Replace hardcoded products with API calls
- [ ] Implement product listing pages
- [ ] Add subscription options to product pages

### Phase 3: Cart & Checkout
- [ ] Replace `window.addToCart()` with Medusa cart
- [ ] Implement checkout steps with real APIs
- [ ] Add shipping rate calculation
- [ ] Integrate Stripe Elements

### Phase 4: Authentication
- [ ] Create login/register pages
- [ ] Implement auth context provider
- [ ] Add protected routes

### Phase 5: Customer Account
- [ ] Build account dashboard
- [ ] Implement address management
- [ ] Add order history
- [ ] Build subscription management UI

### Phase 6: Content
- [ ] Connect blog to CMS
- [ ] Replace static FAQ with API
- [ ] Add dynamic banners

### Phase 7: Analytics
- [ ] Add event tracking throughout
- [ ] Implement customer identification
- [ ] Set up analytics dashboard

---

## Files to Create/Modify

| File | Purpose |
|------|---------|
| `src/lib/medusa-client.ts` | API client with tenant headers |
| `src/lib/auth.ts` | Authentication functions |
| `src/lib/cart.ts` | Cart management |
| `src/lib/checkout.ts` | Checkout flow |
| `src/lib/products.ts` | Product fetching |
| `src/lib/subscriptions.ts` | Subscription management |
| `src/lib/content.ts` | CMS content fetching |
| `src/lib/analytics.ts` | Event tracking |
| `src/contexts/AuthContext.tsx` | Auth state provider |
| `src/contexts/CartContext.tsx` | Cart state provider |
| `src/app/checkout/page.tsx` | Replace stubs with real calls |
| `src/app/account/*` | Customer account pages |
| `src/app/blog/*` | Blog pages connected to CMS |
| `.env.local` | Add Medusa environment variables |
| `next.config.ts` | Add CDN rewrites |

---

## Security Notes

1. **Move reCAPTCHA secret to backend** - Currently exposed in frontend code
2. **Use HttpOnly cookies for auth tokens** in production
3. **Validate all inputs** on both frontend and backend
4. **Rate limit** sensitive endpoints (login, register, password reset)
5. **CORS configuration** - Ensure backend allows frontend origin
