"use client";

import Link from "next/link";
import Image from "next/image";

const navLinks = [
  { number: "01", label: "Home", href: "/" },
  { number: "02", label: "Shop", href: "/collections" },
  { number: "03", label: "About us", href: "/about" },
];

export default function Footer() {
  return (
    <footer className="relative bg-[#070707] flex justify-center px-4 pt-12 lg:pt-20 pb-8">
      <div className="w-full max-w-[1075px] flex flex-col gap-12 lg:gap-[90px]">
        {/* Main Content - stack on mobile */}
        <div className="flex flex-col lg:flex-row lg:justify-between gap-10 lg:gap-0">
          {/* Left Section - Logo & Tagline */}
          <div className="flex flex-col gap-6 lg:gap-[43px] lg:w-[265px]">
            {/* Logo */}
            <Link href="/">
              <Image
                src="/images/logo.svg"
                alt="YUM - DrinkYUM"
                width={180}
                height={52}
                className="h-12 lg:h-[73px] w-auto"
              />
            </Link>

            {/* Tagline */}
            <p 
              className="text-[18px] lg:text-[25px] font-semibold italic leading-[1.2]"
              style={{
                background: "linear-gradient(180deg, #FFFFFF 0%, #999999 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              LOVE IT.TASTE IT.FEEL IT
            </p>
          </div>

          {/* Right Section - Navigation */}
          <div className="flex flex-col lg:w-[391px]">
            {navLinks.map((link, index) => (
              <Link
                key={link.label}
                href={link.href}
                className="flex items-center transition-opacity hover:opacity-80 gap-3 lg:gap-4 py-3 lg:py-[15px]"
                style={{
                  borderTop: index > 0 ? "1px solid rgba(255,255,255,0.2)" : "none",
                }}
              >
                {/* Number */}
                <span 
                  className="text-[14px] lg:text-[19px]"
                  style={{ color: "rgba(255, 255, 255, 0.6)" }}
                >
                  {link.number}
                </span>

                {/* Label */}
                <span 
                  className="text-[28px] sm:text-[36px] lg:text-[43px]"
                  style={{ color: "rgba(255, 255, 255, 0.6)" }}
                >
                  {link.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom Bar - stack on mobile */}
        <div 
          className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0 pt-4 lg:pt-5 text-center sm:text-left"
          style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
        >
          {/* Copyright */}
          <span className="text-[12px] lg:text-[13px] text-white order-3 sm:order-1">
            © Drinkyum 2025.
          </span>

          {/* Credits */}
          <span 
            className="text-[12px] lg:text-[13px] order-2"
            style={{ color: "rgba(255, 255, 255, 0.6)" }}
          >
            Designed and developed with love by{" "}
            <a 
              href="https://radicalz.io" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Radicalz.io
            </a>
          </span>

          {/* Legal Links */}
          <div className="flex items-center gap-3 lg:gap-6 order-1 sm:order-3 flex-wrap justify-center sm:justify-end">
            <Link 
              href="/shipping-returns"
              className="text-[12px] lg:text-[13px] hover:opacity-80 transition-opacity text-white"
            >
              Shipping & Returns
            </Link>
            <Link 
              href="/terms-of-service"
              className="text-[12px] lg:text-[13px] hover:opacity-80 transition-opacity text-white"
            >
              Terms of Service
            </Link>
            <Link 
              href="/privacy-policy"
              className="text-[12px] lg:text-[13px] hover:opacity-80 transition-opacity text-white"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
