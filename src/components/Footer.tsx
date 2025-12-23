"use client";

import Link from "next/link";
import Image from "next/image";

const navLinks = [
  { number: "01", label: "Home", href: "/" },
  { number: "02", label: "Shop", href: "/shop" },
  { number: "03", label: "About us", href: "/about" },
];

export default function Footer() {
  return (
    <footer className="relative bg-[#070707] flex justify-center px-4 pt-20 pb-8">
      <div 
        className="w-full flex flex-col"
        style={{ maxWidth: "1075px", gap: "90px" }}
      >
        {/* Main Content */}
        <div className="flex justify-between">
          {/* Left Section - Logo & Tagline */}
          <div className="flex flex-col" style={{ gap: "43px", width: "265px" }}>
            {/* Logo */}
            <Link href="/">
              <Image
                src="/images/logo.svg"
                alt="YUM - DrinkYUM"
                width={254}
                height={73}
                className="h-[73px] w-auto"
              />
            </Link>

            {/* Tagline */}
            <p 
              className="text-[25px] font-semibold italic leading-[25px]"
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
          <div className="flex flex-col" style={{ width: "391px" }}>
            {navLinks.map((link, index) => (
              <Link
                key={link.label}
                href={link.href}
                className="flex items-center transition-opacity hover:opacity-80"
                style={{
                  gap: "16px",
                  padding: "15px 0",
                  borderTop: index > 0 ? "1px solid rgba(255,255,255,0.2)" : "none",
                }}
              >
                {/* Number */}
                <span 
                  className="text-[19px]"
                  style={{ color: "rgba(255, 255, 255, 0.6)" }}
                >
                  {link.number}
                </span>

                {/* Label */}
                <span 
                  className="text-[43px]"
                  style={{ color: "rgba(255, 255, 255, 0.6)" }}
                >
                  {link.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div 
          className="flex items-center justify-between"
          style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "20px" }}
        >
          {/* Copyright */}
          <span 
            className="text-[13px]"
            style={{ color: "rgba(255, 255, 255, 1)" }}
          >
            © Drinkyum 2025.
          </span>

          {/* Credits */}
          <span 
            className="text-[13px]"
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
          <div className="flex items-center" style={{ gap: "24px" }}>
            <Link 
              href="/terms"
              className="text-[13px] hover:opacity-80 transition-opacity"
              style={{ color: "rgba(255, 255, 255, 1)" }}
            >
              Terms & Conditions
            </Link>
            <Link 
              href="/privacy"
              className="text-[13px] hover:opacity-80 transition-opacity"
              style={{ color: "rgba(255, 255, 255, 1)" }}
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
