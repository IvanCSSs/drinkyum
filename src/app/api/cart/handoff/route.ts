/**
 * Cart handoff endpoint.
 *
 * Called from the .co cloak with a signed token containing the raw line items
 * (+ optional coupon). We rebuild the cart on the .com side via CoCart and
 * 302 the user to /checkout, passing CoCart's cart_key forward as a
 * first-party cookie (yum_cart_key) so the .com cart proxy loads the exact
 * same guest cart.
 *
 * IMPORTANT (2026-09-16): CoCart identifies a guest cart by its cart_key, NOT
 * by cookies (its add-item only sets display flags). The previous version
 * forwarded those flag cookies and the cart arrived empty on .com. We now
 * capture cart_key from the CoCart response and hand it over via the cookie
 * the /api/cart proxy reads (getCartKey → yum_cart_key).
 *
 * The token is short-lived (5 min) and HMAC-signed with CART_HANDOFF_SECRET
 * shared between the .co and .com Vercel projects.
 */

import { type NextRequest, NextResponse } from "next/server";
import { buildWpApiUrl } from "@/lib/wp-api-url";
import { verifyHandoffToken } from "@/lib/handoff-token";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CART_KEY_COOKIE = "yum_cart_key";

function fail(message: string, status = 400): NextResponse {
	const redirect = new URL("/cart", "https://www.drinkyum.com");
	redirect.searchParams.set("handoff_error", message);
	return NextResponse.redirect(redirect, 302);
}

function coCartUrl(path: string, cartKey?: string): string {
	return buildWpApiUrl(`/cocart/v2${path}`, cartKey ? { cart_key: cartKey } : undefined);
}

function cartKeyFromBody(data: unknown): string | null {
	if (data && typeof data === "object" && "cart_key" in data) {
		const k = (data as { cart_key?: unknown }).cart_key;
		if (typeof k === "string" && k.length > 0) return k;
	}
	return null;
}

export async function GET(request: NextRequest) {
	const token = request.nextUrl.searchParams.get("token");
	if (!token) return fail("missing_token");

	const payload = await verifyHandoffToken(token);
	if (!payload) return fail("invalid_token");

	const items = (payload.items ?? []).filter(
		(i) => i.variantId && i.quantity > 0,
	);
	if (items.length === 0 && !payload.cartKey) return fail("empty_handoff");

	let cartKey: string | null = payload.cartKey ?? null;

	try {
		// Add each line item to a CoCart cart, threading cart_key so all items
		// land in the same cart. The first add-item mints the key if we don't
		// already have one from the token.
		for (const item of items) {
			const res = await fetch(coCartUrl("/cart/add-item", cartKey ?? undefined), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					id: String(item.variantId),
					quantity: String(item.quantity ?? 1),
				}),
			});
			const data = await res.json().catch(() => null);
			const freshKey = cartKeyFromBody(data);
			if (freshKey) cartKey = freshKey;
			if (!res.ok) {
				console.error(
					"[handoff] cocart add-item failed",
					res.status,
					await res.text().catch(() => ""),
				);
			}
		}

		// Apply coupon (non-fatal: cart still proceeds at full price on failure
		// rather than dropping the order).
		if (payload.coupon && cartKey) {
			const couponUrl = new URL(buildWpApiUrl("/store/v1/cart/coupon"));
			couponUrl.searchParams.set("cart_key", cartKey);
			const res = await fetch(couponUrl.toString(), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ code: payload.coupon }),
			});
			if (!res.ok) {
				console.error(
					"[handoff] coupon apply failed",
					res.status,
					await res.text().catch(() => ""),
				);
			}
		}
	} catch (err) {
		console.error("[handoff] cocart sequence threw", err);
		return fail("handoff_failed", 500);
	}

	if (!cartKey) {
		console.warn("[handoff] no cart_key captured — cart will be empty on .com");
		return fail("handoff_failed", 500);
	}

	// Redirect to checkout with the CoCart cart_key attached as the first-party
	// cookie the /api/cart proxy reads. utm_* stay neutral so they reveal
	// nothing in URL/referrer/analytics exports.
	const redirectUrl = new URL("/checkout", "https://www.drinkyum.com");
	redirectUrl.searchParams.set("utm_source", "yum-direct");
	redirectUrl.searchParams.set("utm_medium", "partner");
	// Affiliate referral carried from .co: the GoAffPro loader auto-links a
	// ?ref= URL param (autolink_ref_parameter) and sets its cookie on .com,
	// so the conversion push on /order-confirmation attributes correctly.
	if (payload.ref) {
		redirectUrl.searchParams.set("ref", payload.ref.slice(0, 64));
	}
	const response = NextResponse.redirect(redirectUrl, 302);
	response.cookies.set(CART_KEY_COOKIE, cartKey, {
		path: "/",
		maxAge: 60 * 60 * 24 * 7,
		sameSite: "lax",
		secure: true,
		httpOnly: false,
	});
	return response;
}
