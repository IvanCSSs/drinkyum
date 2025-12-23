"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface LogoProps {
  className?: string;
  showTagline?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: { width: 116, height: 33 },
  md: { width: 186, height: 53 },
  lg: { width: 306, height: 88 },
};

export default function Logo({ className = "", showTagline = true, size = "lg" }: LogoProps) {
  const { width, height } = sizes[size];

  return (
    <motion.div
      className={`flex flex-col items-center ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Logo from Figma */}
      <Image
        src="/images/logo.svg"
        alt="YUM - DrinkYUM"
        width={width}
        height={height}
        className="w-auto"
        style={{ height: size === "lg" ? "88px" : size === "md" ? "53px" : "33px" }}
        priority
      />

      {/* Tagline */}
      {showTagline && (
        <motion.p
          className="mt-4 text-sm md:text-base tracking-[0.3em] uppercase font-semibold italic text-gradient opacity-40"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 0.4, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          Love it. Taste it. Feel it
        </motion.p>
      )}
    </motion.div>
  );
}
