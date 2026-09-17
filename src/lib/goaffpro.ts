/**
 * GoAffPro conversion tracking (custom-store integration).
 *
 * The loader (api.goaffpro.com/loader.js, mounted in layout.tsx) handles
 * clicks/visits: it catches ?ref=CODE, sets the `ref` cookie (7d) and reports
 * the visit. But in a headless store NOTHING reports the sale — the GoAffPro
 * WP plugin's two attribution hooks (woocommerce_thankyou snippet, classic
 * checkout's $_COOKIE['ref'] reader) never fire for a Next.js thank-you page
 * + WC Store API checkout. So conversions must be pushed from our own
 * order-confirmation page via the loader's goaffproTrackConversion().
 *
 * The loader no-ops unless a `ref` (or affiliate discount) cookie is present,
 * and has its own in-page double-fire guard, so calling this for every order
 * is safe.
 */

interface GoaffproOrder {
	id: string;
	number: string;
	total: number;
	subtotal: number;
	currency: string;
	line_items: Array<{
		id: string;
		name: string;
		quantity: number;
		price: number;
	}>;
}

declare global {
	interface Window {
		__goaffpro?: unknown;
		goaffproTrackConversion?: (order: GoaffproOrder) => void;
	}
}

export function trackGoaffproConversion(order: GoaffproOrder): void {
	if (typeof window === "undefined") return;

	const fire = () => {
		try {
			if (typeof window.goaffproTrackConversion === "function") {
				window.goaffproTrackConversion(order);
			} else {
				// Loader also listens for this CustomEvent as an alternate entry.
				window.dispatchEvent(
					new CustomEvent("goaffproTrackConversion", { detail: order }),
				);
			}
		} catch (e) {
			console.error("[goaffpro] conversion push failed", e);
		}
	};

	if (window.__goaffpro) {
		// Loader already initialized.
		fire();
	} else {
		// Loader script not ready yet (it's afterInteractive) — it dispatches
		// goaffproScriptLoaded when done. If it never loads (ad-blocker), this
		// listener simply never fires.
		window.addEventListener("goaffproScriptLoaded", fire, { once: true });
	}
}
