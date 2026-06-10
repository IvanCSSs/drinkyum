import { getProducts } from "@/lib/wc-products";
import CloakHomeClient from "./CloakHomeClient";

// Revalidate the cloak product list hourly. Products almost never change,
// and re-fetching WP on every visitor render adds latency we don't need.
export const revalidate = 3600;

// Map WC product IDs → local /public/images/* assets. These bundle with the
// build, serve from Vercel's edge instantly, and entirely sidestep the
// /wp-media/* rewrite proxy (which has been slow / occasionally timing out).
// If a product ID isn't mapped we fall back to its WP image.
const LOCAL_IMAGE_OVERRIDES: Record<string, string> = {
	"54": "/images/product-1.png",
	"62": "/images/product-2.png",
};

export default async function CloakHome() {
	const { products } = await getProducts({ limit: 20 });

	const cloakProducts = products
		.filter((p) => ["54", "62"].includes(p.id))
		.map((p) => ({
			name: p.title,
			size: "30ml",
			price: p.variants[0]?.prices[0]?.amount ?? 0,
			variantId: p.id,
			image: LOCAL_IMAGE_OVERRIDES[p.id] || p.thumbnail || p.images[0]?.url || "",
			alt: p.title,
		}));

	return <CloakHomeClient products={cloakProducts} />;
}
