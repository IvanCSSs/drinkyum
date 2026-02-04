"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Star, Shield, Zap, FlaskConical, Minus, Plus } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { type Product, getProductPrice } from "@/lib/wc-products";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/**
 * Clean landing page for Google Ads — no restricted terminology.
 * Fully functional: products load from WC API, ATC works, cart works.
 * Positioned as "premium botanical extract shots."
 */

// Clean product descriptions (no restricted words)
const cleanDescriptions: Record<string, string> = {
  "54": "A single 30ml bottle of our signature Bubble Gum flavor. Start with one capful — clean focus, elevated mood, and sustained energy for 3-4 hours. No crash.",
  "60": "Three bottles of our best-selling Bubble Gum flavor at the best per-unit price. Perfect for your daily routine.",
  "62": "Three bottles of refreshing Tropical Breeze at the best per-unit price. Smooth, sustained energy every day.",
  "64": "Can't decide? One Bubble Gum + one Tropical Breeze. Discover your favorite flavor.",
  "66": "Six bottles — our biggest bundle and best overall value. Mix of both flavors. Perfect for sharing or stocking up.",
  "749": "Pocket-sized power. Same 75% extract formula in a TSA-friendly 14ml shot. Take it anywhere.",
  "750": "Tropical Breeze in a pocket-sized 14ml format. Same potency, half the size. Perfect on the go.",
};

// Clean subtitles
const cleanSubtitles: Record<string, string> = {
  "54": "Premium botanical extract — Bubble Gum flavor",
  "60": "Best-selling 3-pack — Bubble Gum flavor",
  "62": "Best-selling 3-pack — Tropical Breeze flavor",
  "64": "Try both flavors — 1 Bubble Gum + 1 Tropical Breeze",
  "66": "Best value 6-pack bundle — both flavors included",
  "749": "14ml pocket shot — Bubble Gum flavor",
  "750": "14ml pocket shot — Tropical Breeze flavor",
};

function sanitizeText(text: string): string {
  // Replace any restricted terminology that might come from WC
  return text
    .replace(/kratom/gi, "botanical")
    .replace(/mitragynine/gi, "extract")
    .replace(/mitragyna speciosa/gi, "botanical plant");
}

export default function WelcomePageClient() {
  const { addToCart, items, updateQuantity, openDrawer } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addingId, setAddingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch("/api/products?limit=10");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        if (data.products?.length > 0) {
          setProducts(data.products);
        }
      } catch {
        console.error("Failed to load products");
      } finally {
        setIsLoading(false);
      }
    }
    loadProducts();
  }, []);

  const getCartQuantity = (variantId: string) => {
    const item = items.find((i) => i.variant_id === variantId);
    return item?.quantity || 0;
  };

  const handleAddToCart = async (product: Product) => {
    const variant = product.variants[0];
    if (!variant) return;
    setAddingId(product.id);
    try {
      await addToCart(variant.id, 1);
    } catch {
      console.error("Failed to add to cart");
    } finally {
      setAddingId(null);
    }
  };

  const handleUpdateQuantity = async (variantId: string, newQuantity: number) => {
    const item = items.find((i) => i.variant_id === variantId);
    if (item) {
      try {
        await updateQuantity(item.id, newQuantity);
      } catch {
        console.error("Failed to update quantity");
      }
    }
  };

  return (
    <main className="min-h-screen bg-[#070707] text-white">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-16 px-4 overflow-hidden">
        <div className="absolute inset-0">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-30"
            style={{
              background: "radial-gradient(ellipse, rgba(225, 37, 143, 0.4) 0%, transparent 70%)",
              filter: "blur(80px)",
            }}
          />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold italic mb-6 leading-tight">
            <span
              style={{
                background: "linear-gradient(135deg, #FFFFFF 0%, #E1258F 50%, #00B8E4 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Premium Botanical
            </span>
            <br />
            <span className="text-white">Extract Shots</span>
          </h1>
          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-8">
            75% extract purity. Zero bitterness. Lab-tested every batch.
            Two incredible flavors that deliver clean, sustained energy for 3-4 hours.
          </p>
          <a
            href="#products"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white transition-all hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #E1258F 0%, #C41E7A 100%)",
            }}
          >
            <ShoppingBag size={20} />
            Shop Now
          </a>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 px-4 border-y border-white/10">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { icon: FlaskConical, label: "75% Purity", sub: "Pharmaceutical-grade" },
            { icon: Shield, label: "Lab-Tested", sub: "Every single batch" },
            { icon: Zap, label: "3-4 Hour Energy", sub: "Clean, no crash" },
            { icon: Star, label: "15,000+ Fans", sub: "And counting" },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex flex-col items-center text-center gap-2">
              <Icon size={28} className="text-[#E1258F]" />
              <span className="font-bold text-white">{label}</span>
              <span className="text-sm text-white/50">{sub}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Products Grid */}
      <section id="products" className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold italic text-center mb-4">
            <span
              style={{
                background: "linear-gradient(135deg, #FFFFFF 0%, #999999 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Our Products
            </span>
          </h2>
          <p className="text-white/50 text-center mb-12 max-w-xl mx-auto">
            Two incredible flavors. Multiple sizes. All backed by real lab data.
          </p>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-2xl bg-white/5 h-[400px] animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => {
                const price = getProductPrice(product);
                const variant = product.variants[0];
                const cartQty = variant ? getCartQuantity(variant.id) : 0;
                const subtitle = cleanSubtitles[product.id] || sanitizeText(product.subtitle || "");
                const description = cleanDescriptions[product.id] || sanitizeText(product.description || "");
                const thumbnail = product.thumbnail || product.images[0]?.url;

                return (
                  <div
                    key={product.id}
                    className="group rounded-2xl overflow-hidden transition-all hover:scale-[1.02]"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    {/* Product Image */}
                    <div className="relative aspect-square bg-black/20 overflow-hidden">
                      {thumbnail ? (
                        <Image
                          src={thumbnail}
                          alt={sanitizeText(product.title)}
                          fill
                          className="object-contain p-6 group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/20">
                          No image
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-white mb-1">
                        {sanitizeText(product.title)}
                      </h3>
                      <p className="text-sm text-[#E1258F] mb-2">{subtitle}</p>
                      <p className="text-sm text-white/40 mb-4 line-clamp-2">{description}</p>

                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-white">
                          {price || "—"}
                        </span>

                        {cartQty > 0 ? (
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() =>
                                handleUpdateQuantity(variant.id, cartQty - 1)
                              }
                              className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="text-white font-semibold w-6 text-center">
                              {cartQty}
                            </span>
                            <button
                              onClick={() =>
                                handleUpdateQuantity(variant.id, cartQty + 1)
                              }
                              className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleAddToCart(product)}
                            disabled={addingId === product.id}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105 disabled:opacity-50"
                            style={{
                              background:
                                "linear-gradient(135deg, #E1258F 0%, #C41E7A 100%)",
                            }}
                          >
                            <ShoppingBag size={16} />
                            {addingId === product.id ? "Adding..." : "Add to Cart"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Why YUM Section */}
      <section className="py-16 px-4 border-t border-white/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold italic mb-12">
            <span
              style={{
                background: "linear-gradient(135deg, #FFFFFF 0%, #999999 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Why YUM?
            </span>
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Unmatched Purity",
                desc: "75% extract purity — pharmaceutical-grade precision in every bottle. We don't cut corners.",
              },
              {
                title: "Zero Bitterness",
                desc: "Other botanical shots taste terrible. YUM comes in Bubble Gum and Tropical Breeze — flavors you'll actually crave.",
              },
              {
                title: "Lab Verified",
                desc: "Every batch is independently tested. We publish the results because we have nothing to hide.",
              },
            ].map(({ title, desc }) => (
              <div
                key={title}
                className="p-6 rounded-2xl text-left"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <h3 className="text-lg font-bold text-white mb-3">{title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-white/40 text-sm mb-6">
            Must be 21+ to purchase. Ships to all legal US states.
          </p>
          <a
            href="#products"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white transition-all hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #E1258F 0%, #C41E7A 100%)",
            }}
          >
            <ShoppingBag size={20} />
            Shop Now
          </a>
        </div>
      </section>

      <Footer />
    </main>
  );
}
