'use client';

import Script from 'next/script';

/**
 * Google Ads tag — loads gtag.js with AW- conversion ID.
 * Routes through sGTM (t.drinkyum.com) for first-party tracking.
 * 
 * This is separate from the GA4 first-party tracker (/api/t).
 * Google Ads needs client-side gtag to:
 * - Capture gclid from URL params
 * - Set _gcl_aw cookies for conversion attribution
 * - Enable remarketing audiences
 */

const AW_CONVERSION_ID = 'AW-17931720610';
const GA4_MEASUREMENT_ID = 'G-Z8KSEBTTJR';

export default function GoogleAds() {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${AW_CONVERSION_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-ads-config" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${AW_CONVERSION_ID}');
          gtag('config', '${GA4_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  );
}
