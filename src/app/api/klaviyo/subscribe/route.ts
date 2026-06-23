import { NextRequest, NextResponse } from "next/server";

/**
 * Server-side Klaviyo subscribe.
 *
 * The client-side `_learnq`/`identify` calls only create profiles + log
 * activity — they do NOT set marketing consent, which is why buyers who
 * ticked the checkout consent box still showed "Never subscribed". This
 * route uses Klaviyo's real subscription API to set consent and add the
 * profile to the marketing list(s).
 *
 * Email -> "Email List" (QTE8zP), SMS -> "Text Messaging List" (RwFbcs).
 */

const KLAVIYO_PRIVATE_KEY = process.env.KLAVIYO_PRIVATE_KEY;
const EMAIL_LIST_ID = process.env.KLAVIYO_EMAIL_LIST_ID || "QTE8zP";
const SMS_LIST_ID = process.env.KLAVIYO_SMS_LIST_ID || "RwFbcs";
const KLAVIYO_REVISION = "2024-10-15";

interface SubscribeBody {
  email?: string;
  phone?: string; // E.164, e.g. +19258521209
  firstName?: string;
  lastName?: string;
  emailConsent?: boolean;
  smsConsent?: boolean;
}

// Build the subscription payload for one channel (email or sms) and POST it
// to Klaviyo's bulk subscribe job endpoint.
async function subscribeChannel(opts: {
  listId: string;
  channel: "email" | "sms";
  email?: string;
  phone?: string;
}): Promise<{ ok: boolean; status: number; body?: string }> {
  const { listId, channel, email, phone } = opts;

  const subscriptions: Record<string, unknown> = {};
  if (channel === "email") {
    subscriptions.email = { marketing: { consent: "SUBSCRIBED" } };
  } else {
    subscriptions.sms = { marketing: { consent: "SUBSCRIBED" } };
  }

  // NOTE: the subscription-bulk endpoint only accepts subscription-relevant
  // fields (email, phone_number, subscriptions). first_name/last_name are
  // rejected here (400) — names are already set via the client identify call
  // and the WooCommerce order, so we don't set them on this endpoint.
  const profileAttributes: Record<string, unknown> = { subscriptions };
  if (email) profileAttributes.email = email;
  if (phone) profileAttributes.phone_number = phone;

  const payload = {
    data: {
      type: "profile-subscription-bulk-create-job",
      attributes: {
        // consented_at omitted -> Klaviyo stamps "now"
        profiles: {
          data: [
            {
              type: "profile",
              attributes: profileAttributes,
            },
          ],
        },
      },
      relationships: {
        list: { data: { type: "list", id: listId } },
      },
    },
  };

  const res = await fetch(
    "https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs/",
    {
      method: "POST",
      headers: {
        Authorization: `Klaviyo-API-Key ${KLAVIYO_PRIVATE_KEY}`,
        revision: KLAVIYO_REVISION,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  // 202 Accepted = job queued successfully (no response body on success)
  const ok = res.status === 202;
  const body = ok ? undefined : await res.text().catch(() => "");
  return { ok, status: res.status, body };
}

export async function POST(req: NextRequest) {
  if (!KLAVIYO_PRIVATE_KEY) {
    console.error("[klaviyo/subscribe] KLAVIYO_PRIVATE_KEY not set");
    return NextResponse.json({ error: "not_configured" }, { status: 500 });
  }

  let body: SubscribeBody;
  try {
    body = (await req.json()) as SubscribeBody;
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const { email, phone, emailConsent, smsConsent } = body;
  const results: Record<string, unknown> = {};

  // Email subscription
  if (emailConsent && email) {
    try {
      const r = await subscribeChannel({
        listId: EMAIL_LIST_ID,
        channel: "email",
        email,
      });
      results.email = r.ok ? "subscribed" : `failed:${r.status}`;
      if (!r.ok) console.error("[klaviyo/subscribe] email failed", r.status, r.body);
    } catch (e) {
      results.email = "error";
      console.error("[klaviyo/subscribe] email error", e);
    }
  }

  // SMS subscription — only with a phone number AND explicit consent (TCPA).
  if (smsConsent && phone) {
    try {
      const r = await subscribeChannel({
        listId: SMS_LIST_ID,
        channel: "sms",
        phone,
        email,
      });
      results.sms = r.ok ? "subscribed" : `failed:${r.status}`;
      if (!r.ok) console.error("[klaviyo/subscribe] sms failed", r.status, r.body);
    } catch (e) {
      results.sms = "error";
      console.error("[klaviyo/subscribe] sms error", e);
    }
  }

  return NextResponse.json({ ok: true, results });
}
