'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { tracker } from '@/lib/tracker';

/**
 * Tracking provider — handles automatic page view tracking on route changes.
 * Wrap your app in this component (inside layout.tsx).
 * 
 * Usage:
 *   <TrackingProvider>
 *     {children}
 *   </TrackingProvider>
 */
export default function TrackingProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const prevPathname = useRef<string | null>(null);

  useEffect(() => {
    // Track page view on route change (skip duplicate fires for same path)
    if (pathname !== prevPathname.current) {
      // Small delay to ensure title is updated
      const timer = setTimeout(() => {
        tracker.pageView(pathname, document.title);
      }, 100);
      prevPathname.current = pathname;
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  return <>{children}</>;
}
