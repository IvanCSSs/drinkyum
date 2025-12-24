"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
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
import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Placeholder product data - will be replaced with Medusa data
const productsData: Record<string, {
  id: number;
  handle: string;
  title: string;
  subtitle: string;
  price: number;
  compareAtPrice?: number;
  description: string;
  longDescription: string;
  images: string[];
  benefits: { icon: string; title: string; description: string }[];
  specs: { label: string; value: string }[];
  ingredients: string[];
  usage: string;
  warnings: string;
  reviews: { name: string; rating: number; text: string; date: string; verified: boolean }[];
  relatedProducts: { id: number; handle: string; name: string; price: string; image: string }[];
}> = {
  "1": {
    id: 1,
    handle: "1",
    title: "Triple Play - YUM Delicious Kratom Extract",
    subtitle: "Bubble Gum 30ml",
    price: 70.00,
    compareAtPrice: 85.00,
    description: "Premium 7.5% mitragyna extract with irresistible bubble gum flavor. Experience the perfect blend of potency and taste.",
    longDescription: "Our flagship Triple Play formula delivers a precisely crafted 7.5% mitragyna extract in a delicious bubble gum flavor that makes your daily ritual something to look forward to. Each 30ml bottle is lab-tested for purity and potency, ensuring you get exactly what's on the label—nothing more, nothing less. Crafted in small batches using only the finest ingredients sourced from sustainable farms.",
    images: ["/images/product-1.png", "/images/product-2.png", "/images/product-3.png"],
    benefits: [
      { icon: "flask", title: "Lab Tested", description: "Third-party verified for purity and potency" },
      { icon: "leaf", title: "Premium Extract", description: "7.5% mitragyna concentration" },
      { icon: "zap", title: "Fast Acting", description: "Feel the effects within 15-30 minutes" },
      { icon: "clock", title: "Long Lasting", description: "4-6 hours of balanced effects" },
    ],
    specs: [
      { label: "Volume", value: "30ml" },
      { label: "Extract Concentration", value: "7.5%" },
      { label: "Servings Per Bottle", value: "15-30" },
      { label: "Flavor", value: "Bubble Gum" },
      { label: "Origin", value: "Southeast Asia" },
      { label: "Shelf Life", value: "24 months" },
    ],
    ingredients: ["Mitragyna Speciosa Extract", "Purified Water", "Natural Flavors", "Citric Acid", "Potassium Sorbate"],
    usage: "Shake well before use. Start with 1ml and adjust as needed. Do not exceed 4ml in 24 hours. Best taken on an empty stomach.",
    warnings: "For adults 21+ only. Do not use if pregnant or nursing. Consult a physician before use if you have a medical condition or take medications. Do not operate heavy machinery after use.",
    reviews: [
      { name: "Mike R.", rating: 5, text: "Best kratom extract I've ever tried. The bubble gum flavor is actually amazing and it works fast. Will definitely be subscribing.", date: "2 weeks ago", verified: true },
      { name: "Sarah L.", rating: 5, text: "Finally a kratom product that doesn't taste terrible! Great effects too. Exactly what I was looking for.", date: "1 month ago", verified: true },
      { name: "James T.", rating: 4, text: "Really good product. Effects are consistent every time. Only giving 4 stars because I wish the bottle was bigger!", date: "1 month ago", verified: true },
    ],
    relatedProducts: [
      { id: 2, handle: "2", name: "Triple Play - Tropical Breeze 30ml", price: "$70.00", image: "/images/product-2.png" },
      { id: 3, handle: "3", name: "Holiday Bundle (6 Units)", price: "$140.00", image: "/images/product-3.png" },
    ],
  },
  "2": {
    id: 2,
    handle: "2",
    title: "Triple Play - YUM Tropical Breeze",
    subtitle: "Kratom Extract 30ml",
    price: 70.00,
    compareAtPrice: 85.00,
    description: "Premium 7.5% mitragyna extract with refreshing tropical fruit flavor. Paradise in every drop.",
    longDescription: "Escape to paradise with our Tropical Breeze formula. The same premium 7.5% mitragyna extract you love, now with a refreshing blend of tropical fruits that transports you to an island getaway. Perfect for those who want potency without compromise on taste.",
    images: ["/images/product-2.png", "/images/product-1.png", "/images/product-3.png"],
    benefits: [
      { icon: "flask", title: "Lab Tested", description: "Third-party verified for purity and potency" },
      { icon: "leaf", title: "Premium Extract", description: "7.5% mitragyna concentration" },
      { icon: "zap", title: "Fast Acting", description: "Feel the effects within 15-30 minutes" },
      { icon: "clock", title: "Long Lasting", description: "4-6 hours of balanced effects" },
    ],
    specs: [
      { label: "Volume", value: "30ml" },
      { label: "Extract Concentration", value: "7.5%" },
      { label: "Servings Per Bottle", value: "15-30" },
      { label: "Flavor", value: "Tropical Breeze" },
      { label: "Origin", value: "Southeast Asia" },
      { label: "Shelf Life", value: "24 months" },
    ],
    ingredients: ["Mitragyna Speciosa Extract", "Purified Water", "Natural Flavors", "Citric Acid", "Potassium Sorbate"],
    usage: "Shake well before use. Start with 1ml and adjust as needed. Do not exceed 4ml in 24 hours.",
    warnings: "For adults 21+ only. Do not use if pregnant or nursing. Consult a physician before use.",
    reviews: [
      { name: "Alex K.", rating: 5, text: "The tropical flavor is incredible. Tastes like a vacation!", date: "1 week ago", verified: true },
      { name: "Jessica M.", rating: 5, text: "My new favorite. Great taste and great effects.", date: "3 weeks ago", verified: true },
    ],
    relatedProducts: [
      { id: 1, handle: "1", name: "Triple Play - Bubble Gum 30ml", price: "$70.00", image: "/images/product-1.png" },
      { id: 3, handle: "3", name: "Holiday Bundle (6 Units)", price: "$140.00", image: "/images/product-3.png" },
    ],
  },
  "3": {
    id: 3,
    handle: "3",
    title: "333 Holiday Bundle",
    subtitle: "Bubble Gum + Tropical Breeze (6 Units)",
    price: 140.00,
    compareAtPrice: 210.00,
    description: "Get the best of both worlds with our holiday bundle. 3 Bubble Gum + 3 Tropical Breeze at an unbeatable price.",
    longDescription: "Why choose when you can have both? Our 333 Holiday Bundle includes 3 bottles of our bestselling Bubble Gum and 3 bottles of refreshing Tropical Breeze. That's 6 bottles of premium 7.5% extract at over 30% off. Stock up and save, or share with friends.",
    images: ["/images/product-3.png", "/images/product-1.png", "/images/product-2.png"],
    benefits: [
      { icon: "flask", title: "Lab Tested", description: "Every bottle third-party verified" },
      { icon: "leaf", title: "Variety Pack", description: "Try both bestselling flavors" },
      { icon: "zap", title: "Best Value", description: "Save over 30% vs buying separately" },
      { icon: "clock", title: "Stock Up", description: "6 bottles = 2+ months supply" },
    ],
    specs: [
      { label: "Contents", value: "6 x 30ml bottles" },
      { label: "Flavors", value: "3 Bubble Gum, 3 Tropical Breeze" },
      { label: "Total Volume", value: "180ml" },
      { label: "Savings", value: "$70 (33% off)" },
    ],
    ingredients: ["Mitragyna Speciosa Extract", "Purified Water", "Natural Flavors", "Citric Acid", "Potassium Sorbate"],
    usage: "Shake well before use. Start with 1ml and adjust as needed. Do not exceed 4ml in 24 hours.",
    warnings: "For adults 21+ only. Do not use if pregnant or nursing. Consult a physician before use.",
    reviews: [
      { name: "David P.", rating: 5, text: "Insane value. Both flavors are amazing. This is the way to buy.", date: "5 days ago", verified: true },
      { name: "Michelle S.", rating: 5, text: "Perfect for stocking up. Love having variety!", date: "2 weeks ago", verified: true },
    ],
    relatedProducts: [
      { id: 1, handle: "1", name: "Triple Play - Bubble Gum 30ml", price: "$70.00", image: "/images/product-1.png" },
      { id: 2, handle: "2", name: "Triple Play - Tropical Breeze 30ml", price: "$70.00", image: "/images/product-2.png" },
    ],
  },
};

// Default product for any other handle
const defaultProduct = productsData["1"];

interface CartItem {
  id: number;
  quantity: number;
}

type WindowWithCart = typeof window & {
  addToCart?: (product: { id: number; name: string; price: string; image: string }) => void;
  updateCartQuantity?: (id: number, quantity: number) => void;
  getCartItems?: () => CartItem[];
  onCartUpdate?: (callback: (items: CartItem[]) => void) => void;
};

export default function ProductPage() {
  const params = useParams();
  const handle = params.handle as string;
  const product = productsData[handle] || defaultProduct;
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isSubscribe, setIsSubscribe] = useState(false);
  const [subscribeFrequency, setSubscribeFrequency] = useState("30");
  const [expandedSection, setExpandedSection] = useState<string | null>("benefits");
  const [cartQuantity, setCartQuantity] = useState(0);
  const [justAdded, setJustAdded] = useState(false);

  const subscribeDiscount = 0.20; // 20% off
  const subscribePrice = product.price * (1 - subscribeDiscount);

  // Sync with cart
  useEffect(() => {
    const win = window as WindowWithCart;
    
    const syncCart = (items: CartItem[]) => {
      const item = items.find((i) => i.id === product.id);
      setCartQuantity(item?.quantity || 0);
    };

    if (win.getCartItems) {
      syncCart(win.getCartItems());
    }
    if (win.onCartUpdate) {
      win.onCartUpdate(syncCart);
    }
  }, [product.id]);

  const handleAddToCart = useCallback(() => {
    const win = window as WindowWithCart;
    if (win.addToCart) {
      for (let i = 0; i < quantity; i++) {
        win.addToCart({
          id: product.id,
          name: `${product.title} - ${product.subtitle}`,
          price: isSubscribe ? `$${subscribePrice.toFixed(2)}/mo` : `$${product.price.toFixed(2)}`,
          image: product.images[0],
        });
      }
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    }
  }, [product, quantity, isSubscribe, subscribePrice]);

  const handleUpdateQuantity = useCallback((newQty: number) => {
    const win = window as WindowWithCart;
    if (win.updateCartQuantity) {
      win.updateCartQuantity(product.id, newQty);
    }
  }, [product.id]);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "flask": return <FlaskConical size={20} />;
      case "leaf": return <Leaf size={20} />;
      case "zap": return <Zap size={20} />;
      case "clock": return <Clock size={20} />;
      default: return <Check size={20} />;
    }
  };

  return (
    <main className="min-h-screen bg-yum-dark">
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
                      src={product.images[selectedImage]}
                      alt={product.title}
                      fill
                      className="object-cover"
                      priority
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Sale badge */}
                {product.compareAtPrice && (
                  <div 
                    className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-bold text-white"
                    style={{ background: "#E1258F" }}
                  >
                    SAVE ${(product.compareAtPrice - product.price).toFixed(0)}
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery */}
              <div className="flex gap-3">
                {product.images.map((img, idx) => (
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
                <span className="text-white/60 text-sm">
                  {product.reviews.length} reviews
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-3xl font-bold text-white">
                  ${isSubscribe ? subscribePrice.toFixed(2) : product.price.toFixed(2)}
                </span>
                {(product.compareAtPrice || isSubscribe) && (
                  <span className="text-lg text-white/40 line-through">
                    ${(isSubscribe ? product.price : product.compareAtPrice)?.toFixed(2)}
                  </span>
                )}
                {isSubscribe && (
                  <span className="px-2 py-1 rounded-full text-xs font-bold text-white bg-yum-pink">
                    20% OFF
                  </span>
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
                    <span className="text-white font-bold">${product.price.toFixed(2)}</span>
                  </div>
                </button>

                {/* Subscribe & Save */}
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
                      <span className="text-white font-medium">Subscribe & Save 20%</span>
                    </div>
                    <span className="text-white font-bold">${subscribePrice.toFixed(2)}</span>
                  </div>
                  {isSubscribe && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      className="ml-8 mt-3"
                    >
                      <p className="text-white/50 text-sm mb-3">Delivery every:</p>
                      <div className="flex gap-2">
                        {["15", "30", "45", "60"].map((days) => (
                          <button
                            key={days}
                            onClick={() => setSubscribeFrequency(days)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                              subscribeFrequency === days
                                ? "bg-yum-pink text-white"
                                : "bg-white/10 text-white/60 hover:bg-white/20"
                            }`}
                          >
                            {days} days
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 mt-3 text-white/50 text-xs">
                        <Check size={14} className="text-green-400" />
                        <span>Cancel anytime • Free shipping • Skip or pause deliveries</span>
                      </div>
                    </motion.div>
                  )}
                </div>
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
                    className="flex-1 h-12 rounded-xl font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                      background: justAdded 
                        ? "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)"
                        : "linear-gradient(135deg, #E1258F 0%, #C01F7A 100%)",
                      boxShadow: justAdded
                        ? "0 4px 20px rgba(34,197,94,0.4)"
                        : "0 4px 20px rgba(225,37,143,0.4)",
                    }}
                  >
                    {justAdded ? "Added to Cart! ✓" : isSubscribe ? "Subscribe Now" : "Add to Cart"}
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
                {product.benefits.map((benefit, idx) => (
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

          {/* Product Details Accordion */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-16 max-w-3xl"
          >
            {[
              { id: "description", title: "Full Description", content: product.longDescription },
              { id: "specs", title: "Specifications", content: null, specs: product.specs },
              { id: "ingredients", title: "Ingredients", content: product.ingredients.join(", ") },
              { id: "usage", title: "How to Use", content: product.usage },
            ].map((section) => (
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
                        {section.specs ? (
                          <div className="grid grid-cols-2 gap-3">
                            {section.specs.map((spec, idx) => (
                              <div key={idx} className="flex justify-between">
                                <span className="text-white/40">{spec.label}</span>
                                <span className="text-white">{spec.value}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          section.content
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </motion.div>

          {/* Reviews Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-16"
          >
            <h2 
              className="text-2xl font-bold mb-8"
              style={{
                background: "linear-gradient(180deg, #FFFFFF 0%, #999999 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Customer Reviews
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {product.reviews.map((review, idx) => (
                <div 
                  key={idx}
                  className="p-6 rounded-2xl"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <div className="flex items-center gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        size={14} 
                        className={star <= review.rating ? "fill-yum-gold text-yum-gold" : "text-white/20"} 
                      />
                    ))}
                  </div>
                  <p className="text-white/70 text-sm mb-4 leading-relaxed">"{review.text}"</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium text-sm">{review.name}</span>
                      {review.verified && (
                        <span className="flex items-center gap-1 text-green-400 text-xs">
                          <Check size={12} /> Verified
                        </span>
                      )}
                    </div>
                    <span className="text-white/40 text-xs">{review.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Related Products */}
          {product.relatedProducts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-16"
            >
              <h2 
                className="text-2xl font-bold mb-8"
                style={{
                  background: "linear-gradient(180deg, #FFFFFF 0%, #999999 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                You Might Also Like
              </h2>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {product.relatedProducts.map((related) => (
                  <Link key={related.id} href={`/products/${related.handle}`}>
                    <div 
                      className="group rounded-xl overflow-hidden transition-all hover:scale-[1.02]"
                      style={{ background: "rgba(15,15,15,0.5)", border: "1px solid rgba(255,255,255,0.08)" }}
                    >
                      <div className="relative aspect-square">
                        <Image
                          src={related.image}
                          alt={related.name}
                          fill
                          className="object-contain p-4 transition-transform group-hover:scale-110"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="text-white text-sm font-medium line-clamp-2 mb-2">{related.name}</h3>
                        <span className="text-yum-pink font-bold">{related.price}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}

