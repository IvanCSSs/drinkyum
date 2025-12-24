"use client";

import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react";
import { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";

const products = [
  {
    id: 1,
    name: "Triple Play - YUM Delicious Kratom Extract - Bubble Gum 30ml",
    price: "$70.00",
    image: "/images/product-1.png",
  },
  {
    id: 2,
    name: "Triple Play - YUM Tropical Breeze 30ml Delicious Kratom Extract",
    price: "$70.00",
    image: "/images/product-2.png",
  },
  {
    id: 3,
    name: "333 - Bubble Gum + Tropical Breeze YUM Holiday Bundle (6 Units)",
    price: "$140.00",
    image: "/images/product-3.png",
  },
];

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

export default function Products() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [cartQuantities, setCartQuantities] = useState<Record<number, number>>({});

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 280;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Sync with global cart state
  useEffect(() => {
    const win = window as WindowWithCart;
    
    // Get initial cart state
    if (win.getCartItems) {
      const items = win.getCartItems();
      const quantities: Record<number, number> = {};
      items.forEach((item) => {
        quantities[item.id] = item.quantity;
      });
      setCartQuantities(quantities);
    }

    // Subscribe to cart updates
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

  const handleAddToCart = useCallback((product: typeof products[0]) => {
    const win = window as WindowWithCart;
    if (win.addToCart) {
      win.addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
      });
    }
  }, []);

  const handleUpdateQuantity = useCallback((productId: number, newQuantity: number) => {
    const win = window as WindowWithCart;
    if (win.updateCartQuantity) {
      win.updateCartQuantity(productId, newQuantity);
    }
  }, []);

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
            {products.map((product, index) => (
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
                  <div className="relative w-full aspect-square mb-3 overflow-hidden rounded-[14px] lg:rounded-[17px]">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                      style={{ transform: "scale(1.1)" }}
                    />
                  </div>

                  {/* Product Info */}
                  <div 
                    className="w-full flex flex-col justify-between flex-1 px-1"
                  >
                    <div className="flex flex-col gap-1">
                      <h3 
                        className="text-[13px] lg:text-[14px] leading-[1.2] line-clamp-3"
                        style={{
                          background: "linear-gradient(180deg, #FFFFFF 0%, #999999 100%)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          backgroundClip: "text",
                        }}
                      >
                        {product.name}
                      </h3>

                      <span 
                        className="text-[14px] font-bold leading-[14px] mb-2"
                        style={{ color: "rgba(225, 37, 144, 1)" }}
                      >
                        {product.price}
                      </span>
                    </div>

                    {/* Add to Cart / Quantity Controls */}
                    {cartQuantities[product.id] > 0 ? (
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
                          onClick={() => handleUpdateQuantity(product.id, cartQuantities[product.id] - 1)}
                          className="h-full px-4 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-all rounded-l-[9px]"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="text-[15px] font-semibold">
                          {cartQuantities[product.id]}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(product.id, cartQuantities[product.id] + 1)}
                          className="h-full px-4 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-all rounded-r-[9px]"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="w-full flex items-center justify-center text-[14px] lg:text-[15px] text-white transition-all hover:brightness-110 active:scale-95"
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
            ))}
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
