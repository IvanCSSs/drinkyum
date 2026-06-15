/**
 * Google Analytics 4 (gtag.js) event tracking utilities
 * 
 * Wraps window.gtag() calls with type safety and SSR protection.
 * GA4 is loaded via the GoogleAnalytics component in layout.tsx.
 */

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-Z8KSEBTTJR';

type GtagEvent = Record<string, unknown>;

function gtag(...args: unknown[]): void {
  if (typeof window === 'undefined') return;
  if (typeof window.gtag === 'function') {
    window.gtag(...(args as [string, ...unknown[]]));
  }
}

// ── E-commerce Events (GA4 recommended) ──────────────────────────────

export interface GtagItem {
  item_id: string;
  item_name: string;
  price?: number;
  quantity?: number;
  item_category?: string;
  item_variant?: string;
  currency?: string;
}

/** Fired when a user views a product listing / collection page */
export function trackViewItemList(listId: string, listName: string, items: GtagItem[]): void {
  gtag('event', 'view_item_list', {
    item_list_id: listId,
    item_list_name: listName,
    items,
  });
}

/** Fired when a user views a product detail page */
export function trackViewItem(item: GtagItem, value?: number, currency = 'USD'): void {
  gtag('event', 'view_item', {
    currency,
    value: 2,
    items: [item],
  });
}

/** Fired when a user adds an item to cart */
export function trackGtagAddToCart(item: GtagItem, value?: number, currency = 'USD'): void {
  gtag('event', 'add_to_cart', {
    currency,
    value: value ?? (item.price ?? 0) * (item.quantity ?? 1),
    items: [item],
  });
}

/** Fired when a user removes an item from cart */
export function trackGtagRemoveFromCart(item: GtagItem, value?: number, currency = 'USD'): void {
  gtag('event', 'remove_from_cart', {
    currency,
    value: value ?? (item.price ?? 0) * (item.quantity ?? 1),
    items: [item],
  });
}

/** Fired when a user begins checkout */
export function trackBeginCheckout(items: GtagItem[], value: number, currency = 'USD', coupon?: string): void {
  gtag('event', 'begin_checkout', {
    currency,
    value,
    items,
    ...(coupon ? { coupon } : {}),
  });
}

/** Fired on order confirmation / thank-you page */
export function trackPurchase(
  transactionId: string,
  value: number,
  items: GtagItem[],
  opts?: { currency?: string; tax?: number; shipping?: number; coupon?: string }
): void {
  // GA4 purchase event
  gtag('event', 'purchase', {
    transaction_id: transactionId,
    value,
    currency: opts?.currency ?? 'USD',
    tax: opts?.tax ?? 0,
    shipping: opts?.shipping ?? 0,
    items,
    ...(opts?.coupon ? { coupon: opts.coupon } : {}),
  });

  // Google Ads conversion event
  gtag('event', 'conversion', {
    send_to: 'AW-17931720610/7h_sCMHB1vIbEKKvweZC',
    value,
    currency: opts?.currency ?? 'USD',
    transaction_id: transactionId,
  });
}

// ── Cloak free-sample lead (separate account, env-driven) ────────────

/**
 * Fired when a visitor claims the free sample on the .co cloak landing.
 * Reports a GA4 `generate_lead` event plus a Google Ads conversion into
 * whatever account the deploy is configured for. The Ads send_to is read
 * from env so the cloak reports into its OWN separate Ads account — set
 * NEXT_PUBLIC_GADS_CLOAK_CONVERSION="AW-XXXXX/label" on the drinkyum-co
 * Vercel project. No-ops cleanly until that env var exists.
 */
export function trackCloakSampleClaim(flavor: string, value = 0): void {
  gtag('event', 'generate_lead', {
    currency: 'USD',
    value,
    lead_type: 'free_sample',
    flavor,
  });

  const sendTo = process.env.NEXT_PUBLIC_GADS_CLOAK_CONVERSION;
  if (sendTo) {
    gtag('event', 'conversion', {
      send_to: sendTo,
      value,
      currency: 'USD',
    });
  }
}

/** Fired when the free-sample offer section scrolls into view (top of funnel). */
export function trackCloakViewOffer(flavor?: string): void {
  gtag('event', 'view_offer', { lead_type: 'free_sample', ...(flavor ? { flavor } : {}) });
}

/** Fired when the cloak's info/disclaimer interstitial (/need-to-know) loads. */
export function trackCloakViewInfo(flavor?: string): void {
  gtag('event', 'view_info_page', { ...(flavor ? { flavor } : {}) });
}

/**
 * Fired when the visitor clicks Continue on the info page and is handed off
 * to the .com checkout. This is the last event the cloak's GA4 property sees
 * for the session — the purchase itself lands in .com's separate property.
 */
export function trackCloakBeginCheckout(flavor?: string): void {
  gtag('event', 'begin_checkout', { currency: 'USD', ...(flavor ? { flavor } : {}) });
}

// ── Generic event helper ─────────────────────────────────────────────

export function trackGtagEvent(eventName: string, params?: GtagEvent): void {
  gtag('event', eventName, params);
}

// Augment Window for TypeScript
declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}
