"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  Minus,
  Plus,
  Check,
  Shield,
  Truck,
  Star,
  FlaskConical,
  Leaf,
  Zap,
  Clock,
  ChevronDown
} from "lucide-react";
import { useState, useEffect, use } from "react";
import Navbar from "@/components/Navbar";
import MobileLogo from "@/components/MobileLogo";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import {
  getProductByHandle,
  getSubscriptionOptions,
  getProductPrice,
  formatPrice,
  type Product,
  type SubscriptionOption,
  type ProductSection,
} from "@/lib/products";

// Default benefits for all products
const defaultBenefits = [
  { icon: "flask", title: "Lab Tested", description: "Third-party verified for purity and potency" },
  { icon: "leaf", title: "Premium Extract", description: "High-quality concentration" },
  { icon: "zap", title: "Fast Acting", description: "Feel the effects within 15-30 minutes" },
  { icon: "clock", title: "Long Lasting", description: "4-6 hours of balanced effects" },
];

export default function ProductPage({
  params
}: {
  params: Promise<{ handle: string }>
}) {
  const { handle } = use(params);
  const { addToCart, addSubscription, items, updateQuantity } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [subscriptionOptions, setSubscriptionOptions] = useState<SubscriptionOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isSubscribe, setIsSubscribe] = useState(false);
  const [selectedSubscriptionKey, setSelectedSubscriptionKey] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>("benefits");
  const [justAdded, setJustAdded] = useState(false);

  // Load product
  useEffect(() => {
    async function loadProduct() {
      try {
        setIsLoading(true);
        setError(null);

        const prod = await getProductByHandle(handle);
        if (prod) {
          setProduct(prod);
          // Load subscription options
          const options = await getSubscriptionOptions(prod.id);
          setSubscriptionOptions(options);
          if (options.length > 0) {
            setSelectedSubscriptionKey(`${options[0].interval}-${options[0].interval_count}`);
          }
        } else {
          setError("Product not found");
        }
      } catch (err) {
        console.error("Failed to load product:", err);
        setError("Failed to load product");
      } finally {
        setIsLoading(false);
      }
    }

    loadProduct();
  }, [handle]);

  // Get cart quantity for current product
  const variant = product?.variants?.[0];
  const cartItem = items.find(i => i.variant_id === variant?.id);
  const cartQuantity = cartItem?.quantity || 0;

  // Calculate prices
  const basePrice = variant?.prices?.[0]?.amount || 0;

  // Find selected subscription option and calculate dynamic discount
  const selectedOption = subscriptionOptions.find(
    opt => `${opt.interval}-${opt.interval_count}` === selectedSubscriptionKey
  );
  const subscribeDiscountPercent = selectedOption?.discount_percent ?? 0;
  const subscribePrice = basePrice * (1 - subscribeDiscountPercent / 100);

  const handleAddToCart = async () => {
    if (!variant) return;

    try {
      if (isSubscribe && selectedSubscriptionKey) {
        await addSubscription(variant.id, quantity, selectedSubscriptionKey);
      } else {
        for (let i = 0; i < quantity; i++) {
          await addToCart(variant.id, 1);
        }
      }
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    } catch (err) {
      console.error("Failed to add to cart:", err);
    }
  };

  const handleUpdateQuantity = async (newQty: number) => {
    if (!cartItem) return;
    try {
      await updateQuantity(cartItem.id, newQty);
    } catch (err) {
      console.error("Failed to update quantity:", err);
    }
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "flask": return <FlaskConical size={20} />;
      case "leaf": return <Leaf size={20} />;
      case "zap": return <Zap size={20} />;
      case "clock": return <Clock size={20} />;
      default: return <Check size={20} />;
    }
  };

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

  // Error state
  if (error || !product) {
    return (
      <main className="min-h-screen bg-yum-dark relative">
        <MobileLogo />
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <h1 className="text-4xl font-bold text-white mb-4">Product Not Found</h1>
          <p className="text-white/60 mb-8">The product you&apos;re looking for doesn&apos;t exist.</p>
          <Link
            href="/collections"
            className="px-6 py-3 rounded-xl text-white font-medium transition-all hover:scale-105"
            style={{ background: "#E1258F" }}
          >
            Browse Products
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  // Product images
  const images = product.images.length > 0
    ? product.images.map(img => img.url)
    : [product.thumbnail || "/images/product-1.png"];

  // Product metadata and dynamic sections
  const metadata = product.metadata || {};

  // Build sections from new format or legacy fields
  const buildSections = (): ProductSection[] => {
    // Check for new sections format first
    if (metadata.sections && Array.isArray(metadata.sections)) {
      return metadata.sections as ProductSection[];
    }

    // Fall back to legacy format for backwards compatibility
    const legacySections: ProductSection[] = [];
    let order = 1;

    // Always include description as first section
    if (product.description) {
      legacySections.push({
        id: "description",
        title: "Full Description",
        type: "text",
        content: product.description,
        order: order++,
      });
    }

    if (metadata.specs && Array.isArray(metadata.specs)) {
      legacySections.push({
        id: "specs",
        title: "Specifications",
        type: "table",
        content: metadata.specs as { label: string; value: string }[],
        order: order++,
      });
    }

    if (metadata.ingredients && Array.isArray(metadata.ingredients)) {
      legacySections.push({
        id: "ingredients",
        title: "Ingredients",
        type: "list",
        content: metadata.ingredients as string[],
        order: order++,
      });
    }

    if (metadata.usage) {
      legacySections.push({
        id: "usage",
        title: "How to Use",
        type: "text",
        content: metadata.usage as string,
        order: order++,
      });
    }

    return legacySections;
  };

  const sections = buildSections().sort((a, b) => a.order - b.order);

  return (
    <main className="min-h-screen bg-yum-dark relative">
      <MobileLogo />
      <Navbar />

      <section className="relative pt-28 lg:pt-36 pb-16 px-4">
        <div className="max-w-[1200px] mx-auto">
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <Link
              href="/collections"
              className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm"
            >
              <ChevronLeft size={16} />
              <span>Back to Shop</span>
            </Link>
          </motion.div>

          {/* Main Product Section */}
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
            {/* Image Gallery */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Main Image */}
              <div
                className="relative aspect-square rounded-2xl overflow-hidden mb-4"
                style={{
                  background: "linear-gradient(180deg, rgba(20,20,20,0.5) 0%, rgba(10,10,10,0.8) 100%)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedImage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={images[selectedImage]}
                      alt={product.title}
                      fill
                      className="object-cover"
                      priority
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Thumbnail Gallery */}
              {images.length > 1 && (
                <div className="flex gap-3">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`relative w-20 h-20 rounded-xl overflow-hidden transition-all ${
                        selectedImage === idx ? "ring-2 ring-yum-pink" : "ring-1 ring-white/10 hover:ring-white/30"
                      }`}
                      style={{ background: "rgba(20,20,20,0.5)" }}
                    >
                      <Image
                        src={img}
                        alt={`${product.title} ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {/* Title */}
              <h1
                className="text-3xl lg:text-4xl font-bold mb-2"
                style={{
                  background: "linear-gradient(180deg, #FFFFFF 0%, #CCCCCC 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {product.title}
              </h1>
              <p className="text-white/60 text-lg mb-4">{product.subtitle}</p>

              {/* Rating */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} size={16} className="fill-yum-gold text-yum-gold" />
                  ))}
                </div>
                <span className="text-white/60 text-sm">Reviews</span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-3xl font-bold text-white">
                  {isSubscribe ? formatPrice(subscribePrice) : getProductPrice(product) || formatPrice(basePrice)}
                </span>
                {isSubscribe && subscribeDiscountPercent > 0 && (
                  <>
                    <span className="text-lg text-white/40 line-through">
                      {formatPrice(basePrice)}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs font-bold text-white bg-yum-pink">
                      {subscribeDiscountPercent}% OFF
                    </span>
                  </>
                )}
              </div>

              {/* Description */}
              <p className="text-white/60 leading-relaxed mb-8">
                {product.description}
              </p>

              {/* Purchase Options */}
              <div className="space-y-3 mb-8">
                {/* One-time purchase */}
                <button
                  onClick={() => setIsSubscribe(false)}
                  className={`w-full p-4 rounded-xl text-left transition-all ${
                    !isSubscribe
                      ? "ring-2 ring-yum-pink bg-yum-pink/10"
                      : "ring-1 ring-white/15 hover:ring-white/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        !isSubscribe ? "border-yum-pink" : "border-white/30"
                      }`}>
                        {!isSubscribe && <div className="w-2.5 h-2.5 rounded-full bg-yum-pink" />}
                      </div>
                      <span className="text-white font-medium">One-time purchase</span>
                    </div>
                    <span className="text-white font-bold">{formatPrice(basePrice)}</span>
                  </div>
                </button>

                {/* Subscribe & Save */}
                {subscriptionOptions.length > 0 && (
                  <div
                    className={`w-full p-4 rounded-xl text-left transition-all cursor-pointer ${
                      isSubscribe
                        ? "ring-2 ring-yum-pink bg-yum-pink/10"
                        : "ring-1 ring-white/15 hover:ring-white/30"
                    }`}
                  >
                    <div
                      className="flex items-center justify-between mb-2"
                      onClick={() => setIsSubscribe(true)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSubscribe ? "border-yum-pink" : "border-white/30"
                        }`}>
                          {isSubscribe && <div className="w-2.5 h-2.5 rounded-full bg-yum-pink" />}
                        </div>
                        <span className="text-white font-medium">Subscribe & Save{subscribeDiscountPercent > 0 ? ` ${subscribeDiscountPercent}%` : ''}</span>
                      </div>
                      <span className="text-white font-bold">{formatPrice(subscribePrice)}</span>
                    </div>
                    {isSubscribe && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        className="ml-8 mt-3"
                      >
                        <p className="text-white/50 text-sm mb-3">Delivery frequency:</p>
                        <div className="flex flex-wrap gap-2">
                          {subscriptionOptions.map((option) => {
                            const optionKey = `${option.interval}-${option.interval_count}`;
                            return (
                              <button
                                key={optionKey}
                                onClick={() => setSelectedSubscriptionKey(optionKey)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                  selectedSubscriptionKey === optionKey
                                    ? "bg-yum-pink text-white"
                                    : "bg-white/10 text-white/60 hover:bg-white/20"
                                }`}
                              >
                                {option.label} ({option.discount_percent}% off)
                              </button>
                            );
                          })}
                        </div>
                        <div className="flex items-center gap-2 mt-3 text-white/50 text-xs">
                          <Check size={14} className="text-green-400" />
                          <span>Cancel anytime - Free shipping - Skip or pause deliveries</span>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}
              </div>

              {/* Quantity & Add to Cart */}
              <div className="flex gap-4 mb-8">
                {/* Quantity Selector */}
                <div
                  className="flex items-center rounded-xl overflow-hidden"
                  style={{ border: "1px solid rgba(255,255,255,0.15)" }}
                >
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <Minus size={18} />
                  </button>
                  <span className="w-12 text-center text-white font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-12 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <Plus size={18} />
                  </button>
                </div>

                {/* Add to Cart Button */}
                {cartQuantity > 0 ? (
                  <div
                    className="flex-1 flex items-center justify-between rounded-xl px-6"
                    style={{ border: "1px solid #E1258F", background: "rgba(225,37,143,0.15)" }}
                  >
                    <button
                      onClick={() => handleUpdateQuantity(cartQuantity - 1)}
                      className="p-2 text-white/80 hover:text-white"
                    >
                      <Minus size={18} />
                    </button>
                    <span className="text-white font-semibold">{cartQuantity} in cart</span>
                    <button
                      onClick={() => handleUpdateQuantity(cartQuantity + 1)}
                      className="p-2 text-white/80 hover:text-white"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleAddToCart}
                    disabled={!variant}
                    className="flex-1 h-12 rounded-xl font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                    style={{
                      background: justAdded
                        ? "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)"
                        : "linear-gradient(135deg, #E1258F 0%, #C01F7A 100%)",
                      boxShadow: justAdded
                        ? "0 4px 20px rgba(34,197,94,0.4)"
                        : "0 4px 20px rgba(225,37,143,0.4)",
                    }}
                  >
                    {justAdded ? "Added to Cart!" : isSubscribe ? "Subscribe Now" : "Add to Cart"}
                  </button>
                )}
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap gap-4 mb-8 pb-8 border-b border-white/10">
                <div className="flex items-center gap-2 text-white/60 text-sm">
                  <Shield size={16} className="text-green-400" />
                  <span>Lab Tested</span>
                </div>
                <div className="flex items-center gap-2 text-white/60 text-sm">
                  <Truck size={16} className="text-yum-cyan" />
                  <span>Free Shipping $50+</span>
                </div>
                <div className="flex items-center gap-2 text-white/60 text-sm">
                  <Check size={16} className="text-yum-gold" />
                  <span>Satisfaction Guaranteed</span>
                </div>
              </div>

              {/* Benefits Grid */}
              <div className="grid grid-cols-2 gap-4">
                {defaultBenefits.map((benefit, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <div className="text-yum-pink mb-2">{getIcon(benefit.icon)}</div>
                    <h4 className="text-white font-medium text-sm mb-1">{benefit.title}</h4>
                    <p className="text-white/50 text-xs">{benefit.description}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Product Details Accordion - Dynamic Sections */}
          {sections.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-16 max-w-3xl"
            >
              {sections.map((section) => (
                <div key={section.id} className="border-b border-white/10">
                  <button
                    onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                    className="w-full py-5 flex items-center justify-between text-left"
                  >
                    <span className="text-white font-medium">{section.title}</span>
                    <ChevronDown
                      size={20}
                      className={`text-white/60 transition-transform ${expandedSection === section.id ? "rotate-180" : ""}`}
                    />
                  </button>
                  <AnimatePresence>
                    {expandedSection === section.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="pb-5 text-white/60 leading-relaxed">
                          {/* Text content */}
                          {section.type === "text" && (
                            <p>{section.content as string}</p>
                          )}

                          {/* List content */}
                          {section.type === "list" && (
                            <ul className="space-y-1">
                              {(section.content as string[]).map((item, idx) => (
                                <li key={idx} className="flex items-center gap-2">
                                  <span className="text-yum-pink">•</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          )}

                          {/* Table content */}
                          {section.type === "table" && (
                            <div className="space-y-2">
                              {(section.content as { label: string; value: string }[]).map((row, idx) => (
                                <div
                                  key={idx}
                                  className="flex justify-between items-center py-2.5 px-3 rounded-lg"
                                  style={{
                                    background: idx % 2 === 0 ? "rgba(255,255,255,0.03)" : "transparent"
                                  }}
                                >
                                  <span className="text-white/50 text-sm">{row.label}</span>
                                  <span className="text-white font-medium text-sm text-right">{row.value}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
