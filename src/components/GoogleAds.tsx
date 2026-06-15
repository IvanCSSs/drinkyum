'use client';

import Script from 'next/script';
import { useEffect } from 'react';

/**
 * Google Ads tag — loads gtag.js with AW- conversion ID.
 * 
 * Captures gclid/wbraid from URL params and stores in first-party cookies
 * for proper Google Ads conversion attribution on headless Next.js sites.
 */

// Env-driven so each deploy (.com moneypage vs .co cloak) reports into its
// OWN Google account. .com falls back to its hardcoded IDs if env is unset;
// .co sets NEXT_PUBLIC_GA_ID / NEXT_PUBLIC_GADS_ID to its separate account
// on the drinkyum-co Vercel project. The cloak must NOT load the .com IDs —
// it's a restricted-product landing and we keep its risk off the real store.
const IS_CLOAK = process.env.NEXT_PUBLIC_CLOAK === 'true';

const AW_CONVERSION_ID =
  process.env.NEXT_PUBLIC_GADS_ID || (IS_CLOAK ? '' : 'AW-17931720610');
const GA4_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_ID || (IS_CLOAK ? '' : 'G-Z8KSEBTTJR');

// Capture and store Google click IDs on landing
function captureGoogleClickIds() {
  if (typeof window === 'undefined') return;
  
  const params = new URLSearchParams(window.location.search);
  const gclid = params.get('gclid');
  const wbraid = params.get('wbraid');
  const gbraid = params.get('gbraid');
  
  const expires = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toUTCString();
  
  if (gclid) {
    document.cookie = `_gcl_aw=GCL.${Math.floor(Date.now() / 1000)}.${gclid}; expires=${expires}; path=/; SameSite=Lax`;
  }
  if (wbraid) {
    document.cookie = `_gcl_aw=GCL.${Math.floor(Date.now() / 1000)}.${wbraid}; expires=${expires}; path=/; SameSite=Lax`;
  }
  if (gbraid) {
    document.cookie = `_gcl_gb=${gbraid}; expires=${expires}; path=/; SameSite=Lax`;
  }
}

export default function GoogleAds() {
  // Capture click IDs on mount (handles client-side navigation)
  useEffect(() => {
    captureGoogleClickIds();
  }, []);

  // Need at least one tag ID to load gtag.js. On the cloak with no separate
  // account configured yet, render nothing rather than inject a broken
  // gtag/js?id= request.
  const loaderId = GA4_MEASUREMENT_ID || AW_CONVERSION_ID;
  if (!loaderId) return null;

  return (
    <>
      {/* Load gtag.js once; config each tag ID that's actually set. */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${loaderId}`}
        strategy="afterInteractive"
      />
      <Script id="google-ads-config" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          // Capture gclid/wbraid on initial load
          (function() {
            var params = new URLSearchParams(window.location.search);
            var gclid = params.get('gclid');
            var wbraid = params.get('wbraid');
            var gbraid = params.get('gbraid');
            var expires = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toUTCString();

            if (gclid) {
              document.cookie = '_gcl_aw=GCL.' + Math.floor(Date.now() / 1000) + '.' + gclid + '; expires=' + expires + '; path=/; SameSite=Lax';
            }
            if (wbraid) {
              document.cookie = '_gcl_aw=GCL.' + Math.floor(Date.now() / 1000) + '.' + wbraid + '; expires=' + expires + '; path=/; SameSite=Lax';
            }
            if (gbraid) {
              document.cookie = '_gcl_gb=' + gbraid + '; expires=' + expires + '; path=/; SameSite=Lax';
            }
          })();
          ${GA4_MEASUREMENT_ID ? `
          gtag('config', '${GA4_MEASUREMENT_ID}', {
            'cookie_flags': 'SameSite=Lax;Secure'
          });` : ''}
          ${AW_CONVERSION_ID ? `
          gtag('config', '${AW_CONVERSION_ID}', {
            'cookie_flags': 'SameSite=Lax;Secure'
          });` : ''}
        `}
      </Script>
    </>
  );
}
