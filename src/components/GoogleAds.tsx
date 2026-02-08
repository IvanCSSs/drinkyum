'use client';

import Script from 'next/script';
import { useEffect } from 'react';

/**
 * Google Ads tag — loads gtag.js with AW- conversion ID.
 * 
 * Captures gclid/wbraid from URL params and stores in first-party cookies
 * for proper Google Ads conversion attribution on headless Next.js sites.
 */

const AW_CONVERSION_ID = 'AW-17931720610';
const GA4_MEASUREMENT_ID = 'G-Z8KSEBTTJR';

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

  return (
    <>
      {/* Load gtag.js with GA4 ID to enable Enhanced Measurement (scroll, clicks, etc.) */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`}
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
          
          gtag('config', '${GA4_MEASUREMENT_ID}', {
            'cookie_flags': 'SameSite=Lax;Secure'
          });
          gtag('config', '${AW_CONVERSION_ID}', {
            'cookie_flags': 'SameSite=Lax;Secure'
          });
        `}
      </Script>
    </>
  );
}
