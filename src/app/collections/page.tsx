"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Placeholder collections data - will be replaced with Medusa data
const collections = [
  {
    id: 1,
    handle: "bestsellers",
    title: "Bestsellers",
    description: "Our most loved kratom extracts, tried and trusted by thousands.",
    image: "/images/product-1.png",
    productCount: 6,
    accentColor: "#E1258F",
  },
  {
    id: 2,
    handle: "tropical-collection",
    title: "Tropical Collection",
    description: "Escape to paradise with our refreshing tropical-flavored extracts.",
    image: "/images/product-2.png",
    productCount: 4,
    accentColor: "#00B8E4",
  },
  {
    id: 3,
    handle: "bundles",
    title: "Value Bundles",
    description: "Maximum savings on our premium multi-packs and bundles.",
    image: "/images/product-3.png",
    productCount: 3,
    accentColor: "#E2C530",
  },
  {
    id: 4,
    handle: "new-arrivals",
    title: "New Arrivals",
    description: "Fresh drops and limited editions you don't want to miss.",
    image: "/images/product-1.png",
    productCount: 5,
    accentColor: "#E1258F",
  },
  {
    id: 5,
    handle: "starter-packs",
    title: "Starter Packs",
    description: "Perfect for first-timers. Discover your favorite YUM flavor.",
    image: "/images/product-2.png",
    productCount: 2,
    accentColor: "#00B8E4",
  },
  {
    id: 6,
    handle: "subscribe-save",
    title: "Subscribe & Save",
    description: "Never run out. Get 20% off with monthly deliveries.",
    image: "/images/product-3.png",
    productCount: 8,
    accentColor: "#E2C530",
  },
];

export default function CollectionsPage() {
  return (
    <main className="min-h-screen bg-yum-dark">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 lg:pt-48 pb-16 lg:pb-24 px-4">
        {/* Background gradient */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[400px] pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at center top, rgba(225, 37, 143, 0.15) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />

        <div className="relative max-w-[1200px] mx-auto">
          {/* Page Title */}
          <motion.div
            className="text-center mb-12 lg:mb-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 
              className="text-4xl sm:text-5xl lg:text-6xl font-bold italic mb-4"
              style={{
                background: "linear-gradient(180deg, #FFFFFF 0%, #999999 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Collections
            </h1>
            <p className="text-white/60 text-lg max-w-md mx-auto">
              Explore our curated collections of premium kratom extracts
            </p>
          </motion.div>

          {/* Collections Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {collections.map((collection, index) => (
              <motion.div
                key={collection.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Link href={`/collections/${collection.handle}`}>
                  <div 
                    className="group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02]"
                    style={{
                      background: "linear-gradient(180deg, rgba(20, 20, 20, 0.6) 0%, rgba(10, 10, 10, 0.9) 100%)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                    }}
                  >
                    {/* Hover glow effect */}
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                      style={{
                        background: `radial-gradient(circle at center, ${collection.accentColor}15 0%, transparent 70%)`,
                      }}
                    />

                    {/* Image Container */}
                    <div className="relative h-48 lg:h-56 overflow-hidden">
                      <Image
                        src={collection.image}
                        alt={collection.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      {/* Gradient overlay */}
                      <div 
                        className="absolute inset-0"
                        style={{
                          background: "linear-gradient(180deg, transparent 0%, rgba(10, 10, 10, 0.95) 100%)",
                        }}
                      />
                      
                      {/* Product count badge */}
                      <div 
                        className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium text-white"
                        style={{
                          background: "rgba(255, 255, 255, 0.1)",
                          backdropFilter: "blur(10px)",
                          border: "1px solid rgba(255, 255, 255, 0.15)",
                        }}
                      >
                        {collection.productCount} products
                      </div>
                    </div>

                    {/* Content */}
                    <div className="relative p-6">
                      {/* Accent line */}
                      <div 
                        className="w-12 h-1 rounded-full mb-4 transition-all duration-300 group-hover:w-20"
                        style={{ background: collection.accentColor }}
                      />
                      
                      <h2 
                        className="text-xl lg:text-2xl font-bold mb-2 transition-colors duration-300"
                        style={{
                          background: "linear-gradient(180deg, #FFFFFF 0%, #CCCCCC 100%)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          backgroundClip: "text",
                        }}
                      >
                        {collection.title}
                      </h2>
                      
                      <p className="text-white/50 text-sm leading-relaxed mb-4">
                        {collection.description}
                      </p>

                      {/* Shop Now link */}
                      <div 
                        className="inline-flex items-center gap-2 text-sm font-medium transition-all duration-300 group-hover:gap-3"
                        style={{ color: collection.accentColor }}
                      >
                        <span>Shop Now</span>
                        <svg 
                          width="16" 
                          height="16" 
                          viewBox="0 0 16 16" 
                          fill="none"
                          className="transition-transform duration-300 group-hover:translate-x-1"
                        >
                          <path 
                            d="M3 8H13M13 8L9 4M13 8L9 12" 
                            stroke="currentColor" 
                            strokeWidth="1.5" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Border glow on hover */}
                    <div 
                      className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                      style={{
                        boxShadow: `inset 0 0 0 1px ${collection.accentColor}40`,
                      }}
                    />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

