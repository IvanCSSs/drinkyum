/**
 * Cart handoff token helpers.
 *
 * Used to securely pass a CoCart cart reference from drinkyum.co (the cloak)
 * to drinkyum.com so the user lands on the .com checkout with their cart
 * already populated. The token is an HMAC-SHA256-signed compact string —
 * payload is base64url JSON, signed with CART_HANDOFF_SECRET which must
 * match on both Vercel projects.
 *
 * Why not a JWT lib: this is a small surface (one issuer, one verifier,
 * one algorithm). A direct HMAC keeps the lib surface zero and works in
 * any runtime (edge, node).
 */

export interface HandoffPayload {
	cartKey?: string;
	items: Array<{ variantId: string; quantity: number }>;
	coupon?: string;
	exp: number; // unix seconds
	source: "co";
}

const enc = new TextEncoder();
const dec = new TextDecoder();

function b64urlEncode(bytes: Uint8Array): string {
	let bin = "";
	for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
	return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(s: string): Uint8Array {
	const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
	const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/") + pad);
	const out = new Uint8Array(bin.length);
	for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
	return out;
}

async function importKey(secret: string): Promise<CryptoKey> {
	return crypto.subtle.importKey(
		"raw",
		enc.encode(secret),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign", "verify"],
	);
}

function requireSecret(): string {
	const s = process.env.CART_HANDOFF_SECRET;
	if (!s || s.length < 32) {
		throw new Error("CART_HANDOFF_SECRET is missing or too short");
	}
	return s;
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
	if (a.length !== b.length) return false;
	let diff = 0;
	for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
	return diff === 0;
}

/**
 * Sign a handoff payload. Format: <payload-b64url>.<sig-b64url>
 */
export async function signHandoffToken(
	payload: Omit<HandoffPayload, "exp" | "source"> & { ttlSeconds?: number },
): Promise<string> {
	const key = await importKey(requireSecret());
	const full: HandoffPayload = {
		cartKey: payload.cartKey,
		items: payload.items,
		coupon: payload.coupon,
		exp: Math.floor(Date.now() / 1000) + (payload.ttlSeconds ?? 300),
		source: "co",
	};
	const body = b64urlEncode(enc.encode(JSON.stringify(full)));
	const sig = new Uint8Array(
		await crypto.subtle.sign("HMAC", key, enc.encode(body)),
	);
	return `${body}.${b64urlEncode(sig)}`;
}

/**
 * Verify and decode a handoff token. Returns null on any failure.
 */
export async function verifyHandoffToken(
	token: string,
): Promise<HandoffPayload | null> {
	try {
		const [body, sig] = token.split(".");
		if (!body || !sig) return null;

		const key = await importKey(requireSecret());
		const expected = new Uint8Array(
			await crypto.subtle.sign("HMAC", key, enc.encode(body)),
		);
		const provided = b64urlDecode(sig);
		if (!constantTimeEqual(expected, provided)) return null;

		const payload = JSON.parse(dec.decode(b64urlDecode(body))) as HandoffPayload;
		if (
			typeof payload.exp !== "number" ||
			payload.exp < Math.floor(Date.now() / 1000)
		) {
			return null;
		}
		if (!Array.isArray(payload.items)) return null;
		return payload;
	} catch {
		return null;
	}
}
