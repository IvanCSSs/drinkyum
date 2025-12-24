"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "drinkyum_age_verified";

export default function AgeVerification() {
  const [showModal, setShowModal] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Check if already verified
    const isVerified = localStorage.getItem(STORAGE_KEY);
    
    if (!isVerified) {
      // Show modal after 2 seconds
      const timer = setTimeout(() => {
        setShowModal(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleVerify = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsExiting(true);
    setTimeout(() => setShowModal(false), 400);
  };

  const handleDecline = () => {
    // Redirect to a safe page or show message
    window.location.href = "https://www.google.com";
  };

  return (
    <AnimatePresence>
      {showModal && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: isExiting ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: isExiting ? 0 : 1 }}
            transition={{ duration: 0.4 }}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-md overflow-hidden rounded-3xl"
            style={{
              background: "linear-gradient(180deg, rgba(20, 20, 20, 0.98) 0%, rgba(8, 8, 8, 0.99) 100%)",
              border: "1px solid rgba(220, 3, 135, 0.5)",
              boxShadow: "0 0 80px rgba(220, 3, 135, 0.2), 0 25px 50px -12px rgba(0, 0, 0, 0.8)",
            }}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ 
              opacity: isExiting ? 0 : 1, 
              scale: isExiting ? 0.9 : 1, 
              y: isExiting ? 20 : 0 
            }}
            transition={{ 
              duration: 0.5, 
              ease: [0.16, 1, 0.3, 1] 
            }}
          >
            {/* Pink glow at top */}
            <div
              className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-40 rounded-full pointer-events-none"
              style={{
                background: "rgba(220, 3, 135, 0.4)",
                filter: "blur(60px)",
              }}
            />

            {/* Content */}
            <div className="relative px-8 py-10 text-center">
              {/* Logo/Icon */}
              <motion.div
                className="mb-6 flex justify-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, rgba(220, 3, 135, 0.3) 0%, rgba(220, 3, 135, 0.1) 100%)",
                    border: "1px solid rgba(220, 3, 135, 0.4)",
                  }}
                >
                  <span className="text-3xl">🔞</span>
                </div>
              </motion.div>

              {/* Title */}
              <motion.h2
                className="text-2xl md:text-3xl font-bold italic mb-3"
                style={{
                  background: "linear-gradient(180deg, #FFFFFF 0%, #999999 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                Age Verification
              </motion.h2>

              {/* Description */}
              <motion.p
                className="text-white/60 text-sm md:text-base mb-8 max-w-xs mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                You must be <span className="text-white font-semibold">21 years or older</span> to 
                enter this site. Please verify your age to continue.
              </motion.p>

              {/* Buttons */}
              <motion.div
                className="flex flex-col sm:flex-row gap-3 justify-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <button
                  onClick={handleVerify}
                  className="px-8 py-3.5 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105"
                  style={{
                    background: "linear-gradient(135deg, rgba(220, 3, 135, 1) 0%, rgba(180, 3, 110, 1) 100%)",
                    boxShadow: "0 4px 20px rgba(220, 3, 135, 0.4)",
                  }}
                >
                  Yes, I&apos;m 21+
                </button>
                
                <button
                  onClick={handleDecline}
                  className="px-8 py-3.5 rounded-xl font-medium text-white/70 transition-all duration-300 hover:text-white hover:bg-white/10"
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                >
                  No, I&apos;m Under 21
                </button>
              </motion.div>

              {/* Legal text */}
              <motion.p
                className="mt-6 text-xs text-white/40 max-w-sm mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                By entering this site, you agree to our Terms of Service and Privacy Policy.
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}



