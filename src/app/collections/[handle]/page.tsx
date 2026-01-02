"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Minus, Plus } from "lucide-react";
import { useState, useEffect, use } from "react";
import Navbar from "@/components/Navbar";
import MobileLogo from "@/components/MobileLogo";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import {
  getCollectionByHandle,
  getProductsByCollection,
  getProductPrice,
  type Product,
  type Collection,
} from "@/lib/products";

// Fallback collections for when API data isn't available yet
const fallbackCollections: Record<string, {
  title: string;
  description: string;
  accentColor: string;
}> = {
  "bestsellers": {
    title: "Bestsellers",
    description: "Our most loved kratom extracts, tried and trusted by thousands.",
    accentColor: "#E1258F",
  },
  "tropical-collection": {
    title: "Tropical Collection",
    description: "Escape to paradise with our refreshing tropical-flavored extracts.",
    accentColor: "#00B8E4",
  },
  "bundles": {
    title: "Value Bundles",
    description: "Maximum savings on our premium multi-packs and bundles.",
    accentColor: "#E2C530",
  },
  "new-arrivals": {
    title: "New Arrivals",
    description: "Fresh drops and limited editions you don't want to miss.",
    accentColor: "#E1258F",
  },
  "starter-packs": {
    title: "Starter Packs",
    description: "Perfect for first-timers. Discover your favorite YUM flavor.",
    accentColor: "#00B8E4",
  },
  "subscribe-save": {
    title: "Subscribe & Save",
    description: "Never run out. Get 20% off with monthly deliveries.",
    accentColor: "#E2C530",
  },
};

export default function CollectionPage({
  params
}: {
  params: Promise<{ handle: string }>
}) {
  const { handle } = use(params);
  const { addToCart, items, updateQuantity } = useCart();

  const [collection, setCollection] = useState<Collection | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get cart quantities for products
  const getCartQuantity = (variantId: string) => {
    const item = items.find(i => i.variant_id === variantId);
    return item?.quantity || 0;
  };

  // Load collection and products
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch collection by handle
        const col = await getCollectionByHandle(handle);

        if (col) {
          setCollection(col);
          // Fetch products in this collection
          const { products: prods } = await getProductsByCollection(col.id);
          setProducts(prods);
        } else {
          // Collection not found in API, use fallback if available
          const fallback = fallbackCollections[handle];
          if (fallback) {
            setCollection({
              id: handle,
              title: fallback.title,
              handle: handle,
            });
          }
          setError("Collection not found");
        }
      } catch (err) {
        console.error("Failed to load collection:", err);
        setError("Failed to load collection");
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [handle]);

  const handleAddToCart = async (product: Product) => {
    const variant = product.variants[0];
    if (!variant) return;

    try {
      await addToCart(variant.id, 1);
    } catch (err) {
      console.error("Failed to add to cart:", err);
    }
  };

  const handleUpdateQuantity = async (variantId: string, newQuantity: number) => {
    const item = items.find(i => i.variant_id === variantId);
    if (item) {
      try {
        await updateQuantity(item.id, newQuantity);
      } catch (err) {
        console.error("Failed to update quantity:", err);
      }
    }
  };

  // Get accent color from fallback or default
  const fallback = fallbackCollections[handle];
  const accentColor = fallback?.accentColor || "#E1258F";
  const longDescription = fallback?.description || collection?.metadata?.description as string || "";

  // Loading state
  if (isLoading) {
    return (
      <main className="min-h-screen bg-yum-dark relative">
        <MobileLogo />
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-2 border-yum-pink border-t-transparent rounded-full animate-spin" />
        </div>
        <Footer />
      </main>
    );
  }

  // 404 state
  if (error && !collection) {
    return (
      <main className="min-h-screen bg-yum-dark relative">
        <MobileLogo />
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <h1 className="text-4xl font-bold text-white mb-4">Collection Not Found</h1>
          <p className="text-white/60 mb-8">The collection you&apos;re looking for doesn&apos;t exist.</p>
          <Link
            href="/collections"
            className="px-6 py-3 rounded-xl text-white font-medium transition-all hover:scale-105"
            style={{ background: "#E1258F" }}
          >
            Browse All Collections
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-yum-dark relative">
      <MobileLogo />
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-28 lg:pt-40 pb-12 lg:pb-16 px-4">
        {/* Background gradient */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[300px] pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at center top, ${accentColor}20 0%, transparent 70%)`,
            filter: "blur(60px)",
          }}
        />

        <div className="relative max-w-[1200px] mx-auto">
          {/* Back link */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Link
              href="/collections"
              className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-8"
            >
              <ChevronLeft size={18} />
              <span className="text-sm">All Collections</span>
            </Link>
          </motion.div>

          {/* Collection Header */}
          <motion.div
            className="max-w-2xl mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Accent line */}
            <div
              className="w-16 h-1 rounded-full mb-6"
              style={{ background: accentColor }}
            />

            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold italic mb-4"
              style={{
                background: "linear-gradient(180deg, #FFFFFF 0%, #999999 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {collection?.title}
            </h1>

            <p className="text-white/60 text-lg leading-relaxed">
              {longDescription}
            </p>
          </motion.div>

          {/* Products count */}
          <motion.div
            className="flex items-center gap-3 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <span className="text-white/40 text-sm">
              {products.length} {products.length === 1 ? "product" : "products"}
            </span>
          </motion.div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 lg:gap-6">
            {products.map((product, index) => {
              const variant = product.variants[0];
              const cartQty = variant ? getCartQuantity(variant.id) : 0;
              const price = getProductPrice(product);
              const image = product.thumbnail || product.images[0]?.url || "/images/product-1.png";

              return (
                <motion.div
                  key={product.id}
                  className="relative rounded-2xl overflow-hidden group"
                  style={{
                    background: "linear-gradient(180deg, rgba(15, 15, 15, 0.00) 0%, #0F0F0F 100%)",
                    border: "1px solid #292929",
                  }}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                >
                  {/* Product Image */}
                  <Link href={`/products/${product.handle}`}>
                    <div className="relative aspect-square overflow-hidden">
                      <Image
                        src={image}
                        alt={product.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                  </Link>

                  {/* Product Info */}
                  <div className="p-4">
                    <Link href={`/products/${product.handle}`}>
                      <h3
                        className="text-sm font-medium leading-tight mb-1 line-clamp-2 hover:text-white/80 transition-colors"
                        style={{
                          background: "linear-gradient(180deg, #FFFFFF 0%, #999999 100%)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          backgroundClip: "text",
                        }}
                      >
                        {product.title}
                      </h3>
                    </Link>

                    <p className="text-white/40 text-xs mb-3 line-clamp-1">
                      {product.subtitle || product.description?.substring(0, 60)}
                    </p>

                    <div className="flex items-center justify-between">
                      <span
                        className="text-base font-bold"
                        style={{ color: accentColor }}
                      >
                        {price || "Price unavailable"}
                      </span>
                    </div>

                    {/* Add to Cart / Quantity Controls */}
                    <div className="mt-3">
                      {cartQty > 0 && variant ? (
                        <div
                          className="w-full flex items-center justify-between text-white rounded-lg"
                          style={{
                            height: "38px",
                            border: `1px solid ${accentColor}`,
                            background: `${accentColor}20`,
                          }}
                        >
                          <button
                            onClick={() => handleUpdateQuantity(variant.id, cartQty - 1)}
                            className="h-full px-4 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-all rounded-l-lg"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="text-sm font-semibold">
                            {cartQty}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(variant.id, cartQty + 1)}
                            className="h-full px-4 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-all rounded-r-lg"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={!variant}
                          className="w-full h-[38px] rounded-lg text-sm font-medium text-white transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{
                            background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}CC 100%)`,
                            boxShadow: `0 4px 15px ${accentColor}40`,
                          }}
                        >
                          Add to Cart
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Empty state */}
          {products.length === 0 && !isLoading && (
            <div className="text-center py-16">
              <p className="text-white/60 text-lg mb-4">No products found in this collection.</p>
              <Link
                href="/collections"
                className="text-yum-pink hover:underline"
              >
                Browse other collections
              </Link>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
