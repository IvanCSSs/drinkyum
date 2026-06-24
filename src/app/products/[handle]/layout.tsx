import { Metadata } from "next";

interface ProductLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    handle: string;
  }>;
}

// Fetch product data for metadata (runs on server)
async function getProductMetadata(handle: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.drinkyum.com";
    const res = await fetch(`${baseUrl}/api/products/${encodeURIComponent(handle)}`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });
    
    if (!res.ok) return null;
    
    const data = await res.json();
    return data.product;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: ProductLayoutProps): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProductMetadata(handle);

  if (!product) {
    return {
      title: "Product Not Found | DrinkYUM",
      alternates: {
        canonical: `/products/${handle}`,
      },
    };
  }

  const price = product.variants?.[0]?.prices?.[0]?.amount || 0;
  const imageUrl = product.images?.[0]?.url || product.thumbnail;

  // Ensure "Kratom Extract" is in the SSR'd title + description — this is the
  // HTML Googlebot reads first, and it's the relevance signal that lets the
  // product surface on kratom Shopping searches (matches the open feed).
  const kratomTitle = /kratom/i.test(product.title)
    ? product.title
    : `${product.title} — Kratom Extract`;
  const kratomDesc = product.description
    ? `${product.description} Premium kratom extract, standardized mitragynine, lab-tested.`
    : `Shop ${product.title} — premium kratom extract with standardized mitragynine, lab-tested every batch.`;

  return {
    title: `${kratomTitle} | DrinkYUM`,
    description: kratomDesc,
    alternates: {
      canonical: `/products/${handle}`,
    },
    openGraph: {
      title: kratomTitle,
      description: kratomDesc,
      type: "website",
      images: imageUrl ? [{ url: imageUrl }] : undefined,
    },
    other: {
      "product:price:amount": String(price),
      "product:price:currency": "USD",
    },
  };
}

export default function ProductLayout({ children }: ProductLayoutProps) {
  return <>{children}</>;
}
