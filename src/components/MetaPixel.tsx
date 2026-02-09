'use client';

import Script from 'next/script';
import { Suspense, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * Meta Pixel — loads fbevents.js for browser-side tracking.
 * 
 * Works alongside server-side CAPI (/api/t) for hybrid tracking:
 * - Browser pixel: captures _fbp cookie, real-time events
 * - Server CAPI: reliable conversion data, higher match quality
 * 
 * Deduplication: Both use the same event_id pattern.
 */

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || '906580201751057';

// Extend window type for fbq
declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
    _fbq: unknown;
  }
}

/**
 * Generate event ID for deduplication between browser and server events
 */
export function generateEventId(eventType: string): string {
  return `${eventType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Track a Meta Pixel event with proper deduplication
 * Call this from components, then also fire to /api/t with same eventId
 */
export function trackMetaEvent(
  eventName: string,
  params?: Record<string, unknown>,
  eventId?: string
) {
  if (typeof window === 'undefined' || !window.fbq) return;
  
  const eid = eventId || generateEventId(eventName.toLowerCase());
  window.fbq('track', eventName, params || {}, { eventID: eid });
  
  return eid; // Return so caller can pass to server
}

/**
 * Inner component that uses useSearchParams (needs Suspense boundary)
 */
function MetaPixelTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Track page views on route change
  useEffect(() => {
    if (typeof window !== 'undefined' && window.fbq) {
      const eventId = generateEventId('pageview');
      window.fbq('track', 'PageView', {}, { eventID: eventId });
    }
  }, [pathname, searchParams]);

  // Capture fbclid from URL and store as _fbc cookie
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const fbclid = searchParams?.get('fbclid');
    if (fbclid) {
      const fbc = `fb.1.${Date.now()}.${fbclid}`;
      const expires = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toUTCString();
      document.cookie = `_fbc=${fbc}; expires=${expires}; path=/; SameSite=Lax`;
    }
  }, [searchParams]);

  return null; // This component only runs effects
}

export default function MetaPixel() {
  return (
    <>
      {/* Meta Pixel Base Code */}
      <Script
        id="meta-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${META_PIXEL_ID}');
          `,
        }}
      />
      {/* noscript fallback */}
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
      {/* Tracker component wrapped in Suspense */}
      <Suspense fallback={null}>
        <MetaPixelTracker />
      </Suspense>
    </>
  );
}
