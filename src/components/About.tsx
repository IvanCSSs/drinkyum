"use client";

import { motion } from "framer-motion";
import { Droplets, Leaf, Zap, Heart } from "lucide-react";

const features = [
  {
    icon: Droplets,
    title: "Premium Extract",
    description: "High-quality kratom extract crafted for maximum potency and smooth experience.",
    color: "#00B8E4",
  },
  {
    icon: Leaf,
    title: "All Natural",
    description: "Made with carefully sourced, natural ingredients you can trust.",
    color: "#4CAF50",
  },
  {
    icon: Zap,
    title: "Fast Acting",
    description: "Feel the difference quickly with our optimized liquid formula.",
    color: "#E2C530",
  },
  {
    icon: Heart,
    title: "Great Taste",
    description: "No bitter aftertaste - just delicious flavors you'll actually enjoy.",
    color: "#E1258F",
  },
];

export default function About() {
  return (
    <section id="about" className="relative py-24 md:py-32">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-yum-cyan" />
              <span className="text-sm uppercase tracking-[0.2em] text-white/60">
                Why YUM?
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold italic text-gradient mb-6 leading-tight">
              A Better Experience<br />
              <span className="text-yum-cyan">Every Time</span>
            </h2>

            <p className="text-lg text-white/60 mb-8 leading-relaxed">
              We set out to create the perfect kratom beverage - one that delivers
              powerful results without compromising on taste. After countless
              iterations and taste tests, YUM was born.
            </p>

            <p className="text-white/60 mb-8">
              Our proprietary blend ensures consistent potency in every bottle,
              while our signature flavors mask any bitterness for a truly
              enjoyable experience.
            </p>

            <div className="flex flex-wrap gap-4">
              <div className="px-4 py-2 rounded-full glass">
                <span className="text-yum-gold font-semibold">15,000+</span>
                <span className="text-white/60 ml-2">Happy Customers</span>
              </div>
              <div className="px-4 py-2 rounded-full glass">
                <span className="text-yum-pink font-semibold">4.9★</span>
                <span className="text-white/60 ml-2">Average Rating</span>
              </div>
            </div>
          </motion.div>

          {/* Right Content - Features Grid */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 gap-6"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="p-6 rounded-2xl glass group hover:border-white/20 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: `${feature.color}20` }}
                >
                  <feature.icon size={24} style={{ color: feature.color }} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-white/50 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Bottom Stats Bar */}
        <motion.div
          className="mt-20 py-8 px-8 rounded-2xl glass grid grid-cols-2 md:grid-cols-4 gap-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-bold text-yum-pink mb-1">2</p>
            <p className="text-white/50 text-sm">Delicious Flavors</p>
          </div>
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-bold text-yum-cyan mb-1">2</p>
            <p className="text-white/50 text-sm">Convenient Sizes</p>
          </div>
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-bold text-yum-gold mb-1">0</p>
            <p className="text-white/50 text-sm">Bitter Aftertaste</p>
          </div>
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-bold text-yum-pink-light mb-1">∞</p>
            <p className="text-white/50 text-sm">Possibilities</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

