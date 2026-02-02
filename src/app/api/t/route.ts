import { NextRequest, NextResponse } from 'next/server';

/**
 * First-party tracking endpoint — receives events from the frontend tracker
 * and forwards to GA4 Measurement Protocol + Meta CAPI.
 * 
 * Lives on the same domain as the app → invisible to ad blockers.
 */

const GA4_MEASUREMENT_ID = process.env.GA4_MEASUREMENT_ID || process.env.NEXT_PUBLIC_GA4_ID || '';
const GA4_API_SECRET = process.env.GA4_API_SECRET || '';
const META_PIXEL_ID = process.env.META_PIXEL_ID || '';
const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || '';

// Event name mapping (shorthand → GA4 standard names)
const EVENT_MAP: Record<string, string> = {
  pv: 'page_view',
  vi: 'view_item',
  vil: 'view_item_list',
  atc: 'add_to_cart',
  bc: 'begin_checkout',
  p: 'purchase',
  su: 'sign_up',
};

// Meta CAPI event name mapping
const META_EVENT_MAP: Record<string, string> = {
  pv: 'PageView',
  vi: 'ViewContent',
  atc: 'AddToCart',
  bc: 'InitiateCheckout',
  p: 'Purchase',
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      e: eventShort,
      cid: clientId,
      sid: sessionId,
      p: path,
      t: title,
      r: referrer,
      items,
      v: value,
      c: currency,
      tid: transactionId,
      cp: coupon,
      eid: eventId,
      fbp,
      fbc,
      url: pageUrl,
      ua: userAgent,
      sr: screenRes,
      lang,
    } = body;

    const eventName = EVENT_MAP[eventShort] || eventShort;
    const promises: Promise<void>[] = [];

    // --- GA4 Measurement Protocol ---
    if (GA4_MEASUREMENT_ID && GA4_API_SECRET) {
      const ga4Event: Record<string, any> = {
        name: eventName,
        params: {
          session_id: sessionId,
          engagement_time_msec: 100,
          page_location: pageUrl || '',
          page_title: title || '',
          page_referrer: referrer || '',
          language: lang || '',
          screen_resolution: screenRes || '',
        },
      };

      // Add e-commerce params
      if (items?.length) {
        ga4Event.params.items = items.map((item: any, i: number) => ({
          item_id: String(item.id),
          item_name: item.name,
          price: item.price,
          quantity: item.quantity || 1,
          item_category: item.category || '',
          index: i,
        }));
      }
      if (value !== undefined) ga4Event.params.value = value;
      if (currency) ga4Event.params.currency = currency;
      if (transactionId) ga4Event.params.transaction_id = transactionId;
      if (coupon) ga4Event.params.coupon = coupon;

      const ga4Payload: Record<string, any> = {
        client_id: clientId,
        events: [ga4Event],
      };

      // Pass client IP for geo attribution
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
        || request.headers.get('x-real-ip')
        || '';
      if (ip) ga4Payload.ip_override = ip;

      promises.push(
        fetch(
          `https://www.google-analytics.com/mp/collect?measurement_id=${GA4_MEASUREMENT_ID}&api_secret=${GA4_API_SECRET}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ga4Payload),
          }
        ).then(() => {}).catch(() => {})
      );
    }

    // --- Meta CAPI ---
    const metaEventName = META_EVENT_MAP[eventShort];
    if (META_PIXEL_ID && META_ACCESS_TOKEN && metaEventName) {
      const metaEvent: Record<string, any> = {
        event_name: metaEventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId || crypto.randomUUID(),
        action_source: 'website',
        event_source_url: pageUrl || '',
        user_data: {
          client_ip_address: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '',
          client_user_agent: userAgent || request.headers.get('user-agent') || '',
          ...(fbp ? { fbp } : {}),
          ...(fbc ? { fbc } : {}),
        },
      };

      // Add custom data for commerce events
      if (['AddToCart', 'InitiateCheckout', 'Purchase', 'ViewContent'].includes(metaEventName)) {
        metaEvent.custom_data = {};
        if (value !== undefined) metaEvent.custom_data.value = value;
        if (currency) metaEvent.custom_data.currency = currency;
        if (items?.length) {
          metaEvent.custom_data.content_ids = items.map((i: any) => String(i.id));
          metaEvent.custom_data.content_type = 'product';
          metaEvent.custom_data.contents = items.map((i: any) => ({
            id: String(i.id),
            quantity: i.quantity || 1,
            item_price: i.price,
          }));
          metaEvent.custom_data.num_items = items.reduce((sum: number, i: any) => sum + (i.quantity || 1), 0);
        }
        if (transactionId) metaEvent.custom_data.order_id = transactionId;
      }

      promises.push(
        fetch(
          `https://graph.facebook.com/v19.0/${META_PIXEL_ID}/events?access_token=${META_ACCESS_TOKEN}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: [metaEvent] }),
          }
        ).then(() => {}).catch(() => {})
      );
    }

    // Fire all in parallel, don't wait
    if (promises.length > 0) {
      Promise.all(promises).catch(() => {});
    }

    // Return immediately — don't block the client
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ ok: true }, { status: 200 }); // Always 200 — never reveal errors
  }
}
