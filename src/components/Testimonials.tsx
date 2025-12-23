"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

const testimonials = [
  {
    id: 1,
    quote:
      "Been bartending for 10 years. I've never had a Mocktail that tastes this good and delivers a significant kratom experience without the bitter taste.",
    author: "Mike R.",
    role: "Professional Bartender",
  },
  {
    id: 2,
    quote:
      "Finally, a kratom product I actually look forward to taking. The Tropical Breeze flavor is incredible - tastes like a vacation in a bottle!",
    author: "Sarah K.",
    role: "Wellness Enthusiast",
  },
  {
    id: 3,
    quote:
      "YUM changed the game for me. The convenience of the 14ml bottles is perfect for my active lifestyle. Fits right in my gym bag.",
    author: "James T.",
    role: "Fitness Coach",
  },
  {
    id: 4,
    quote:
      "I was skeptical at first, but after trying the Bubble Gum flavor, I'm a convert. It's like they figured out the secret formula.",
    author: "Lisa M.",
    role: "Repeat Customer",
  },
];

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-yum-pink/5 blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-yum-cyan" />
            <span className="text-sm uppercase tracking-[0.2em] text-white/60">
              Testimonials
            </span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold italic text-gradient">
            The Proof Is In<br />
            <span className="text-yum-pink">The Bottle</span>
          </h2>
          <p className="text-white/60 max-w-md mt-4">
            15,000+ activated users can&apos;t be wrong. See why YUM is the secret
            weapon you&apos;ve been missing.
          </p>
        </motion.div>

        {/* Testimonial Carousel */}
        <div className="flex flex-col lg:flex-row items-start gap-12">
          {/* Navigation */}
          <div className="flex lg:flex-col gap-4">
            <button
              onClick={prev}
              className="p-4 rounded-xl glass opacity-50 hover:opacity-100 transition-all duration-300 hover:border-white/20"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={next}
              className="p-4 rounded-xl glass hover:border-white/20 transition-all duration-300"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          {/* Testimonial Content */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.4 }}
              >
                {/* Quote Icon */}
                <Quote
                  size={52}
                  className="text-yum-pink mb-6"
                  strokeWidth={1}
                />

                {/* Quote Text */}
                <blockquote className="text-2xl md:text-4xl lg:text-4xl text-white/80 leading-relaxed mb-8 font-light">
                  {testimonials[currentIndex].quote}
                </blockquote>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yum-pink to-yum-cyan flex items-center justify-center text-lg font-bold">
                    {testimonials[currentIndex].author.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-white uppercase tracking-wider">
                      - {testimonials[currentIndex].author}
                    </p>
                    <p className="text-white/50 text-sm">
                      {testimonials[currentIndex].role}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Dots Indicator */}
            <div className="flex gap-2 mt-8">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i === currentIndex
                      ? "w-8 bg-yum-pink"
                      : "bg-white/20 hover:bg-white/40"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

