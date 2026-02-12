/**
 * Lightweight first-party tracker — ad-blocker resistant.
 * Sends events to /api/t (own domain) → forwarded to GA4 MP + Meta CAPI.
 * 
 * Client ID stored in localStorage (no cookies needed).
 * Session ID rotates every 30 min of inactivity.
 */

const STORAGE_KEY = '_t_cid';
const SESSION_KEY = '_t_sid';
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

// --- Identity ---

export function getClientId(): string {
  if (typeof window === 'undefined') return '';
  
  let cid = localStorage.getItem(STORAGE_KEY);
  if (!cid) {
    // Format matches GA4: {random}.{timestamp}
    cid = `${Math.floor(Math.random() * 2147483647)}.${Math.floor(Date.now() / 1000)}`;
    localStorage.setItem(STORAGE_KEY, cid);
  }
  return cid;
}

export function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  
  const now = Date.now();
  const stored = sessionStorage.getItem(SESSION_KEY);
  
  if (stored) {
    const { sid, ts } = JSON.parse(stored);
    if (now - ts < SESSION_TIMEOUT) {
      // Refresh timestamp
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ sid, ts: now }));
      return sid;
    }
  }
  
  // New session
  const sid = String(Math.floor(Date.now() / 1000));
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ sid, ts: now }));
  return sid;
}

export function getFbp(): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(/_fbp=([^;]+)/);
  return match ? match[1] : '';
}

export function getFbc(): string {
  if (typeof document === 'undefined') return '';
  // Check URL for fbclid first
  const url = new URL(window.location.href);
  const fbclid = url.searchParams.get('fbclid');
  if (fbclid) {
    const fbc = `fb.1.${Date.now()}.${fbclid}`;
    return fbc;
  }
  // Fall back to cookie
  const match = document.cookie.match(/_fbc=([^;]+)/);
  return match ? match[1] : '';
}

/**
 * Get Google Click ID (gclid) for Google Ads attribution.
 * Captures from URL on landing, stores in cookie for 90 days.
 */
export function getGclid(): string {
  if (typeof document === 'undefined') return '';
  
  // Check URL for gclid first (landing from Google Ads)
  const url = new URL(window.location.href);
  const gclid = url.searchParams.get('gclid');
  
  if (gclid) {
    // Store in cookie for 90 days (Google's attribution window)
    const expires = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `_gcl_aw=GCL.${Math.floor(Date.now() / 1000)}.${gclid}; expires=${expires}; path=/; SameSite=Lax`;
    return gclid;
  }
  
  // Fall back to stored cookie
  const match = document.cookie.match(/_gcl_aw=GCL\.\d+\.([^;]+)/);
  return match ? match[1] : '';
}

/**
 * Get Google Ads wbraid (iOS 14.5+ click tracking)
 */
export function getWbraid(): string {
  if (typeof document === 'undefined') return '';
  
  const url = new URL(window.location.href);
  const wbraid = url.searchParams.get('wbraid');
  
  if (wbraid) {
    const expires = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `_gcl_aw_wbraid=${wbraid}; expires=${expires}; path=/; SameSite=Lax`;
    return wbraid;
  }
  
  const match = document.cookie.match(/_gcl_aw_wbraid=([^;]+)/);
  return match ? match[1] : '';
}

// --- Event Sending ---

interface TrackEvent {
  /** Event name shorthand: pv=page_view, atc=add_to_cart, bc=begin_checkout, vi=view_item, vil=view_item_list, p=purchase */
  e: string;
  /** Page path */
  p?: string;
  /** Page title */
  t?: string;
  /** Page referrer */
  r?: string;
  /** Event ID (for Meta dedup) */
  eid?: string;
  /** Items (for e-commerce events) */
  items?: Array<{
    id: string;
    name: string;
    price?: number;
    quantity?: number;
    category?: string;
  }>;
  /** Value */
  v?: number;
  /** Currency */
  c?: string;
  /** Transaction ID */
  tid?: string;
  /** Coupon */
  cp?: string;
}

function send(event: TrackEvent) {
  if (typeof window === 'undefined') return;
  
  const payload = {
    ...event,
    cid: getClientId(),
    sid: getSessionId(),
    fbp: getFbp(),
    fbc: getFbc(),
    gclid: getGclid(),
    wbraid: getWbraid(),
    ts: Date.now(),
    url: window.location.href,
    ua: navigator.userAgent,
    sr: `${screen.width}x${screen.height}`,
    lang: navigator.language,
  };

  // Use sendBeacon for reliability (survives page unload)
  const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
  const sent = navigator.sendBeacon('/api/t', blob);
  
  // Fallback to fetch if sendBeacon fails
  if (!sent) {
    fetch('/api/t', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {}); // Silent fail
  }
}

// --- Public API ---

export const tracker = {
  /** Track page view */
  pageView(path?: string, title?: string) {
    send({
      e: 'pv',
      p: path || window.location.pathname,
      t: title || document.title,
      r: document.referrer,
    });
  },

  /** Track product/item view */
  viewItem(item: { id: string; name: string; price: number; currency?: string; category?: string }) {
    send({
      e: 'vi',
      items: [{ id: item.id, name: item.name, price: item.price, category: item.category }],
      v: 2,
      c: item.currency || 'USD',
    });
  },

  /** Track item list view */
  viewItemList(items: Array<{ id: string; name: string; price: number; category?: string }>, listName?: string) {
    send({
      e: 'vil',
      items: items.map(i => ({ id: i.id, name: i.name, price: i.price, category: i.category })),
    });
  },

  /** Track add to cart */
  addToCart(item: { id: string; name: string; price: number; quantity?: number; currency?: string }) {
    send({
      e: 'atc',
      items: [{ id: item.id, name: item.name, price: item.price, quantity: item.quantity || 1 }],
      v: item.price * (item.quantity || 1),
      c: item.currency || 'USD',
    });
  },

  /** Track begin checkout */
  beginCheckout(items: Array<{ id: string; name: string; price: number; quantity?: number }>, value: number, currency?: string, coupon?: string) {
    send({
      e: 'bc',
      items,
      v: value,
      c: currency || 'USD',
      cp: coupon,
    });
  },

  /** Track purchase (optional — server is primary for this) */
  purchase(transactionId: string, value: number, currency?: string, items?: Array<{ id: string; name: string; price: number; quantity?: number }>) {
    send({
      e: 'p',
      tid: transactionId,
      v: value,
      c: currency || 'USD',
      items,
      eid: crypto.randomUUID(),
    });
  },

  /** Get headers to pass identity to WP backend */
  getTrackingHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    const cid = getClientId();
    const sid = getSessionId();
    const fbp = getFbp();
    const fbc = getFbc();
    
    if (cid) headers['X-Client-ID'] = cid;
    if (sid) headers['X-Session-ID'] = sid;
    if (fbp) headers['X-FBP'] = fbp;
    if (fbc) headers['X-FBC'] = fbc;
    
    return headers;
  },
};

export default tracker;
