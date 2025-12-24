"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Minus, Plus } from "lucide-react";
import { useState, useEffect, useCallback, use } from "react";
import Navbar from "@/components/Navbar";
import MobileLogo from "@/components/MobileLogo";
import Footer from "@/components/Footer";

// Placeholder collections data - will be replaced with Medusa data
const collectionsData: Record<string, {
  title: string;
  description: string;
  longDescription: string;
  accentColor: string;
  products: {
    id: number;
    name: string;
    price: string;
    image: string;
    description: string;
  }[];
}> = {
  "bestsellers": {
    title: "Bestsellers",
    description: "Our most loved kratom extracts, tried and trusted by thousands.",
    longDescription: "Discover why these are the favorites. Each product in our Bestsellers collection has earned its place through exceptional quality, unbeatable flavor, and proven results. Join thousands of satisfied customers who've made these their go-to choice.",
    accentColor: "#E1258F",
    products: [
      { id: 1, name: "Triple Play - YUM Delicious Kratom Extract - Bubble Gum 30ml", price: "$70.00", image: "/images/product-1.png", description: "Premium 7.5% mitragyna extract with bubble gum flavor" },
      { id: 2, name: "Triple Play - YUM Tropical Breeze 30ml Delicious Kratom Extract", price: "$70.00", image: "/images/product-2.png", description: "Refreshing tropical blend with premium extract" },
      { id: 3, name: "333 - Bubble Gum + Tropical Breeze YUM Holiday Bundle", price: "$140.00", image: "/images/product-3.png", description: "Best of both worlds in one bundle" },
      { id: 4, name: "YUM Classic Extract - Original Formula 30ml", price: "$65.00", image: "/images/product-1.png", description: "Our signature blend that started it all" },
    ],
  },
  "tropical-collection": {
    title: "Tropical Collection",
    description: "Escape to paradise with our refreshing tropical-flavored extracts.",
    longDescription: "Transport yourself to a tropical paradise with every sip. Our Tropical Collection features exotic fruit flavors that make your daily ritual feel like a vacation. Premium quality meets island vibes.",
    accentColor: "#00B8E4",
    products: [
      { id: 5, name: "Triple Play - YUM Tropical Breeze 30ml", price: "$70.00", image: "/images/product-2.png", description: "Refreshing tropical blend" },
      { id: 6, name: "YUM Mango Sunrise Extract 30ml", price: "$68.00", image: "/images/product-1.png", description: "Sweet mango with citrus notes" },
      { id: 7, name: "YUM Pineapple Paradise 30ml", price: "$68.00", image: "/images/product-3.png", description: "Fresh pineapple flavor explosion" },
    ],
  },
  "bundles": {
    title: "Value Bundles",
    description: "Maximum savings on our premium multi-packs and bundles.",
    longDescription: "Smart savings for smart customers. Our Value Bundles give you more of what you love at prices that make sense. Stock up and save with our carefully curated multi-packs.",
    accentColor: "#E2C530",
    products: [
      { id: 8, name: "333 - Bubble Gum + Tropical Breeze Holiday Bundle (6 Units)", price: "$140.00", image: "/images/product-3.png", description: "6-pack variety bundle" },
      { id: 9, name: "Starter Bundle - Try All Flavors (3 Units)", price: "$95.00", image: "/images/product-1.png", description: "Perfect introduction to YUM" },
      { id: 10, name: "Monthly Supply Bundle (12 Units)", price: "$250.00", image: "/images/product-2.png", description: "Never run out with monthly supply" },
    ],
  },
  "new-arrivals": {
    title: "New Arrivals",
    description: "Fresh drops and limited editions you don't want to miss.",
    longDescription: "Be the first to try our latest innovations. New Arrivals features our freshest formulas, limited edition flavors, and exciting new products. Get them before they're gone.",
    accentColor: "#E1258F",
    products: [
      { id: 11, name: "YUM Watermelon Wave 30ml - NEW", price: "$72.00", image: "/images/product-1.png", description: "Fresh watermelon flavor, just launched" },
      { id: 12, name: "YUM Berry Blast 30ml - LIMITED", price: "$72.00", image: "/images/product-2.png", description: "Mixed berry limited edition" },
    ],
  },
  "starter-packs": {
    title: "Starter Packs",
    description: "Perfect for first-timers. Discover your favorite YUM flavor.",
    longDescription: "New to YUM? Start here. Our Starter Packs are designed to help you find your perfect match. Sample our range of flavors and discover why thousands choose YUM.",
    accentColor: "#00B8E4",
    products: [
      { id: 13, name: "First Timer Sample Pack (2 Units)", price: "$50.00", image: "/images/product-3.png", description: "Try before you commit" },
      { id: 14, name: "Discovery Pack - All Flavors (4 Units)", price: "$120.00", image: "/images/product-1.png", description: "Taste the full range" },
    ],
  },
  "subscribe-save": {
    title: "Subscribe & Save",
    description: "Never run out. Get 20% off with monthly deliveries.",
    longDescription: "Set it and forget it. Subscribe to your favorites and save 20% on every order. Free shipping, easy management, cancel anytime. The smartest way to stay stocked.",
    accentColor: "#E2C530",
    products: [
      { id: 15, name: "Monthly Bubble Gum Subscription", price: "$56.00", image: "/images/product-1.png", description: "Save 20% - $70 value" },
      { id: 16, name: "Monthly Tropical Subscription", price: "$56.00", image: "/images/product-2.png", description: "Save 20% - $70 value" },
      { id: 17, name: "Monthly Variety Subscription (3 Units)", price: "$168.00", image: "/images/product-3.png", description: "Save 20% - $210 value" },
    ],
  },
};

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

export default function CollectionPage({ 
  params 
}: { 
  params: Promise<{ handle: string }> 
}) {
  const { handle } = use(params);
  const collection = collectionsData[handle];
  
  const [cartQuantities, setCartQuantities] = useState<Record<number, number>>({});

  // Sync with global cart state
  useEffect(() => {
    const win = window as WindowWithCart;
    
    if (win.getCartItems) {
      const items = win.getCartItems();
      const quantities: Record<number, number> = {};
      items.forEach((item) => {
        quantities[item.id] = item.quantity;
      });
      setCartQuantities(quantities);
    }

    if (win.onCartUpdate) {
      win.onCartUpdate((items) => {
        const quantities: Record<number, number> = {};
        items.forEach((item) => {
          quantities[item.id] = item.quantity;
        });
        setCartQuantities(quantities);
      });
    }
  }, []);

  const handleAddToCart = useCallback((product: { id: number; name: string; price: string; image: string }) => {
    const win = window as WindowWithCart;
    if (win.addToCart) {
      win.addToCart(product);
    }
  }, []);

  const handleUpdateQuantity = useCallback((productId: number, newQuantity: number) => {
    const win = window as WindowWithCart;
    if (win.updateCartQuantity) {
      win.updateCartQuantity(productId, newQuantity);
    }
  }, []);

  // 404 state
  if (!collection) {
    return (
      <main className="min-h-screen bg-yum-dark relative">
        <MobileLogo />
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <h1 className="text-4xl font-bold text-white mb-4">Collection Not Found</h1>
          <p className="text-white/60 mb-8">The collection you're looking for doesn't exist.</p>
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
            background: `radial-gradient(ellipse at center top, ${collection.accentColor}20 0%, transparent 70%)`,
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
              style={{ background: collection.accentColor }}
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
              {collection.title}
            </h1>
            
            <p className="text-white/60 text-lg leading-relaxed">
              {collection.longDescription}
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
              {collection.products.length} {collection.products.length === 1 ? "product" : "products"}
            </span>
          </motion.div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 lg:gap-6">
            {collection.products.map((product, index) => (
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
                <Link href={`/products/${product.id}`}>
                  <div className="relative aspect-square overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                </Link>

                {/* Product Info */}
                <div className="p-4">
                  <Link href={`/products/${product.id}`}>
                    <h3 
                      className="text-sm font-medium leading-tight mb-1 line-clamp-2 hover:text-white/80 transition-colors"
                      style={{
                        background: "linear-gradient(180deg, #FFFFFF 0%, #999999 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                    >
                      {product.name}
                    </h3>
                  </Link>
                  
                  <p className="text-white/40 text-xs mb-3 line-clamp-1">
                    {product.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span 
                      className="text-base font-bold"
                      style={{ color: collection.accentColor }}
                    >
                      {product.price}
                    </span>
                  </div>

                  {/* Add to Cart / Quantity Controls */}
                  <div className="mt-3">
                    {cartQuantities[product.id] > 0 ? (
                      <div
                        className="w-full flex items-center justify-between text-white rounded-lg"
                        style={{
                          height: "38px",
                          border: `1px solid ${collection.accentColor}`,
                          background: `${collection.accentColor}20`,
                        }}
                      >
                        <button
                          onClick={() => handleUpdateQuantity(product.id, cartQuantities[product.id] - 1)}
                          className="h-full px-4 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-all rounded-l-lg"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-sm font-semibold">
                          {cartQuantities[product.id]}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(product.id, cartQuantities[product.id] + 1)}
                          className="h-full px-4 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-all rounded-r-lg"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="w-full h-[38px] rounded-lg text-sm font-medium text-white transition-all hover:brightness-110 active:scale-[0.98]"
                        style={{
                          background: `linear-gradient(135deg, ${collection.accentColor} 0%, ${collection.accentColor}CC 100%)`,
                          boxShadow: `0 4px 15px ${collection.accentColor}40`,
                        }}
                      >
                        Add to Cart
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}



