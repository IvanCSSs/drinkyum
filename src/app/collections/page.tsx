"use client";

import { motion, useMotionValue, useSpring, useInView } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import MobileLogo from "@/components/MobileLogo";
import Footer from "@/components/Footer";
import { useRef, useState, useEffect, MouseEvent } from "react";
import { getCollections, type Collection } from "@/lib/products";

// Fallback collection styling
const collectionStyles: Record<string, {
  accentColor: string;
  image: string;
}> = {
  "bestsellers": { accentColor: "#E1258F", image: "/images/product-1.png" },
  "tropical-collection": { accentColor: "#00B8E4", image: "/images/product-2.png" },
  "bundles": { accentColor: "#E2C530", image: "/images/product-3.png" },
  "new-arrivals": { accentColor: "#E1258F", image: "/images/product-1.png" },
  "starter-packs": { accentColor: "#00B8E4", image: "/images/product-2.png" },
  "subscribe-save": { accentColor: "#E2C530", image: "/images/product-3.png" },
};

// Default collections when API is not available
const defaultCollections = [
  {
    id: "bestsellers",
    handle: "bestsellers",
    title: "Bestsellers",
    metadata: { description: "Our most loved kratom extracts, tried and trusted by thousands." },
  },
  {
    id: "tropical-collection",
    handle: "tropical-collection",
    title: "Tropical Collection",
    metadata: { description: "Escape to paradise with our refreshing tropical-flavored extracts." },
  },
  {
    id: "bundles",
    handle: "bundles",
    title: "Value Bundles",
    metadata: { description: "Maximum savings on our premium multi-packs and bundles." },
  },
  {
    id: "new-arrivals",
    handle: "new-arrivals",
    title: "New Arrivals",
    metadata: { description: "Fresh drops and limited editions you don't want to miss." },
  },
  {
    id: "starter-packs",
    handle: "starter-packs",
    title: "Starter Packs",
    metadata: { description: "Perfect for first-timers. Discover your favorite YUM flavor." },
  },
  {
    id: "subscribe-save",
    handle: "subscribe-save",
    title: "Subscribe & Save",
    metadata: { description: "Never run out. Get 20% off with monthly deliveries." },
  },
];

// Collection Card with Magnetic Effect & Scroll Reveal
interface CollectionCardProps {
  collection: Collection;
  index: number;
}

function CollectionCard({ collection, index }: CollectionCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: "-100px" });

  // Magnetic effect values
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springConfig = { damping: 20, stiffness: 300 };
  const xSpring = useSpring(x, springConfig);
  const ySpring = useSpring(y, springConfig);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;
    x.set(distanceX * 0.05);
    y.set(distanceY * 0.05);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const style = collectionStyles[collection.handle] || { accentColor: "#E1258F", image: "/images/product-1.png" };
  const description = (collection.metadata?.description as string) || "Explore our curated selection";
  const productCount = (collection.metadata?.product_count as number) || 0;

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView
        ? { opacity: 1, y: 0, filter: "blur(0px) grayscale(0)" }
        : { opacity: 0, y: 30, filter: "blur(8px) grayscale(1)" }
      }
      transition={{ duration: 0.8, delay: index * 0.1, ease: "easeOut" }}
      style={{ x: xSpring, y: ySpring }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
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
              background: `radial-gradient(circle at center, ${style.accentColor}15 0%, transparent 70%)`,
            }}
          />

          {/* Image Container */}
          <div className="relative h-48 lg:h-56 overflow-hidden">
            <Image
              src={style.image}
              alt={collection.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />

            {/* Product count badge */}
            {productCount > 0 && (
              <div
                className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium text-white"
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                }}
              >
                {productCount} products
              </div>
            )}
          </div>

          {/* Content */}
          <div className="relative p-6">
            {/* Accent line */}
            <div
              className="w-12 h-1 rounded-full mb-4 transition-all duration-300 group-hover:w-20"
              style={{ background: style.accentColor }}
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
              {description}
            </p>

            {/* Shop Now link */}
            <div
              className="inline-flex items-center gap-2 text-sm font-medium transition-all duration-300 group-hover:gap-3"
              style={{ color: style.accentColor }}
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
              boxShadow: `inset 0 0 0 1px ${style.accentColor}40`,
            }}
          />
        </div>
      </Link>
    </motion.div>
  );
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCollections() {
      try {
        setIsLoading(true);
        const data = await getCollections();
        if (data.collections && data.collections.length > 0) {
          setCollections(data.collections);
        } else {
          // Use default collections if API returns empty
          setCollections(defaultCollections as Collection[]);
        }
      } catch (err) {
        console.error("Failed to load collections:", err);
        // Use default collections on error
        setCollections(defaultCollections as Collection[]);
      } finally {
        setIsLoading(false);
      }
    }

    loadCollections();
  }, []);

  return (
    <main className="min-h-screen bg-yum-dark relative">
      <MobileLogo />
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

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-yum-pink border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Collections Grid */}
          {!isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {collections.map((collection, index) => (
                <CollectionCard
                  key={collection.id}
                  collection={collection}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
