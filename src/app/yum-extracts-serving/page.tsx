"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileLogo from "@/components/MobileLogo";

const sizes = {
  "14ml": {
    ml: 14,
    spoons: 27,
    capsules: 30,
    image: "/images/product-1.png",
  },
  "30ml": {
    ml: 30,
    spoons: 58,
    capsules: 64,
    image: "/images/product-1.png",
  },
};

export default function YumExtractsServingPage() {
  const [selectedSize, setSelectedSize] = useState<"14ml" | "30ml">("14ml");
  const data = sizes[selectedSize];

  return (
    <main className="min-h-screen bg-yum-dark">
      <Navbar />
      <MobileLogo />

      {/* Hero Banner */}
      <section className="relative w-full h-48 md:h-64 lg:h-80 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-yum-cyan/30 to-yum-pink/30" />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-bold text-white text-center"
          >
            YUM Extracts Serving Guide
          </motion.h1>
        </div>
      </section>

      {/* Product Section */}
      <section className="max-w-6xl mx-auto px-4 py-12 md:py-20">
        <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-center">
          {/* Left: Product Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex-1 flex justify-center"
          >
            <div className="relative w-64 h-96 md:w-80 md:h-[480px] bg-gradient-to-b from-yum-cyan/20 to-transparent rounded-3xl flex items-center justify-center p-8">
              <Image
                src={data.image}
                alt="YUM Kratom Extract Bubble Gum"
                width={300}
                height={450}
                className="object-contain drop-shadow-2xl transition-all duration-300"
              />
            </div>
          </motion.div>

          {/* Right: Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex-1"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
              YUM Delicious Kratom Extract<br />
              <span className="text-yum-cyan">Bubble Gum</span>
            </h2>

            {/* Size Toggle */}
            <div className="flex gap-3 mb-10">
              {(["14ml", "30ml"] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-6 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
                    selectedSize === size
                      ? "bg-yum-cyan text-white shadow-lg shadow-yum-cyan/30"
                      : "bg-white/10 text-gray-300 hover:bg-white/20"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>

            {/* Dose Info */}
            <div className="space-y-8 mb-10">
              {/* Spoons */}
              <div className="flex items-start gap-6">
                <div className="flex flex-col items-center min-w-[80px]">
                  <span className="text-5xl md:text-6xl font-extrabold text-white leading-none">
                    {data.spoons}
                  </span>
                  <span className="text-sm font-bold text-gray-400 mt-1">
                    Spoons
                  </span>
                </div>
                <p className="text-gray-400 text-base leading-relaxed pt-2">
                  At YUM, we start with the highest quality kratom and test throughout
                  the manufacturing process to ensure we deliver the premium liquid
                  kratom experience.
                </p>
              </div>

              {/* Capsules */}
              <div className="flex items-start gap-6">
                <div className="flex flex-col items-center min-w-[80px]">
                  <span className="text-5xl md:text-6xl font-extrabold text-white leading-none">
                    {data.capsules}
                  </span>
                  <span className="text-sm font-bold text-gray-400 mt-1">
                    Capsules
                  </span>
                </div>
                <p className="text-gray-400 text-base leading-relaxed pt-2">
                  Tested throughout the manufacturing process to ensure we deliver
                  the premium experience our customers have come to expect.
                </p>
              </div>
            </div>

            {/* Dosage Table */}
            <div className="rounded-xl overflow-hidden border border-white/10">
              <table className="w-full">
                <thead>
                  <tr className="bg-yum-cyan/20">
                    <th className="px-6 py-3 text-center text-sm font-bold text-yum-cyan">
                      YUM ml
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-bold text-yum-cyan">
                      Spoons
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-bold text-yum-cyan">
                      Capsules
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white/5">
                    <td className="px-6 py-4 text-center text-white font-semibold">
                      {data.ml}
                    </td>
                    <td className="px-6 py-4 text-center text-white font-semibold">
                      {data.spoons}
                    </td>
                    <td className="px-6 py-4 text-center text-white font-semibold">
                      {data.capsules}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FDA Disclaimer */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <p className="text-xs text-gray-500 leading-relaxed text-center">
            <strong className="text-gray-400">FOOD AND DRUG ADMINISTRATION (FDA) DISCLOSURE</strong>
            <br />
            These statements have not been evaluated by the Food and Drug Administration.
            This product is not intended to diagnose, treat, cure, or prevent any disease.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
