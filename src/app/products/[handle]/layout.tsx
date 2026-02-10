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

  return {
    title: `${product.title} | DrinkYUM`,
    description: product.description || `Shop ${product.title} at DrinkYUM. Premium kratom extract beverages.`,
    alternates: {
      canonical: `/products/${handle}`,
    },
    openGraph: {
      title: product.title,
      description: product.description,
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
