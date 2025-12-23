"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, Search, User, ShoppingBag } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const navLinks = [
  { label: "Home", href: "/", hasDropdown: false },
  { label: "Shop", href: "/shop", hasDropdown: true },
  { label: "About Us", href: "/about", hasDropdown: false },
  { label: "The Secret", href: "/secret", hasDropdown: true },
  { label: "A Better Experience", href: "/experience", hasDropdown: false },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Desktop & Mobile Header */}
      <motion.header
        className="fixed top-[75px] left-0 right-0 z-50 px-4 md:px-8"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div 
          className="max-w-[1200px] mx-auto flex items-center justify-between px-4 py-3 rounded-xl relative overflow-hidden"
          style={{
            background: "rgba(1, 6, 25, 0.05)",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Border gradient overlay */}
          <div 
            className="absolute inset-0 rounded-xl pointer-events-none"
            style={{
              padding: "1px",
              background: "radial-gradient(ellipse at top center, rgba(225, 37, 143, 0.8) 0%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.05) 100%)",
              mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              maskComposite: "xor",
              WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "xor",
            }}
          />
          
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 relative z-10">
            <Image
              src="/images/logo.svg"
              alt="YUM - DrinkYUM"
              width={100}
              height={28}
              className="h-7 w-auto"
              priority
            />
          </Link>

          {/* Desktop Nav - Center */}
          <nav className="hidden lg:flex items-center gap-6 relative z-10">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="group flex items-center gap-1 text-white hover:text-white/80 transition-colors"
              >
                <span className="text-[15px] font-normal tracking-[-0.01em]">
                  {link.label}
                </span>
                {link.hasDropdown && (
                  <ChevronDown 
                    size={14} 
                    className="opacity-60 group-hover:opacity-100 transition-opacity"
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3 relative z-10">
            {/* Search */}
            <button className="hidden md:flex p-1.5 text-white hover:text-white/80 transition-colors">
              <Search size={18} />
            </button>
            
            {/* User */}
            <button className="hidden md:flex p-1.5 text-white hover:text-white/80 transition-colors">
              <User size={18} />
            </button>
            
            {/* Cart */}
            <button className="p-1.5 text-white hover:text-white/80 transition-colors relative">
              <ShoppingBag size={18} />
            </button>
            
            {/* Mobile Menu Toggle */}
            <button
              className="lg:hidden p-1.5 text-white"
              onClick={() => setIsOpen(true)}
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-[100] bg-yum-dark/98 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex flex-col h-full p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-12">
                <Image
                  src="/images/logo.svg"
                  alt="YUM"
                  width={116}
                  height={33}
                  className="h-8 w-auto"
                />
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-white"
                >
                  <X size={28} />
                </button>
              </div>

              {/* Mobile Nav Links */}
              <nav className="flex-1 flex flex-col justify-center gap-6">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.label}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-between text-3xl font-light text-white/80 hover:text-white transition-colors"
                    >
                      <span>{link.label}</span>
                      {link.hasDropdown && (
                        <ChevronDown size={24} className="opacity-60" />
                      )}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* Mobile Actions */}
              <motion.div
                className="flex items-center justify-center gap-8 py-8 border-t border-white/10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <button className="flex flex-col items-center gap-2 text-white/60 hover:text-white transition-colors">
                  <Search size={24} />
                  <span className="text-xs uppercase tracking-wider">Search</span>
                </button>
                <button className="flex flex-col items-center gap-2 text-white/60 hover:text-white transition-colors">
                  <User size={24} />
                  <span className="text-xs uppercase tracking-wider">Account</span>
                </button>
                <button className="flex flex-col items-center gap-2 text-white/60 hover:text-white transition-colors">
                  <ShoppingBag size={24} />
                  <span className="text-xs uppercase tracking-wider">Cart</span>
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
