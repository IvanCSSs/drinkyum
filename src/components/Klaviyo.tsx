'use client';

import Script from 'next/script';
import { useEffect } from 'react';
import { trackSignupLead } from '@/lib/gtag';

/**
 * Klaviyo tracking script and identify helper.
 * Loads klaviyo.js and provides methods for tracking e-commerce events.
 */

const KLAVIYO_COMPANY_ID = 'XumC9D';

export default function Klaviyo() {
  // Fire the Google Ads "Sign-up" conversion when a visitor submits any
  // Klaviyo onsite form (popup / embed). Klaviyo dispatches a `klaviyoForms`
  // CustomEvent on window with detail.type === 'submit' on a successful
  // submission. This is the main opt-in source on /welcome (the popup), which
  // previously created Klaviyo profiles with zero Google Ads conversion.
  useEffect(() => {
    function onKlaviyoForm(e: Event) {
      const detail = (e as CustomEvent).detail as { type?: string } | undefined;
      if (detail?.type === 'submit') {
        trackSignupLead('klaviyo_popup');
      }
    }
    window.addEventListener('klaviyoForms', onKlaviyoForm as EventListener);
    return () => window.removeEventListener('klaviyoForms', onKlaviyoForm as EventListener);
  }, []);

  return (
    <Script
      id="klaviyo-script"
      src={`https://static.klaviyo.com/onsite/js/klaviyo.js?company_id=${KLAVIYO_COMPANY_ID}`}
      strategy="afterInteractive"
    />
  );
}

// Klaviyo tracking helpers
declare global {
  interface Window {
    klaviyo?: {
      push: (args: unknown[]) => void;
      identify: (properties: Record<string, unknown>) => void;
      track: (event: string, properties?: Record<string, unknown>) => void;
    };
    _learnq?: unknown[][];
  }
}

function getKlaviyo() {
  if (typeof window === 'undefined') return null;
  return window.klaviyo || null;
}

function pushToKlaviyo(args: unknown[]) {
  if (typeof window === 'undefined') return;
  window._learnq = window._learnq || [];
  window._learnq.push(args);
}

/**
 * Identify a user (call on login, signup, or when you have their email)
 */
export function klaviyoIdentify(email: string, properties?: Record<string, unknown>) {
  pushToKlaviyo(['identify', { $email: email, ...properties }]);
}

/**
 * Track a custom event
 */
export function klaviyoTrack(event: string, properties?: Record<string, unknown>) {
  pushToKlaviyo(['track', event, properties]);
}

/**
 * Track product view
 */
export function klaviyoViewedProduct(product: {
  ProductID: string;
  ProductName: string;
  ProductURL: string;
  ImageURL: string;
  Price: number;
  Categories?: string[];
}) {
  pushToKlaviyo(['track', 'Viewed Product', product]);
  pushToKlaviyo(['trackViewedItem', {
    Title: product.ProductName,
    ItemId: product.ProductID,
    Categories: product.Categories,
    ImageUrl: product.ImageURL,
    Url: product.ProductURL,
    Metadata: { Price: product.Price }
  }]);
}

/**
 * Track add to cart
 */
export function klaviyoAddedToCart(item: {
  ProductID: string;
  ProductName: string;
  ProductURL: string;
  ImageURL: string;
  Price: number;
  Quantity: number;
  CartTotal: number;
  Categories?: string[];
}) {
  pushToKlaviyo(['track', 'Added to Cart', {
    $value: item.CartTotal,
    AddedItemProductName: item.ProductName,
    AddedItemProductID: item.ProductID,
    AddedItemPrice: item.Price,
    AddedItemQuantity: item.Quantity,
    AddedItemImageURL: item.ImageURL,
    AddedItemURL: item.ProductURL,
    AddedItemCategories: item.Categories,
    CartTotal: item.CartTotal
  }]);
}

/**
 * Track checkout started
 */
export function klaviyoStartedCheckout(checkout: {
  $value: number;
  CheckoutURL?: string;
  Items: Array<{
    ProductID: string;
    ProductName: string;
    Quantity: number;
    Price: number;
    ImageURL?: string;
    ProductURL?: string;
  }>;
}) {
  pushToKlaviyo(['track', 'Started Checkout', checkout]);
}

/**
 * Track purchase (server-side is preferred, but client-side backup)
 */
export function klaviyoPlacedOrder(order: {
  $value: number;
  OrderId: string;
  Items: Array<{
    ProductID: string;
    ProductName: string;
    Quantity: number;
    Price: number;
    ImageURL?: string;
    ProductURL?: string;
  }>;
}) {
  pushToKlaviyo(['track', 'Placed Order', order]);
}
