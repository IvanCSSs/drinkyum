"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const testimonials = [
  {
    quote: "Been bartending for 10 years. I've never had a Mocktail that taste this good and delivers a significant kratom experience without the bitter taste.",
    author: "Kratom man",
  },
  {
    quote: "YUM changed everything for me. Clean energy, no crash, and the taste is actually incredible. This is the future of kratom.",
    author: "Sarah K.",
  },
  {
    quote: "I was skeptical at first, but after trying YUM I'm never going back. The 75% extract is no joke - pure performance in a bottle.",
    author: "Mike T.",
  },
];

export default function FAQ() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="relative bg-[#070707] flex justify-center px-4 py-12 lg:py-16">
      <div className="w-full max-w-[1053px] flex flex-col lg:flex-row gap-8 lg:gap-[100px]">
        {/* Left Side */}
        <div className="flex flex-col gap-4 lg:gap-[23px] lg:w-[421px]">
          {/* Label with cyan dot */}
          <div className="flex items-center gap-[6px]">
            <div 
              className="w-1 h-1 rounded-full"
              style={{ background: "rgba(0, 184, 228, 1)" }}
            />
            <span 
              className="text-[14px] lg:text-[17px] font-light uppercase"
              style={{
                background: "linear-gradient(180deg, #FFFFFF 0%, #999999 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              testimonials
            </span>
          </div>

          {/* Title and Subtitle */}
          <div className="flex flex-col gap-3 lg:gap-4">
            <h2 
              className="text-[32px] sm:text-[42px] lg:text-[58px] font-bold italic leading-[1.1]"
              style={{
                background: "linear-gradient(180deg, #FFFFFF 0%, #999999 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              THE PROOF IS IN THE BOTTLE
            </h2>
            <p 
              className="text-[13px] lg:text-[14px] leading-[1.4] max-w-[334px]"
              style={{
                background: "linear-gradient(180deg, #FFFFFF 0%, #999999 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              15,000+ activated users can&apos;t be wrong. See why YUM is the secret weapon you&apos;ve been missing.
            </p>
          </div>

          {/* Navigation Arrows */}
          <div className="flex gap-3 lg:gap-[15px] mt-4 lg:mt-auto">
            <button
              onClick={prevTestimonial}
              className="flex items-center justify-center transition-opacity hover:opacity-80 w-10 h-10 lg:w-[37px] lg:h-[37px] rounded-[10px]"
              style={{
                border: "1px solid rgba(153, 153, 153, 1)",
                background: "transparent",
              }}
            >
              <svg width="10" height="18" viewBox="0 0 10 18" fill="none">
                <path d="M9 1L1 9L9 17" stroke="rgba(153,153,153,1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <button
              onClick={nextTestimonial}
              className="flex items-center justify-center transition-opacity hover:opacity-80 w-10 h-10 lg:w-[37px] lg:h-[37px] rounded-[10px]"
              style={{
                border: "1px solid rgba(153, 153, 153, 1)",
                background: "transparent",
              }}
            >
              <svg width="10" height="18" viewBox="0 0 10 18" fill="none">
                <path d="M1 1L9 9L1 17" stroke="rgba(153,153,153,1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Right Side - Testimonial */}
        <div className="flex flex-col lg:w-[531px]">
          {/* Quote Mark */}
          <div 
            className="text-[50px] lg:text-[80px] font-bold leading-none h-[30px] lg:h-[47px] overflow-visible"
            style={{ color: "rgba(225, 37, 144, 1)" }}
          >
            &ldquo;
          </div>

          {/* Testimonial Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              className="flex flex-col gap-3 lg:gap-[15px] mt-4 lg:mt-5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Quote Text */}
              <p 
                className="text-[20px] sm:text-[24px] lg:text-[30px] leading-[1.4] lg:leading-[44px]"
                style={{
                  background: "linear-gradient(180deg, #FFFFFF 0%, #999999 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {testimonials[currentIndex].quote}
              </p>

              {/* Author */}
              <span 
                className="text-[18px] lg:text-[25px] font-semibold leading-[1.4] uppercase"
                style={{ color: "rgba(255, 255, 255, 0.8)" }}
              >
                - {testimonials[currentIndex].author}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
