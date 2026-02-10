import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop All Collections | DrinkYUM",
  description: "Browse our premium kratom extract beverage collections. From bestsellers to tropical flavors, find the perfect kratom drink for you.",
  alternates: {
    canonical: "/collections",
  },
  openGraph: {
    title: "Shop DrinkYUM Collections",
    description: "Browse our premium kratom extract beverage collections.",
    type: "website",
  },
};

export default function CollectionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
