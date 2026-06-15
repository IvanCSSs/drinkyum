"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { trackCloakViewInfo, trackCloakBeginCheckout } from "@/lib/gtag";

export default function NeedToKnowClient() {
	const searchParams = useSearchParams();
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [finalUrl, setFinalUrl] = useState<string | null>(null);

	// Read the claim params the cloak put in the URL.
	const variantId = searchParams?.get("v") ?? "";
	const coupon = searchParams?.get("c") ?? undefined;
	const flavor = searchParams?.get("f") ?? "";

	// Cloak funnel: reached the info/disclaimer interstitial. Fires once on
	// mount into the cloak's own GA4 property.
	useEffect(() => {
		trackCloakViewInfo(flavor || undefined);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Pre-sign the handoff token as soon as the page loads. By the time the
	// user finishes reading the disclaimers and clicks Continue, the URL is
	// ready and we just navigate — no extra round-trip after the click.
	useEffect(() => {
		if (!variantId) return;
		let cancelled = false;

		(async () => {
			try {
				const res = await fetch("/api/handoff/sign", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						items: [{ variantId, quantity: 1 }],
						coupon,
					}),
				});
				if (!res.ok) throw new Error(`sign failed: ${res.status}`);
				const { token, handoffUrl } = (await res.json()) as {
					token: string;
					handoffUrl: string;
				};
				if (!cancelled) {
					setFinalUrl(`${handoffUrl}?token=${encodeURIComponent(token)}`);
				}
			} catch (err) {
				console.error("[need-to-know] pre-sign failed", err);
				if (!cancelled) {
					setError("Something went wrong. Please try again.");
				}
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [variantId, coupon]);

	const handleContinue = () => {
		if (submitting) return;
		setSubmitting(true);
		setError(null);

		// Cloak funnel: leaving for the .com checkout. This is the last event
		// the cloak's GA4 property sees — the purchase lands in .com's property.
		trackCloakBeginCheckout(flavor || undefined);

		// Fire Meta Pixel InitiateCheckout if available
		const fbq = (window as unknown as { fbq?: (...args: unknown[]) => void })
			.fbq;
		if (typeof fbq === "function") {
			fbq("track", "InitiateCheckout", { currency: "USD" });
		}

		if (finalUrl) {
			window.location.href = finalUrl;
			return;
		}

		// Fallback: if pre-sign hasn't finished yet, sign synchronously now.
		(async () => {
			try {
				const res = await fetch("/api/handoff/sign", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						items: [{ variantId, quantity: 1 }],
						coupon,
					}),
				});
				if (!res.ok) throw new Error(`sign failed: ${res.status}`);
				const { token, handoffUrl } = (await res.json()) as {
					token: string;
					handoffUrl: string;
				};
				window.location.href = `${handoffUrl}?token=${encodeURIComponent(token)}`;
			} catch (err) {
				console.error("[need-to-know] continue failed", err);
				setError("Something went wrong. Please try again.");
				setSubmitting(false);
			}
		})();
	};

	const missingVariant = !variantId;

	return (
		<main className="min-h-screen bg-yum-dark text-white flex items-center justify-center px-6 py-12">
			<div className="w-full max-w-xl mx-auto">
				<div className="bg-white/5 backdrop-blur border border-white/10 rounded-3xl p-8 sm:p-10">
					<h1 className="text-3xl sm:text-4xl font-semibold text-center mb-3">
						Before you continue
					</h1>
					<p className="text-center text-white/70 mb-8">
						{flavor ? `You're claiming the ${flavor}. ` : ""}A few things you should know.
					</p>

					<ul className="space-y-4 text-white/85 mb-8">
						<li className="flex gap-3">
							<span className="text-yum-pink shrink-0" aria-hidden>
								&#10003;
							</span>
							<span>
								This product is intended for adults 21+. By continuing you
								confirm you are at least 21 years of age.
							</span>
						</li>
						<li className="flex gap-3">
							<span className="text-yum-pink shrink-0" aria-hidden>
								&#10003;
							</span>
							<span>
								Not evaluated by the FDA. Not intended to diagnose, treat,
								cure, or prevent any disease.
							</span>
						</li>
						<li className="flex gap-3">
							<span className="text-yum-pink shrink-0" aria-hidden>
								&#10003;
							</span>
							<span>
								Do not consume if pregnant, nursing, or taking medication.
								Consult a physician before use.
							</span>
						</li>
						<li className="flex gap-3">
							<span className="text-yum-pink shrink-0" aria-hidden>
								&#10003;
							</span>
							<span>
								Keep out of reach of children. Do not operate heavy machinery
								after consumption.
							</span>
						</li>
					</ul>

					{(error || missingVariant) && (
						<div className="mb-4 rounded-xl border border-red-400/30 bg-red-500/10 text-red-200 text-sm px-4 py-3">
							{missingVariant
								? "Missing product info — head back and pick a flavor."
								: error}
						</div>
					)}

					<button
						type="button"
						onClick={handleContinue}
						disabled={submitting || missingVariant}
						className="block w-full h-14 rounded-full font-semibold text-white text-base text-center transition-all hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100"
						style={{
							background: "linear-gradient(135deg, #E1258F 0%, #FF4DA6 100%)",
						}}
					>
						{submitting ? "Opening checkout…" : "Yes, I am 21+ — Continue"}
					</button>

					<Link
						href="/age-restriction"
						className="block text-center text-white/60 text-sm mt-4 hover:text-white"
					>
						No, I&apos;m under 21
					</Link>
				</div>
			</div>
		</main>
	);
}
