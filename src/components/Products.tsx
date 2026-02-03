"use client";

import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { getProductPrice, type Product } from "@/lib/wc-products";
import { trackViewItemList, type GtagItem } from "@/lib/gtag";

// Fallback products when API is not available
// Matches real WooCommerce products for DrinkYUM
const fallbackProducts = [
  {
    id: "54",
    handle: "333-yum-bubble-gum-30ml-single",
    title: "333 – YUM Bubble Gum 30ml Single",
    subtitle: "Premium kratom extract with bubble gum flavor",
    description: "Start with one capful. Feel the difference in 20-30 minutes — clean focus, elevated mood, and sustained energy for 3-4 hours. No crash. No hangover feeling the next morning.",
    thumbnail: "/images/bg-single-30ml.png",
    variants: [{ id: "54", prices: [{ id: "price-54", amount: 24.99, currency_code: "usd" }] }],
    images: [{ id: "img-54", url: "/images/bg-single-30ml.png", alt: "YUM Bubble Gum 30ml Single" }],
  },
  {
    id: "60",
    handle: "triple-play-yum-bubble-gum-30ml-3-pack",
    title: "Triple Play – YUM Bubble Gum 30ml (3 pack)",
    subtitle: "Best-selling 3-pack of premium bubble gum flavored extract",
    description: "Our best value for Bubble Gum fans. Three bottles at the lowest per-unit price. Start with one capful per bottle. 3-4 hours of clean, focused energy with no crash.",
    thumbnail: "/images/bg-triple-30ml.png",
    variants: [{ id: "60", prices: [{ id: "price-60", amount: 70.00, currency_code: "usd" }] }],
    images: [{ id: "img-60", url: "/images/bg-triple-30ml.png", alt: "YUM Bubble Gum 30ml Triple Play" }],
  },
  {
    id: "62",
    handle: "triple-play-yum-tropical-breeze-30ml-3-pack",
    title: "Triple Play – YUM Tropical Breeze 30ml (3 pack)",
    subtitle: "Best-selling 3-pack of premium tropical-flavored extract",
    description: "Our best value for Tropical Breeze fans. Three bottles at the lowest per-unit price. Start with one capful per bottle. 3-4 hours of clean, focused energy with no crash.",
    thumbnail: "/images/tb-triple-30ml.png",
    variants: [{ id: "62", prices: [{ id: "price-62", amount: 70.00, currency_code: "usd" }] }],
    images: [{ id: "img-62", url: "/images/tb-triple-30ml.png", alt: "YUM Tropical Breeze 30ml Triple Play" }],
  },
  {
    id: "64",
    handle: "333-bubble-gum-tropical-breeze-sampler-pack",
    title: "333 – Bubble Gum & Tropical Breeze Sampler Pack",
    subtitle: "Try both flavors – 1 Bubble Gum + 1 Tropical Breeze (30ml each)",
    description: "Can't decide? Try both. One bottle of each flavor so you can discover which one fits your taste. Start with one capful. 3-4 hours of clean, focused energy.",
    thumbnail: "/images/sampler-pack-30ml.png",
    variants: [{ id: "64", prices: [{ id: "price-64", amount: 48.00, currency_code: "usd" }] }],
    images: [{ id: "img-64", url: "/images/sampler-pack-30ml.png", alt: "YUM Sampler Pack" }],
  },
  {
    id: "66",
    handle: "333-holiday-bundle-6-units",
    title: "333 – Holiday Bundle (6 Units)",
    subtitle: "Best value 6-pack bundle – mix of Bubble Gum & Tropical Breeze",
    description: "Six bottles of premium YUM extract — our biggest bundle and best overall value. Perfect for sharing, gifting, or stocking up. Mix of both flavors included.",
    thumbnail: "/images/holiday-bundle-30ml.png",
    variants: [{ id: "66", prices: [{ id: "price-66", amount: 140.00, currency_code: "usd" }] }],
    images: [{ id: "img-66", url: "/images/holiday-bundle-30ml.png", alt: "YUM Holiday Bundle" }],
  },
];

export default function Products() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { addToCart, items, updateQuantity } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load products via API route (credentials stay server-side)
  useEffect(() => {
    async function loadProducts() {
      try {
        setIsLoading(true);
        const res = await fetch('/api/products?limit=6');
        if (!res.ok) throw new Error('Failed to fetch');

        const data = await res.json();
        if (data.products && data.products.length > 0) {
          setProducts(data.products);
          // GA4 view_item_list
          const gtagItems: GtagItem[] = data.products.map((p: Product) => ({
            item_id: p.id,
            item_name: p.title,
            price: getProductPrice(p),
            currency: 'USD',
          }));
          trackViewItemList('homepage_products', 'Homepage Products', gtagItems);
        } else {
          setProducts(fallbackProducts as unknown as Product[]);
        }
      } catch (err) {
        console.error("Failed to load products:", err);
        setProducts(fallbackProducts as unknown as Product[]);
      } finally {
        setIsLoading(false);
      }
    }

    loadProducts();
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 280;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Get cart quantity for a product variant
  const getCartQuantity = (variantId: string) => {
    const item = items.find(i => i.variant_id === variantId);
    return item?.quantity || 0;
  };

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

  return (
    <section
      id="products"
      className="relative bg-[#070707] flex justify-center px-4 py-12"
    >
      <div className="w-full max-w-[1119px] relative">
        {/* Decorative cyan ellipse */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full md:w-[978px] h-[150px] md:h-[262px] pointer-events-none"
          style={{
            borderRadius: "978px",
            background: "rgba(0, 184, 228, 0.10)",
            filter: "blur(83px)",
          }}
        />

        {/* Content - stack on mobile, horizontal on desktop */}
        <div
          className="relative flex flex-col lg:flex-row gap-8 lg:gap-[92px] mt-8 lg:mt-[71px]"
        >
          {/* Left Section - Title + Nav */}
          <motion.div
            className="flex flex-col lg:flex-shrink-0 gap-6 lg:gap-[278px] lg:w-[228px]"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Title Section */}
            <div className="flex flex-col gap-3 lg:gap-4">
              <h2
                className="text-[28px] sm:text-[36px] lg:text-[42px] font-bold italic leading-[1.1]"
                style={{
                  background: "linear-gradient(135deg, #FFFFFF 0%, #999999 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Top Sellers
              </h2>

              <p
                className="text-[13px] leading-[1.4] max-w-[300px] lg:max-w-none"
                style={{
                  letterSpacing: "-0.13px",
                  background: "linear-gradient(180deg, #FFFFFF 0%, #999999 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Our most powerful packs at our best prices. Premium 75% extract, unbeatable flavors, proven results.
              </p>
            </div>

            {/* Navigation Arrows - hidden on mobile, shown on lg */}
            <div className="hidden lg:flex gap-3">
              <button
                onClick={() => scroll("left")}
                className="w-[37px] h-[37px] flex items-center justify-center transition-opacity hover:opacity-80"
                style={{
                  borderRadius: "10px",
                  border: "1px solid rgba(153, 153, 153, 0.25)",
                }}
              >
                <ChevronLeft size={17} className="text-white/60" />
              </button>

              <button
                onClick={() => scroll("right")}
                className="w-[37px] h-[37px] flex items-center justify-center transition-opacity hover:opacity-80"
                style={{
                  borderRadius: "10px",
                  border: "1px solid rgba(153, 153, 153, 0.25)",
                }}
              >
                <ChevronRight size={17} className="text-white/60" />
              </button>
            </div>
          </motion.div>

          {/* Right Section - Scrollable Product Cards */}
          <div
            ref={scrollRef}
            className="flex overflow-x-auto scrollbar-hide gap-4 lg:gap-[25px] pb-4 -mx-4 px-4 lg:mx-0 lg:px-0"
            style={{
              scrollSnapType: "x mandatory",
            }}
          >
            {isLoading ? (
              // Loading skeleton
              [...Array(3)].map((_, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 relative w-[240px] sm:w-[260px] lg:w-[277px] h-[380px] sm:h-[400px] lg:h-[432px] animate-pulse"
                  style={{
                    borderRadius: "24px",
                    border: "1.18px solid #292929",
                    background: "linear-gradient(180deg, rgba(15, 15, 15, 0.00) 0%, #0F0F0F 100%)",
                  }}
                >
                  <div className="p-2 lg:p-[9px] h-full flex flex-col">
                    <div className="w-full aspect-square rounded-[14px] bg-white/5" />
                    <div className="flex-1 flex flex-col gap-2 mt-3 px-1">
                      <div className="h-4 bg-white/5 rounded w-full" />
                      <div className="h-4 bg-white/5 rounded w-3/4" />
                      <div className="h-5 bg-white/5 rounded w-1/3 mt-1" />
                      <div className="mt-auto h-[35px] bg-white/5 rounded-[10px]" />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              products.map((product, index) => {
                const variant = product.variants[0];
                const cartQty = variant ? getCartQuantity(variant.id) : 0;
                const price = getProductPrice(product);
                const image = product.thumbnail || product.images[0]?.url || "/images/product-1.png";

                return (
                  <motion.div
                    key={product.id}
                    className="flex-shrink-0 relative w-[240px] sm:w-[260px] lg:w-[277px] h-[380px] sm:h-[400px] lg:h-[432px]"
                    style={{
                      scrollSnapAlign: "start",
                    }}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.6 }}
                  >
                    {/* Card Background */}
                    <div
                      className="absolute inset-0"
                      style={{
                        borderRadius: "24px",
                        border: "1.18px solid #292929",
                        background: "linear-gradient(180deg, rgba(15, 15, 15, 0.00) 0%, #0F0F0F 100%)",
                      }}
                    />

                    {/* Card Content */}
                    <div
                      className="relative flex flex-col items-center p-2 lg:p-[9px] h-full"
                    >
                      {/* Product Image */}
                      <Link href={`/products/${product.handle}`} className="relative w-full aspect-square mb-3 overflow-hidden rounded-[14px] lg:rounded-[17px] block">
                        <Image
                          src={image}
                          alt={product.title}
                          fill
                          className="object-contain transition-transform duration-300 hover:scale-105"
                        />
                      </Link>

                      {/* Product Info */}
                      <div
                        className="w-full flex flex-col justify-between flex-1 px-1"
                      >
                        <div className="flex flex-col gap-1">
                          <Link href={`/products/${product.handle}`}>
                            <h3
                              className="text-[13px] lg:text-[14px] leading-[1.2] line-clamp-3 hover:opacity-80 transition-opacity"
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

                          <span
                            className="text-[14px] font-bold leading-[14px] mb-2"
                            style={{ color: "rgba(225, 37, 144, 1)" }}
                          >
                            {price || "Price unavailable"}
                          </span>
                        </div>

                        {/* Add to Cart / Quantity Controls */}
                        {cartQty > 0 && variant ? (
                          <div
                            className="w-full flex items-center justify-between text-white"
                            style={{
                              height: "35px",
                              flexShrink: 0,
                              borderRadius: "10px",
                              border: "1px solid #E1258F",
                              background: "rgba(225, 37, 143, 0.2)",
                            }}
                          >
                            <button
                              onClick={() => handleUpdateQuantity(variant.id, cartQty - 1)}
                              className="h-full px-4 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-all rounded-l-[9px]"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="text-[15px] font-semibold">
                              {cartQty}
                            </span>
                            <button
                              onClick={() => handleUpdateQuantity(variant.id, cartQty + 1)}
                              className="h-full px-4 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-all rounded-r-[9px]"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleAddToCart(product)}
                            disabled={!variant}
                            className="w-full flex items-center justify-center text-[14px] lg:text-[15px] text-white transition-all hover:brightness-110 active:scale-95 disabled:opacity-50"
                            style={{
                              height: "35px",
                              flexShrink: 0,
                              borderRadius: "10px",
                              border: "1px solid #FFF",
                              background: "radial-gradient(30.86% 27.56% at 77.68% 0%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.00) 100%), radial-gradient(54.33% 42.36% at 29.91% 100%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.00) 100%), rgba(220, 3, 135, 0.40)",
                              boxShadow: "0 0 3px 0 #FFF inset",
                            }}
                          >
                            Add to Cart
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Mobile Navigation Arrows */}
          <div className="flex lg:hidden justify-center gap-3 mt-2">
            <button
              onClick={() => scroll("left")}
              className="w-[40px] h-[40px] flex items-center justify-center transition-opacity hover:opacity-80"
              style={{
                borderRadius: "10px",
                border: "1px solid rgba(153, 153, 153, 0.25)",
              }}
            >
              <ChevronLeft size={20} className="text-white/60" />
            </button>

            <button
              onClick={() => scroll("right")}
              className="w-[40px] h-[40px] flex items-center justify-center transition-opacity hover:opacity-80"
              style={{
                borderRadius: "10px",
                border: "1px solid rgba(153, 153, 153, 0.25)",
              }}
            >
              <ChevronRight size={20} className="text-white/60" />
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}
