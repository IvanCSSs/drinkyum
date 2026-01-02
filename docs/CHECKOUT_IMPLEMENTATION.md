# Checkout Implementation Guide

> Standard checkout implementation for e-commerce stores built with Next.js + Medusa (or similar headless commerce frameworks).

---

## Table of Contents

1. [Overview](#overview)
2. [Frontend Features](#frontend-features)
   - [Bot Protection](#bot-protection)
   - [Email Validation](#email-validation)
   - [Abandoned Cart Recovery (Field-Level Saves)](#abandoned-cart-recovery-field-level-saves)
   - [Google Maps Autocomplete](#google-maps-autocomplete)
   - [Marketing Opt-Ins](#marketing-opt-ins)
   - [Checkout Session Management](#checkout-session-management)
3. [Backend Integration (Medusa)](#backend-integration-medusa)
   - [Webhook Endpoints](#webhook-endpoints)
   - [Abandoned Cart Scheduled Job](#abandoned-cart-scheduled-job)
   - [Email Workflow](#email-workflow)
4. [External Webhooks (Inbound)](#external-webhooks-inbound)
5. [Environment Variables](#environment-variables)
6. [Checklist](#checklist)

---

## Overview

This document outlines the standard checkout implementation pattern used across all stores. The goal is to:

- **Maximize conversion** with smart UX (address autocomplete, email typo detection)
- **Minimize fraud** with layered bot protection
- **Recover lost sales** with field-level saves for abandoned cart emails
- **Capture marketing consent** at the optimal moment

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js)                       │
├─────────────────────────────────────────────────────────────────┤
│  • Bot Protection (honeypot, timing, patterns)                  │
│  • Email Validation (typos, disposable domains)                 │
│  • Google Maps Autocomplete                                     │
│  • reCAPTCHA v3 (loads only for suspicious users)               │
│  • Field-level blur handlers → Webhook calls                    │
│  • Local session persistence (localStorage backup)              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND (Medusa)                           │
├─────────────────────────────────────────────────────────────────┤
│  • Webhook endpoints (email, phone, address saved)              │
│  • Cart API (native Medusa)                                     │
│  • Abandoned cart scheduled job (15 min interval)               │
│  • Email workflow (recovery emails)                             │
│  • Customer metadata (marketing preferences)                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                            │
├─────────────────────────────────────────────────────────────────┤
│  • Payment: Authorize.net / Stripe                              │
│  • Email: SendGrid / Resend / Postmark                          │
│  • Marketing: Klaviyo / Mailchimp                               │
│  • SMS: Twilio / Postscript                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Frontend Features

### Bot Protection

All bot protection runs client-side first, with optional server-side verification for suspicious users.

#### 1. Honeypot Field

Hidden input that bots auto-fill but humans never see.

```tsx
// Hidden from humans via CSS
<div className="absolute -left-[9999px]" aria-hidden="true">
  <label htmlFor="website">Website</label>
  <input
    type="text"
    id="website"
    name="website"
    value={honeypot}
    onChange={(e) => setHoneypot(e.target.value)}
    tabIndex={-1}
    autoComplete="off"
  />
</div>
```

**Check on submit:**
```typescript
if (honeypot) {
  console.log("[Bot Detection] Honeypot filled - blocking");
  return; // Silently fail
}
```

#### 2. Form Timing Detection

Track when form loaded, reject submissions that are too fast.

```typescript
const [formStartTime] = useState(Date.now());

const isFormFilledTooFast = (): boolean => {
  const timeSpent = Date.now() - formStartTime;
  return timeSpent < 3000; // < 3 seconds = bot
};

const isSuspiciousUser = (): boolean => {
  const timeSpent = Date.now() - formStartTime;
  return timeSpent < 15000; // < 15 seconds = suspicious
};
```

#### 3. Suspicious Email Pattern Detection

Flags patterns commonly used by bots/fraud.

```typescript
const checkSuspiciousPattern = (email: string): boolean => {
  const localPart = email.split("@")[0];
  // Pattern: word_word followed by 2-4 digits (firstname_lastname123)
  const suspiciousPattern = /^[a-z]+[._][a-z]+\d{2,4}$/i;
  // Pattern: 4+ consecutive digits
  const tooManyNumbers = /\d{4,}/.test(localPart);
  return suspiciousPattern.test(localPart) || tooManyNumbers;
};
```

#### 4. reCAPTCHA v3 (Invisible)

Only triggered for suspicious users to minimize friction.

```typescript
// Load script
useEffect(() => {
  const script = document.createElement("script");
  script.src = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`;
  script.async = true;
  document.head.appendChild(script);
}, []);

// Execute only when needed
const executeRecaptcha = async (): Promise<string | null> => {
  return new Promise((resolve) => {
    grecaptcha.ready(async () => {
      const token = await grecaptcha.execute(SITE_KEY, { action: "checkout" });
      resolve(token);
    });
  });
};

// In submit handler
if (isSuspiciousUser()) {
  const token = await executeRecaptcha();
  // Send token to backend for verification
}
```

---

### Email Validation

#### 1. Typo Detection & Suggestions

Common email domain typos with "Did you mean...?" prompt.

```typescript
const EMAIL_TYPOS: Record<string, string> = {
  // Gmail
  "gmial.com": "gmail.com",
  "gmal.com": "gmail.com",
  "gmail.co": "gmail.com",
  "gmail.con": "gmail.com",
  "gamil.com": "gmail.com",
  // Hotmail
  "hotmal.com": "hotmail.com",
  "hotmail.co": "hotmail.com",
  // Yahoo
  "yaho.com": "yahoo.com",
  "yahoo.co": "yahoo.com",
  // Outlook
  "outlok.com": "outlook.com",
  "outlook.co": "outlook.com",
  // iCloud
  "iclod.com": "icloud.com",
  "icloud.co": "icloud.com",
  // Common TLD typos
  "gmail.cmo": "gmail.com",
  "gmail.ocm": "gmail.com",
};

// Check on change/blur
const domain = email.split("@")[1]?.toLowerCase();
if (EMAIL_TYPOS[domain]) {
  const corrected = email.replace(domain, EMAIL_TYPOS[domain]);
  setEmailSuggestion(corrected);
}
```

#### 2. Disposable Email Blocking

Block known throwaway email domains.

```typescript
const DISPOSABLE_DOMAINS = [
  "mailinator.com", "tempmail.com", "throwaway.email", 
  "guerrillamail.com", "10minutemail.com", "fakeinbox.com",
  "trashmail.com", "yopmail.com", "getnada.com", "maildrop.cc",
  "discard.email", "mailnesia.com", "temp-mail.org", 
  "emailondeck.com", "mohmal.com", "tempail.com",
  "sharklasers.com", "spam4.me", "grr.la", "burnermail.io"
];

if (DISPOSABLE_DOMAINS.includes(domain)) {
  setEmailWarning("Please use a permanent email address.");
}
```

---

### Abandoned Cart Recovery (Field-Level Saves)

Save customer data at every critical touchpoint to enable recovery emails.

#### Critical Save Points

| Field | When to Save | Priority |
|-------|--------------|----------|
| Email | On blur | 🔴 CRITICAL - enables recovery emails |
| Phone | On blur | 🟠 HIGH - enables SMS recovery |
| Address | On blur (when complete) | 🟡 MEDIUM - shows intent |
| Shipping Method | On selection | 🟢 LOW - preference tracking |

#### Implementation

```typescript
// Email - MOST CRITICAL
const handleEmailBlur = useCallback(async () => {
  if (!email || !cartId) return;
  await saveEmail(cartId, email, emailMarketing);
}, [email, cartId, emailMarketing]);

// Phone - Secondary contact
const handlePhoneBlur = useCallback(async () => {
  if (!phone || !cartId) return;
  await savePhone(cartId, phone, smsMarketing);
}, [phone, cartId, smsMarketing]);

// Address - Save when all required fields complete
const handleAddressFieldBlur = useCallback(async () => {
  if (!cartId || !firstName || !lastName || !address || !city || !state || !zipCode) return;
  await saveAddress(cartId, { firstName, lastName, address, apartment, city, state, zipCode });
}, [cartId, firstName, lastName, address, apartment, city, state, zipCode]);
```

#### Auto-Save with Debounce

For real-time typing, use debounced saves (2 second delay).

```typescript
const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

const triggerAutoSave = useCallback(() => {
  if (autoSaveTimerRef.current) {
    clearTimeout(autoSaveTimerRef.current);
  }
  autoSaveTimerRef.current = setTimeout(() => {
    saveCheckoutSession();
  }, 2000);
}, [saveCheckoutSession]);
```

---

### Google Maps Autocomplete

#### Setup

1. Get API key from Google Cloud Console
2. Enable "Places API" and "Maps JavaScript API"
3. Restrict key to your domains

#### Component Features

```typescript
// Key features:
// 1. US-only restriction
componentRestrictions: { country: "us" }

// 2. Minimal fields (cost optimization)
fields: ["address_components", "formatted_address"]

// 3. Session tokens (billing optimization)
const sessionToken = new google.maps.places.AutocompleteSessionToken();

// 4. Auto-fill city/state/zip on selection
autocomplete.addListener("place_changed", () => {
  const place = autocomplete.getPlace();
  const components = parseAddressComponents(place);
  setCity(components.city);
  setState(components.state);
  setZipCode(components.zipCode);
});

// 5. Keyboard shortcut fix (Google blocks Cmd+A, etc.)
const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.metaKey || e.ctrlKey) {
    e.stopPropagation(); // Prevent Google from intercepting
  }
};
```

#### Environment Variable

```bash
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=your_key_here
```

---

### Marketing Opt-Ins

#### Best Practices

1. **Email opt-in**: Pre-checked (higher conversion, still compliant)
2. **SMS opt-in**: Unchecked by default, auto-check when user types phone
3. **Clear value proposition**: Tell them what they'll get

```tsx
// Email - pre-checked
<label>
  <input type="checkbox" checked={emailMarketing} onChange={...} />
  Send me exclusive drops & early access deals
</label>

// SMS - auto-checks when typing phone
<input
  type="tel"
  onChange={(e) => {
    setPhone(e.target.value);
    if (e.target.value.length > 0 && !smsMarketing) {
      setSmsMarketing(true); // Auto-opt-in
    }
  }}
/>
<label>
  <input type="checkbox" checked={smsMarketing} onChange={...} />
  Text me VIP-only flash sales & restock alerts
</label>
```

---

### Checkout Session Management

#### Local Storage Backup

Always maintain a client-side backup for session recovery.

```typescript
const CHECKOUT_STORAGE_KEY = "yum-checkout-session";

interface CheckoutSession {
  id: string;
  createdAt: string;
  updatedAt: string;
  email?: string;
  phone?: string;
  shippingAddress?: {
    firstName: string;
    lastName: string;
    address: string;
    apartment?: string;
    city: string;
    state: string;
    zipCode: string;
  };
  shippingMethod?: "standard" | "express";
  step: number;
  cartItems: CartItem[];
}

// Save on every change
localStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(session));

// Recover on page load
const savedSession = localStorage.getItem(CHECKOUT_STORAGE_KEY);
if (savedSession) {
  const session = JSON.parse(savedSession);
  // Restore form fields...
}
```

---

## Backend Integration (Medusa)

### Webhook Endpoints

Create these endpoints in your Medusa backend to receive frontend saves.

#### File Structure

```
src/api/store/webhooks/
├── email-saved/
│   └── route.ts
├── phone-saved/
│   └── route.ts
├── address-saved/
│   └── route.ts
└── checkout-step/
    └── route.ts
```

#### `POST /store/webhooks/email-saved`

```typescript
import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

type Body = {
  cartId: string
  email: string
  marketingOptIn?: boolean
}

export async function POST(req: MedusaRequest<Body>, res: MedusaResponse) {
  const { cartId, email, marketingOptIn } = req.body
  const cartService = req.scope.resolve("cartService")
  const logger = req.scope.resolve("logger")

  try {
    await cartService.update(cartId, {
      email,
      metadata: {
        email_captured_at: new Date().toISOString(),
        marketing_email_opt_in: marketingOptIn ?? false,
      },
    })

    logger.info(`[Webhook] Email saved: ${cartId} → ${email}`)
    return res.json({ success: true })
  } catch (error) {
    logger.error(`[Webhook] Email save failed:`, error)
    return res.status(500).json({ success: false })
  }
}
```

#### `POST /store/webhooks/phone-saved`

```typescript
type Body = {
  cartId: string
  phone: string
  smsOptIn?: boolean
}

export async function POST(req: MedusaRequest<Body>, res: MedusaResponse) {
  const { cartId, phone, smsOptIn } = req.body
  const cartService = req.scope.resolve("cartService")

  const cart = await cartService.retrieve(cartId)
  
  await cartService.update(cartId, {
    metadata: {
      ...cart.metadata,
      phone,
      phone_captured_at: new Date().toISOString(),
      marketing_sms_opt_in: smsOptIn ?? false,
    },
  })

  return res.json({ success: true })
}
```

#### `POST /store/webhooks/address-saved`

```typescript
type Body = {
  cartId: string
  address: {
    firstName: string
    lastName: string
    address: string
    apartment?: string
    city: string
    state: string
    zipCode: string
  }
}

export async function POST(req: MedusaRequest<Body>, res: MedusaResponse) {
  const { cartId, address } = req.body
  const cartService = req.scope.resolve("cartService")

  await cartService.update(cartId, {
    shipping_address: {
      first_name: address.firstName,
      last_name: address.lastName,
      address_1: address.address,
      address_2: address.apartment || "",
      city: address.city,
      province: address.state,
      postal_code: address.zipCode,
      country_code: "us",
    },
  })

  return res.json({ success: true })
}
```

---

### Abandoned Cart Scheduled Job

Runs every 15 minutes, finds abandoned carts, sends recovery emails.

#### `src/jobs/abandoned-cart.ts`

```typescript
import { MedusaContainer } from "@medusajs/framework/types"

export default async function abandonedCartJob(container: MedusaContainer) {
  const cartService = container.resolve("cartService")
  const logger = container.resolve("logger")
  
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
  const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000)

  // Find carts:
  // - Has email
  // - Has items
  // - Not completed
  // - Updated 1-48 hours ago
  // - Recovery email not already sent
  const abandonedCarts = await cartService.list({
    email: { $ne: null },
    completed_at: null,
    updated_at: {
      $lt: oneHourAgo,
      $gt: fortyEightHoursAgo,
    },
  })

  const cartsToEmail = abandonedCarts.filter(cart => 
    cart.items?.length > 0 && 
    !cart.metadata?.abandoned_email_sent
  )

  logger.info(`[Abandoned Cart] Found ${cartsToEmail.length} carts to recover`)

  for (const cart of cartsToEmail) {
    // Trigger email workflow
    await container.resolve("workflowEngine").run("send-abandoned-cart-email", {
      input: {
        cartId: cart.id,
        email: cart.email,
        customerName: cart.shipping_address?.first_name || "there",
        items: cart.items,
        phone: cart.metadata?.phone,
      },
    })

    // Mark as sent
    await cartService.update(cart.id, {
      metadata: {
        ...cart.metadata,
        abandoned_email_sent: true,
        abandoned_email_sent_at: new Date().toISOString(),
      },
    })
  }
}

export const config = {
  name: "abandoned-cart-recovery",
  schedule: "*/15 * * * *", // Every 15 minutes
}
```

---

### Email Workflow

#### `src/workflows/send-abandoned-cart-email.ts`

```typescript
import { createWorkflow, createStep, StepResponse, WorkflowResponse } from "@medusajs/framework/workflows-sdk"

type Input = {
  cartId: string
  email: string
  customerName: string
  items: Array<{ title: string; quantity: number; unit_price: number; thumbnail?: string }>
  phone?: string
}

const sendEmailStep = createStep("send-email", async (input: Input, { container }) => {
  const emailService = container.resolve("emailService") // Your email provider
  
  const cartTotal = input.items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0)
  
  await emailService.send({
    to: input.email,
    template: "abandoned-cart",
    data: {
      name: input.customerName,
      items: input.items,
      total: (cartTotal / 100).toFixed(2),
      cartLink: `${process.env.STOREFRONT_URL}/checkout?cart=${input.cartId}`,
      discountCode: "COMEBACK10", // Optional incentive
    },
  })

  return new StepResponse({ sent: true })
})

export const sendAbandonedCartEmailWorkflow = createWorkflow(
  "send-abandoned-cart-email",
  (input: Input) => {
    const result = sendEmailStep(input)
    return new WorkflowResponse(result)
  }
)
```

---

## External Webhooks (Inbound)

Receive webhooks from external services (payment processors, email platforms, etc.)

### File Structure

```
src/api/webhooks/
├── authorize-net/
│   └── route.ts
├── stripe/
│   └── route.ts
├── klaviyo/
│   └── route.ts
└── twilio/
    └── route.ts
```

### Authorize.net

```typescript
import crypto from "crypto"

function verifySignature(payload: string, signature: string, secret: string): boolean {
  const hash = crypto.createHmac("sha512", secret).update(payload).digest("hex")
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature))
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const signature = req.headers["x-anet-signature"] as string
  
  if (!verifySignature(JSON.stringify(req.body), signature, process.env.ANET_WEBHOOK_SECRET!)) {
    return res.status(401).json({ error: "Invalid signature" })
  }

  const event = req.body

  switch (event.eventType) {
    case "net.authorize.payment.authcapture.created":
      // Payment successful - complete order
      break
    case "net.authorize.payment.fraud.declined":
      // Fraud detected - flag order
      break
    case "net.authorize.payment.refund.created":
      // Refund processed
      break
  }

  return res.json({ received: true })
}
```

### Stripe

```typescript
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const signature = req.headers["stripe-signature"] as string
  
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      JSON.stringify(req.body),
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch {
    return res.status(400).json({ error: "Invalid signature" })
  }

  switch (event.type) {
    case "payment_intent.succeeded":
      // Complete order
      break
    case "payment_intent.payment_failed":
      // Handle failure
      break
    case "charge.dispute.created":
      // Chargeback - flag customer
      break
  }

  return res.json({ received: true })
}
```

### Klaviyo

```typescript
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const event = req.body

  switch (event.type) {
    case "unsubscribed":
      // Update customer: marketing_email_opt_in = false
      break
    case "marked_as_spam":
      // Update customer: marketing_email_opt_in = false, flagged = true
      break
  }

  return res.json({ received: true })
}
```

---

## Environment Variables

### Frontend (.env.local)

```bash
# Medusa Backend
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://api.yourstore.com

# Google Maps
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=AIza...

# reCAPTCHA v3
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6Le...
```

### Backend (.env)

```bash
# Database
DATABASE_URL=postgresql://...

# CORS
STORE_CORS=https://yourstore.com
ADMIN_CORS=https://admin.yourstore.com

# reCAPTCHA
RECAPTCHA_SECRET_KEY=6Le...

# Storefront (for cart recovery links)
STOREFRONT_URL=https://yourstore.com

# Payment - Authorize.net
AUTHORIZE_NET_API_LOGIN_ID=...
AUTHORIZE_NET_TRANSACTION_KEY=...
AUTHORIZE_NET_WEBHOOK_SECRET=...

# Payment - Stripe (alternative)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
SENDGRID_API_KEY=SG...
# or
RESEND_API_KEY=re_...

# SMS
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...

# Marketing
KLAVIYO_API_KEY=pk_...
```

---

## Checklist

### Frontend Implementation

- [ ] Honeypot field (hidden input)
- [ ] Form timing detection (formStartTime)
- [ ] Email typo detection with suggestions
- [ ] Disposable email domain blocking
- [ ] Suspicious email pattern detection
- [ ] reCAPTCHA v3 integration (lazy load for suspicious users)
- [ ] Google Maps address autocomplete
- [ ] Session token for billing optimization
- [ ] Keyboard shortcut fix for Google Maps
- [ ] Email blur handler → webhook
- [ ] Phone blur handler → webhook
- [ ] Address blur handler → webhook
- [ ] Auto-save with debounce
- [ ] Local storage session backup
- [ ] Session recovery on page load
- [ ] Email marketing opt-in (pre-checked)
- [ ] SMS marketing opt-in (auto-check on phone input)
- [ ] Save info for next time checkbox

### Backend Implementation (Medusa)

- [ ] `POST /store/webhooks/email-saved` endpoint
- [ ] `POST /store/webhooks/phone-saved` endpoint
- [ ] `POST /store/webhooks/address-saved` endpoint
- [ ] Abandoned cart scheduled job (15 min)
- [ ] Abandoned cart email workflow
- [ ] Email service integration (SendGrid/Resend)
- [ ] SMS service integration (Twilio) - optional
- [ ] Marketing platform sync (Klaviyo) - optional

### External Webhooks

- [ ] Payment processor webhook endpoint
- [ ] Signature verification for all webhooks
- [ ] Klaviyo unsubscribe webhook
- [ ] Error logging and monitoring

### Testing

- [ ] Test honeypot blocks submission when filled
- [ ] Test timing detection blocks fast submissions
- [ ] Test email typo suggestions appear
- [ ] Test disposable emails show warning
- [ ] Test reCAPTCHA triggers for suspicious users
- [ ] Test address autocomplete fills city/state/zip
- [ ] Test all field blur handlers call webhooks
- [ ] Test abandoned cart job finds correct carts
- [ ] Test recovery email sends correctly
- [ ] Test webhook signature verification

---

## Revision History

| Date | Version | Changes |
|------|---------|---------|
| 2024-12-29 | 1.0 | Initial documentation |

