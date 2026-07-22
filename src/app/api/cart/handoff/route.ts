/**
 * Cart handoff endpoint.
 *
 * Called from the .co cloak with a signed token containing either a CoCart
 * cart_key or the raw line items. On verify, we load/recreate the cart on
 * the .com side (same WP backend, so cart_key transfers as-is) and 302
 * the user to /checkout.
 *
 * The token is short-lived (5 min default) and HMAC-signed with
 * CART_HANDOFF_SECRET shared between the .co and .com Vercel projects.
 */

import { type NextRequest, NextResponse } from "next/server";
import { buildWpApiUrl } from "@/lib/wp-api-url";
import { verifyHandoffToken } from "@/lib/handoff-token";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function fail(message: string, status = 400): NextResponse {
	const redirect = new URL("/cart", "https://www.drinkyum.com");
	redirect.searchParams.set("handoff_error", message);
	return NextResponse.redirect(redirect, 302);
}

/**
 * Rewrite a Set-Cookie header from the WP backend so the browser scopes it
 * to the current site (drinkyum.com) instead of the upstream domain.
 * Mirrors the cookie handling in src/app/api/cart/route.ts.
 */
function rewriteCookieDomain(cookie: string): string {
	return cookie
		.replace(/Domain=[^;]+;?\s*/gi, "")
		.replace(/Path=[^;]+/gi, "Path=/");
}

async function addItemsToCart(
	items: Array<{ variantId: string; quantity: number }>,
): Promise<{ setCookies: string[]; sessionCookie: string | null; cartKey?: string }> {
	const setCookies: string[] = [];
	let cartKey: string | undefined;
	let sessionCookie: string | null = null;

	for (const item of items) {
		const headers: Record<string, string> = {
			"Content-Type": "application/json",
		};
		if (sessionCookie) headers.Cookie = sessionCookie;

		const res = await fetch(buildWpApiUrl("/cocart/v2/cart/add-item"), {
			method: "POST",
			headers,
			body: JSON.stringify({
				id: item.variantId,
				quantity: String(item.quantity ?? 1),
			}),
		});

		// Capture session cookie(s) so subsequent items go to the same cart
		// AND so we can forward them rewritten to the browser later.
		const responseCookies =
			(res.headers as Headers & {
				getSetCookie?: () => string[];
			}).getSetCookie?.() ?? [];
		if (responseCookies.length > 0) {
			for (const c of responseCookies) {
				setCookies.push(rewriteCookieDomain(c));
			}
			// Build a Cookie header for the next iteration from name=value pairs.
			sessionCookie = responseCookies
				.map((c) => c.split(";")[0])
				.join("; ");
		}

		if (!res.ok) {
			console.error(
				"[handoff] cocart add-item failed",
				res.status,
				await res.text().catch(() => ""),
			);
			continue;
		}
		const data = await res.json().catch(() => null);
		if (data?.cart_key) cartKey = data.cart_key;
	}

	return { setCookies, sessionCookie, cartKey };
}

/**
 * Apply a coupon to the cart identified by the given session cookie.
 * Uses the same custom mu-plugin endpoint as the /api/cart proxy.
 */
async function applyCouponWithSession(
	code: string,
	sessionCookie: string | null,
): Promise<{ extraSetCookies: string[]; ok: boolean }> {
	const headers: Record<string, string> = {
		"Content-Type": "application/json",
	};
	if (sessionCookie) headers.Cookie = sessionCookie;

	const res = await fetch(buildWpApiUrl("/store/v1/cart/coupon"), {
		method: "POST",
		headers,
		body: JSON.stringify({ code }),
	});

	const extra =
		(res.headers as Headers & {
			getSetCookie?: () => string[];
		}).getSetCookie?.() ?? [];
	const extraSetCookies = extra.map(rewriteCookieDomain);

	if (!res.ok) {
		console.error(
			"[handoff] coupon apply failed",
			res.status,
			await res.text().catch(() => ""),
		);
		return { extraSetCookies, ok: false };
	}
	return { extraSetCookies, ok: true };
}

export async function GET(request: NextRequest) {
	const token = request.nextUrl.searchParams.get("token");
	if (!token) return fail("missing_token");

	const payload = await verifyHandoffToken(token);
	if (!payload) return fail("invalid_token");

	// If a CoCart cart_key came across, prefer it: same WP backend, so the
	// same cart loads cleanly. Otherwise re-add the items from the payload.
	let setCookies: string[] = [];
	let sessionCookie: string | null = null;

	if (payload.cartKey) {
		// CoCart v2 reads ?cart_key=... to restore the matching session.
		const url = new URL(buildWpApiUrl("/cocart/v2/cart"));
		url.searchParams.set("cart_key", payload.cartKey);
		const res = await fetch(url.toString(), { method: "GET" });
		const cookies =
			(res.headers as Headers & {
				getSetCookie?: () => string[];
			}).getSetCookie?.() ?? [];
		for (const c of cookies) {
			setCookies.push(rewriteCookieDomain(c));
		}
		sessionCookie = cookies.map((c) => c.split(";")[0]).join("; ") || null;
	} else if (payload.items.length > 0) {
		const added = await addItemsToCart(payload.items);
		setCookies = added.setCookies;
		sessionCookie = added.sessionCookie;
	} else {
		return fail("empty_handoff");
	}

	// Forward any coupon that was applied on the cloak side so the .com
	// checkout shows the discounted total instead of full price.
	if (payload.coupon) {
		const { extraSetCookies } = await applyCouponWithSession(
			payload.coupon,
			sessionCookie,
		);
		setCookies.push(...extraSetCookies);
	}

	if (setCookies.length === 0) {
		console.warn(
			"[handoff] no session cookies received from CoCart — cart may be empty on .com",
		);
	}

	// CoCart's Set-Cookie carries the session — the .com checkout reads from
	// it on the very next request. We don't need a cart_key URL param.
	const redirectUrl = new URL("/checkout", "https://www.drinkyum.com");
	// Tag cloak-origin buyers so they can be segmented in GA4. Users arriving
	// via this handoff came from the .co cloak; without this the cross-domain
	// jump reads as a self-referral / direct. Kept to our own GA4 only — no
	// ad-platform-visible signal that links .co to .com.
	redirectUrl.searchParams.set("utm_source", "cloak");
	redirectUrl.searchParams.set("utm_medium", "handoff");
	const response = NextResponse.redirect(redirectUrl, 302);
	for (const sc of setCookies) {
		response.headers.append("Set-Cookie", sc);
	}
	return response;
}
