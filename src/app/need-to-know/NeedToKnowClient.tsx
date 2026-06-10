"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";

declare global {
	interface Window {
		fbq?: (...args: unknown[]) => void;
	}
}

export default function NeedToKnowClient() {
	const { cart } = useCart();
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleContinue = async () => {
		if (submitting) return;
		setSubmitting(true);
		setError(null);

		try {
			// Fire Meta Pixel InitiateCheckout if available
			if (typeof window !== "undefined" && typeof window.fbq === "function") {
				window.fbq("track", "InitiateCheckout", {
					value: cart?.total ?? 0,
					currency: "USD",
					num_items:
						cart?.items?.reduce((s, i) => s + (i.quantity ?? 0), 0) ?? 0,
				});
			}

			const items =
				cart?.items
					?.map((i) => ({
						variantId: String(i.variant_id ?? ""),
						quantity: i.quantity,
					}))
					.filter((i) => i.variantId.length > 0 && i.quantity > 0) ?? [];

			if (items.length === 0) {
				setError(
					"Your cart appears to be empty. Add a product before continuing.",
				);
				setSubmitting(false);
				return;
			}

			const tokenRes = await fetch("/api/handoff/sign", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ items }),
			});

			if (!tokenRes.ok) {
				throw new Error(`sign request failed: ${tokenRes.status}`);
			}

			const { token, handoffUrl } = (await tokenRes.json()) as {
				token: string;
				handoffUrl: string;
			};

			const finalUrl = `${handoffUrl}?token=${encodeURIComponent(token)}`;
			window.open(finalUrl, "_blank", "noopener,noreferrer");
		} catch (err) {
			console.error("[need-to-know] continue failed", err);
			setError("Something went wrong. Please try again.");
			setSubmitting(false);
		}
	};

	return (
		<main className="min-h-screen bg-yum-dark text-white flex items-center justify-center px-6 py-12">
			<div className="w-full max-w-xl mx-auto">
				<div className="bg-white/5 backdrop-blur border border-white/10 rounded-3xl p-8 sm:p-10">
					<h1 className="text-3xl sm:text-4xl font-semibold text-center mb-3">
						Before you continue
					</h1>
					<p className="text-center text-white/70 mb-8">
						A few things you should know.
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

					{error && (
						<div className="mb-4 rounded-xl border border-red-400/30 bg-red-500/10 text-red-200 text-sm px-4 py-3">
							{error}
						</div>
					)}

					<button
						type="button"
						onClick={handleContinue}
						disabled={submitting}
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
