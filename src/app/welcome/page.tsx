import type { Metadata } from "next";
import WelcomePageClient from "./WelcomePageClient";

export const metadata: Metadata = {
  title: "DrinkYUM | Premium Botanical Extract Shots",
  description:
    "Discover YUM — the smoothest botanical extract shot on the market. 75% purity, zero bitterness, lab-tested every batch. Two incredible flavors. Ships nationwide.",
  robots: { index: false, follow: false }, // Don't index this landing page
};

export default function WelcomePage() {
  return <WelcomePageClient />;
}
