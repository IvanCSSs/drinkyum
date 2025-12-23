"use client";

import { motion } from "framer-motion";
import { ShoppingCart, Sparkles } from "lucide-react";

const products = [
  {
    id: 1,
    name: "Bubble Gum",
    size: "14ml",
    price: 9.99,
    description: "Sweet nostalgia meets powerful relief",
    color: "#E1258F",
    bgGradient: "from-pink-900/20 to-transparent",
    tag: "Best Seller",
  },
  {
    id: 2,
    name: "Tropical Breeze",
    size: "14ml",
    price: 9.99,
    description: "Exotic fruit blend with smooth finish",
    color: "#E2C530",
    bgGradient: "from-yellow-900/20 to-transparent",
    tag: null,
  },
  {
    id: 3,
    name: "Bubble Gum",
    size: "30ml",
    price: 19.99,
    description: "Double the flavor, double the experience",
    color: "#E1258F",
    bgGradient: "from-pink-900/20 to-transparent",
    tag: "Popular",
  },
  {
    id: 4,
    name: "Tropical Breeze",
    size: "30ml",
    price: 19.99,
    description: "Extended tropical journey",
    color: "#E2C530",
    bgGradient: "from-yellow-900/20 to-transparent",
    tag: null,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export default function Products() {
  return (
    <section id="products" className="relative py-24 md:py-32">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-yum-dark via-yum-dark-alt to-yum-dark" />

      <div className="relative z-10 container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-yum-cyan" />
            <span className="text-sm uppercase tracking-[0.2em] text-white/60">
              Our Products
            </span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold italic text-gradient mb-4">
            Choose Your Flavor
          </h2>
          <p className="text-white/60 max-w-xl mx-auto">
            Premium kratom extract beverages available in two delicious flavors
            and convenient sizes.
          </p>
        </motion.div>

        {/* Products Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {products.map((product) => (
            <motion.div
              key={product.id}
              variants={cardVariants}
              className="group relative rounded-2xl overflow-hidden glass"
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
            >
              {/* Background gradient */}
              <div
                className={`absolute inset-0 bg-gradient-to-b ${product.bgGradient}`}
              />

              {/* Tag */}
              {product.tag && (
                <div className="absolute top-4 right-4 z-20">
                  <span
                    className="px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full"
                    style={{ backgroundColor: product.color, color: "white" }}
                  >
                    {product.tag}
                  </span>
                </div>
              )}

              {/* Content */}
              <div className="relative z-10 p-6">
                {/* Product Image Placeholder */}
                <div className="relative aspect-square mb-6 flex items-center justify-center">
                  <motion.div
                    className="w-24 h-32 rounded-lg"
                    style={{
                      background: `linear-gradient(135deg, ${product.color}40, ${product.color}10)`,
                      border: `2px solid ${product.color}40`,
                    }}
                    whileHover={{ rotate: [0, -5, 5, 0], transition: { duration: 0.4 } }}
                  >
                    <div className="h-full flex flex-col items-center justify-center">
                      <Sparkles
                        size={24}
                        style={{ color: product.color }}
                        className="mb-2"
                      />
                      <span
                        className="text-xs font-bold"
                        style={{ color: product.color }}
                      >
                        {product.size}
                      </span>
                    </div>
                  </motion.div>
                </div>

                {/* Product Info */}
                <div className="text-center">
                  <span className="text-xs text-white/40 uppercase tracking-wider">
                    {product.size}
                  </span>
                  <h3 className="text-xl font-bold text-white mb-1">
                    {product.name}
                  </h3>
                  <p className="text-sm text-white/50 mb-4">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span
                      className="text-2xl font-bold"
                      style={{ color: product.color }}
                    >
                      ${product.price}
                    </span>
                    <button
                      className="p-3 rounded-full transition-all duration-300 hover:scale-110"
                      style={{
                        backgroundColor: `${product.color}20`,
                        color: product.color,
                      }}
                    >
                      <ShoppingCart size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Hover glow effect */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at center, ${product.color}10, transparent 70%)`,
                }}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Bundle Section */}
        <motion.div
          className="mt-16 p-8 md:p-12 rounded-3xl glass text-center"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-2xl md:text-3xl font-bold text-gradient mb-4">
            Try Our Bundles & Save
          </h3>
          <p className="text-white/60 mb-6 max-w-lg mx-auto">
            Mix and match your favorites with our Twins Play (2-pack) or Triple Play (3-pack) bundles.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="btn-outline flex items-center gap-2">
              <span>Twins Play</span>
              <span className="text-yum-cyan">$17.99</span>
            </button>
            <button className="btn-primary flex items-center gap-2">
              <span>Triple Play</span>
              <span>$24.99</span>
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

