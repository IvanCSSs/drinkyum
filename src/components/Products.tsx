"use client";

import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import Image from "next/image";

/*
  All dimensions scaled to 83% of Figma values
*/

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

export default function Products() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 302; // (277 + 25) card width + gap
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section 
      id="products" 
      className="relative bg-[#070707] flex justify-center px-4 py-12"
    >
      {/* Main Container - 1119px (1348 * 0.83) */}
      <div className="w-full max-w-[1119px] relative">
        {/* Decorative cyan ellipse - 978x262 (scaled), blur 83px */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[978px] h-[262px] pointer-events-none"
          style={{
            borderRadius: "978px",
            background: "rgba(0, 184, 228, 0.10)",
            filter: "blur(83px)",
          }}
        />

        {/* Content: HORIZONTAL layout, spacing 92px (111 * 0.83) */}
        <div 
          className="relative flex"
          style={{ gap: "92px", marginTop: "71px" }}
        >
          {/* Left Section - Title + Nav - 228px (275 * 0.83) */}
          <motion.div
            className="flex flex-col flex-shrink-0"
            style={{ width: "228px", gap: "278px" }}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Title Section - gap 16px (19 * 0.83) */}
            <div className="flex flex-col" style={{ gap: "16px" }}>
              {/* Top Sellers - 42px (50 * 0.83) */}
              <h2 
                className="text-[42px] font-bold italic leading-[42px]"
                style={{
                  background: "linear-gradient(135deg, #FFFFFF 0%, #999999 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Top Sellers
              </h2>

              {/* Description - 13px (16 * 0.83) */}
              <p 
                className="text-[13px] leading-[13px]"
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

            {/* Navigation Arrows - gap 12px (15 * 0.83) */}
            <div className="flex" style={{ gap: "12px" }}>
              {/* Left Arrow - 37x37 (45 * 0.83), radius 10px */}
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

              {/* Right Arrow - 37x37, radius 10px */}
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
            className="flex overflow-x-auto scrollbar-hide"
            style={{ 
              gap: "25px",
              scrollSnapType: "x mandatory",
            }}
          >
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                className="flex-shrink-0 relative"
                style={{ 
                  width: "277px",
                  height: "432px",
                  scrollSnapAlign: "start",
                }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
              >
                {/* Card Background - radius 31.5px (37.958 * 0.83) */}
                <div 
                  className="absolute inset-0"
                  style={{
                    borderRadius: "31.5px",
                    border: "1.18px solid #292929",
                    background: "linear-gradient(180deg, rgba(15, 15, 15, 0.00) 0%, #0F0F0F 100%)",
                  }}
                />

                {/* Card Content - padding 9px (11 * 0.83) */}
                <div 
                  className="relative flex flex-col items-center"
                  style={{ padding: "9px" }}
                >
                  {/* Product Image - 259x259 (312 * 0.83) */}
                  <div className="relative w-[259px] h-[259px] mb-3 overflow-hidden rounded-[17px]">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                      style={{ transform: "scale(1.1)" }}
                    />
                  </div>

                  {/* Product Info - fixed height 116px (140 * 0.83) */}
                  <div 
                    className="w-full flex flex-col justify-between"
                    style={{ height: "116px", padding: "0 4px" }}
                  >
                    {/* Top section: Name + Price */}
                    <div className="flex flex-col" style={{ gap: "4px" }}>
                      {/* Product Name - 14px, height 42px */}
                      <h3 
                        className="text-[14px] leading-[14px]"
                        style={{
                          height: "42px",
                          overflow: "hidden",
                          background: "linear-gradient(180deg, #FFFFFF 0%, #999999 100%)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          backgroundClip: "text",
                        }}
                      >
                        {product.name}
                      </h3>

                      {/* Price - 14px (same as name), pink, with padding below */}
                      <span 
                        className="text-[14px] font-bold leading-[14px]"
                        style={{ color: "rgba(225, 37, 144, 1)", marginBottom: "6px" }}
                      >
                        {product.price}
                      </span>
                    </div>

                    {/* Add to Cart Button - height 35px (42 * 0.83), radius 10px */}
                    <button
                      className="w-full flex items-center justify-center text-[15px] text-white transition-all hover:brightness-110"
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
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Hide scrollbar CSS */}
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
