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
): Promise<{ setCookies: string[]; cartKey?: string }> {
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

	return { setCookies, cartKey };
}

export async function GET(request: NextRequest) {
	const token = request.nextUrl.searchParams.get("token");
	if (!token) return fail("missing_token");

	const payload = await verifyHandoffToken(token);
	if (!payload) return fail("invalid_token");

	// If a CoCart cart_key came across, prefer it: same WP backend, so the
	// same cart loads cleanly. Otherwise re-add the items from the payload.
	let setCookies: string[] = [];

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
	} else if (payload.items.length > 0) {
		const added = await addItemsToCart(payload.items);
		setCookies = added.setCookies;
	} else {
		return fail("empty_handoff");
	}

	if (setCookies.length === 0) {
		console.warn(
			"[handoff] no session cookies received from CoCart — cart may be empty on .com",
		);
	}

	// CoCart's Set-Cookie carries the session — the .com checkout reads from
	// it on the very next request. We don't need a cart_key URL param.
	const redirectUrl = new URL("/checkout", "https://www.drinkyum.com");
	const response = NextResponse.redirect(redirectUrl, 302);
	for (const sc of setCookies) {
		response.headers.append("Set-Cookie", sc);
	}
	return response;
}
