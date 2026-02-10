import { Metadata } from "next";

interface CollectionLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    handle: string;
  }>;
}

// Collection metadata mapping
const collectionMeta: Record<string, { title: string; description: string }> = {
  "bestsellers": {
    title: "Bestsellers",
    description: "Our most loved kratom extracts, tried and trusted by thousands of happy customers.",
  },
  "tropical-collection": {
    title: "Tropical Collection",
    description: "Escape to paradise with our refreshing tropical-flavored kratom extracts.",
  },
  "bundles": {
    title: "Value Bundles",
    description: "Maximum savings on our premium kratom multi-packs and bundles.",
  },
  "new-arrivals": {
    title: "New Arrivals",
    description: "Check out the latest additions to our premium kratom beverage lineup.",
  },
  "subscribe-save": {
    title: "Subscribe & Save",
    description: "Save up to 20% with our subscription options on premium kratom beverages.",
  },
};

export async function generateMetadata({ params }: CollectionLayoutProps): Promise<Metadata> {
  const { handle } = await params;
  
  const meta = collectionMeta[handle] || {
    title: handle.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
    description: `Shop our ${handle.replace(/-/g, " ")} collection of premium kratom extract beverages.`,
  };

  return {
    title: `${meta.title} | DrinkYUM`,
    description: meta.description,
    alternates: {
      canonical: `/collections/${handle}`,
    },
    openGraph: {
      title: `${meta.title} | DrinkYUM`,
      description: meta.description,
      type: "website",
    },
  };
}

export default function CollectionLayout({ children }: CollectionLayoutProps) {
  return <>{children}</>;
}
