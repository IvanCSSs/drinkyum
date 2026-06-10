import CloakHomeClient from "./CloakHomeClient";

// Revalidate the cloak hourly — there's no per-visitor data here, the
// page is a static landing for the free-sample offer.
export const revalidate = 3600;

// The two free-sample SKUs (same as the .com /free-sample page). Pinned
// here rather than fetched at render time because:
//   - The cloak only ever shows these two products
//   - Avoids a WP roundtrip on every cache miss
//   - Failure mode if a SKU changes upstream is "free sample fails to
//     claim" not "cloak fails to render", which is easier to debug.
const SAMPLE_OPTIONS = [
	{
		id: "bg" as const,
		variantId: "1674",
		productHandle: "yum-bubble-gum-14ml-free-sample",
		couponCode: "FREESAMPLEBG14",
		flavor: "Bubble Gum",
		image: "/images/sample-bg-14ml.jpg",
		tasteNote: "Smooth · Signature",
		accent: "#E1258F",
		description:
			"Smooth, slightly sweet, and easy to drink. The one most customers come back for.",
	},
	{
		id: "tb" as const,
		variantId: "1676",
		productHandle: "yum-tropical-breeze-14ml-free-sample",
		couponCode: "FREESAMPLETB14",
		flavor: "Tropical Breeze",
		image: "/images/sample-tb-14ml.jpg",
		tasteNote: "Citrus · Refreshing",
		accent: "#00B8E4",
		description:
			"Bright citrus meets mellow tropical fruit — clean, refreshing, a little less sweet.",
	},
];

export default function CloakHome() {
	return <CloakHomeClient sampleOptions={SAMPLE_OPTIONS} />;
}
