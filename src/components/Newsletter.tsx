"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);
      setEmail("");
      setTimeout(() => setIsSubmitted(false), 3000);
    }
  };

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Pink glow effect */}
      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[900px] h-[300px] rounded-full"
        style={{
          background: "radial-gradient(ellipse, rgba(225, 37, 143, 0.25) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.5, 0.7, 0.5],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="relative z-10 container mx-auto px-6">
        <motion.div
          className="max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Pre-title */}
          <motion.span
            className="inline-block text-yum-pink uppercase text-sm tracking-[0.3em] mb-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            By the way
          </motion.span>

          {/* Title */}
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold italic text-gradient mb-8 leading-tight">
            Subscribe to our newsletter for a{" "}
            <span className="relative inline-block">
              mystery discount
              <motion.span
                className="absolute -top-2 -right-6"
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles size={20} className="text-yum-gold" />
              </motion.span>
            </span>
          </h2>

          {/* Form */}
          <form onSubmit={handleSubmit} className="relative max-w-lg mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-6 py-4 rounded-xl bg-transparent border border-white/30 text-white placeholder:text-white/40 focus:outline-none focus:border-yum-pink transition-colors"
                  required
                />
              </div>
              <motion.button
                type="submit"
                className="btn-primary flex items-center justify-center gap-2 whitespace-nowrap"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isSubmitted ? (
                  <span>Check your inbox! 🎉</span>
                ) : (
                  <>
                    <span>Subscribe</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </motion.button>
            </div>

            {/* Privacy note */}
            <p className="text-white/40 text-sm mt-4">
              We respect your privacy. Unsubscribe anytime.
            </p>
          </form>

          {/* Discount hint */}
          <motion.div
            className="mt-12 inline-flex items-center gap-3 px-6 py-3 rounded-full glass"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <span className="text-yum-gold font-semibold">💰 Hint:</span>
            <span className="text-white/70">
              Our mystery discounts range from 10% to 50% off!
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

