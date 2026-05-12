import { getProducts } from "@/lib/wc-products";
import CloakHomeClient from "./CloakHomeClient";

export default async function CloakHome() {
  const { products } = await getProducts({ limit: 20 });

  const cloakProducts = products
    .filter((p) => ["54", "62"].includes(p.id))
    .map((p) => ({
      name: p.title,
      size: "30ml",
      price: p.variants[0]?.prices[0]?.amount ?? 0,
      variantId: p.id,
      image: p.thumbnail || p.images[0]?.url || "",
      alt: p.title,
    }));

  return <CloakHomeClient products={cloakProducts} />;
}
