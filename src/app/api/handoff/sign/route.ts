/**
 * Sign a cart handoff token for the cloak (.co) → moneypage (.com) checkout
 * handoff. Called from /need-to-know after the user passes the age gate.
 *
 * Lives on .co (and is harmless on .com — the same image deploys to both).
 * Verifier sits at /api/cart/handoff on .com.
 */

import { type NextRequest, NextResponse } from "next/server";
import { signHandoffToken } from "@/lib/handoff-token";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface SignBody {
	cartKey?: string;
	items?: Array<{ variantId?: string; quantity?: number }>;
	coupon?: string;
}

export async function POST(request: NextRequest) {
	let body: SignBody;
	try {
		body = (await request.json()) as SignBody;
	} catch {
		return NextResponse.json({ error: "invalid_body" }, { status: 400 });
	}

	const items = (body.items ?? [])
		.map((i) => ({
			variantId: String(i.variantId ?? ""),
			quantity: Number(i.quantity ?? 0),
		}))
		.filter((i) => i.variantId.length > 0 && i.quantity > 0);

	if (items.length === 0 && !body.cartKey) {
		return NextResponse.json({ error: "empty_cart" }, { status: 400 });
	}

	const handoffUrl =
		process.env.NEXT_PUBLIC_HANDOFF_URL ||
		"https://www.drinkyum.com/api/cart/handoff";

	try {
		const couponCode = body.coupon?.trim();
		const token = await signHandoffToken({
			cartKey: body.cartKey,
			items,
			coupon: couponCode ? couponCode : undefined,
			ttlSeconds: 300,
		});
		return NextResponse.json({ token, handoffUrl });
	} catch (err) {
		console.error("[handoff/sign] failed", err);
		return NextResponse.json({ error: "sign_failed" }, { status: 500 });
	}
}
