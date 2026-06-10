import { getProducts } from "@/lib/wc-products";
import CloakHomeClient from "./CloakHomeClient";

// Revalidate the cloak product list hourly. Products almost never change,
// and re-fetching WP on every visitor render adds latency we don't need.
export const revalidate = 3600;

// Pull the size suffix out of a product title for the card subtitle.
// e.g. "YUM Tropical Breeze 14ml Single" → "14ml"
function extractSize(title: string): string {
	const m = title.match(/(\d+\s*ml)/i);
	return m ? m[1].toLowerCase().replace(/\s+/g, "") : "";
}

export default async function CloakHome() {
	const { products } = await getProducts({ limit: 30 });

	const withPrice = products
		.map((p) => {
			const price = p.variants[0]?.prices[0]?.amount ?? 0;
			return { p, price };
		})
		.filter((x) => x.price > 0)
		.sort((a, b) => a.price - b.price);

	const cloakProducts = withPrice.slice(0, 3).map(({ p, price }) => ({
		name: p.title,
		size: extractSize(p.title) || "30ml",
		price,
		variantId: p.id,
		image: p.thumbnail || p.images[0]?.url || "",
		alt: p.title,
	}));

	return <CloakHomeClient products={cloakProducts} />;
}
