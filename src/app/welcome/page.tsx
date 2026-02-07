import type { Metadata } from "next";
import WelcomePageClient from "./WelcomePageClient";
import { getProducts } from "@/lib/wc-products";

export const metadata: Metadata = {
  title: "DrinkYUM | Premium Botanical Extract Shots",
  description:
    "Discover YUM — the smoothest botanical extract shot on the market. 75% purity, zero bitterness, lab-tested every batch. Two incredible flavors. Ships nationwide.",
  robots: { index: false, follow: false }, // Don't index this landing page
  openGraph: {
    title: "DrinkYUM | Premium Botanical Extract Shots",
    description:
      "The smoothest botanical extract shot on the market. 75% purity, zero bitterness, lab-tested every batch. Two incredible flavors.",
    siteName: "DrinkYUM",
    type: "website",
    url: "https://www.drinkyum.com/welcome",
  },
  twitter: {
    card: "summary_large_image",
    title: "DrinkYUM | Premium Botanical Extract Shots",
    description:
      "The smoothest botanical extract shot on the market. 75% purity, zero bitterness, lab-tested every batch.",
  },
};

export default async function WelcomePage() {
  // Fetch all products and sort by price (WC's orderby=price is unreliable)
  const { products: allProducts } = await getProducts({ limit: 50 });
  
  // Sort by price ascending (cheapest first) for better ad conversions
  const products = allProducts
    .sort((a, b) => {
      const priceA = a.variants?.[0]?.prices?.[0]?.amount || 0;
      const priceB = b.variants?.[0]?.prices?.[0]?.amount || 0;
      return priceA - priceB;
    })
    .slice(0, 10);
  
  return <WelcomePageClient initialProducts={products} />;
}
