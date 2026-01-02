"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, Search, User, ShoppingBag } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import CartDrawer from "./CartDrawer";

const navLinks = [
  { label: "Home", href: "/", hasDropdown: false },
  { label: "Shop", href: "/collections", hasDropdown: false },
  { label: "About", href: "/about", hasDropdown: false },
  { label: "Lab Results", href: "/lab-results", hasDropdown: false },
  { label: "FAQ", href: "/faq", hasDropdown: false },
  { label: "Contact", href: "/contact", hasDropdown: false },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [buttonsVisible, setButtonsVisible] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();

  // Use contexts for cart and auth
  const { items, itemCount, updateQuantity, removeItem } = useCart();
  const { isAuthenticated } = useAuth();

  const hasItems = itemCount > 0;

  // On checkout page, cart button follows same auto-hide as hamburger
  const isCheckoutPage = pathname === "/checkout";

  // Convert cart items to the format CartDrawer expects
  const cartDrawerItems = items.map(item => ({
    id: item.id,
    name: item.title,
    price: `$${(item.unit_price / 100).toFixed(2)}`,
    priceNum: item.unit_price / 100,
    image: item.thumbnail || "/images/product-1.png",
    quantity: item.quantity,
  }));

  useEffect(() => {
    const showButtons = () => {
      setButtonsVisible(true);

      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Hide after 2.8s of inactivity
      timeoutRef.current = setTimeout(() => {
        setButtonsVisible(false);
      }, 2800);
    };

    // Show on any activity
    const events = ["scroll", "touchstart", "touchmove", "mousemove", "click"];
    events.forEach((event) => {
      window.addEventListener(event, showButtons, { passive: true });
    });

    // Initial show
    showButtons();

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, showButtons);
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleUpdateQuantity = (id: string | number, quantity: number) => {
    const stringId = String(id);
    if (quantity <= 0) {
      removeItem(stringId);
    } else {
      updateQuantity(stringId, quantity);
    }
  };

  const handleRemoveItem = (id: string | number) => {
    removeItem(String(id));
  };

  return (
    <>
      {/* Mobile/Tablet: Hamburger with auto-hide */}
      <AnimatePresence>
        {buttonsVisible && (
          <motion.div
            className="lg:hidden fixed top-10 left-[5%] z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <button
              className="w-16 h-16 rounded-2xl text-white flex items-center justify-center transition-all hover:bg-white/10"
              style={{
                background: "rgba(255, 255, 255, 0.08)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                boxShadow: "0 4px 24px rgba(0, 0, 0, 0.3)",
              }}
              onClick={() => setIsOpen(true)}
            >
              <Menu size={32} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile/Tablet: Cart - always visible when has items (except on checkout), otherwise follows auto-hide */}
      <AnimatePresence>
        {(buttonsVisible || (hasItems && !isCheckoutPage)) && (
          <motion.div
            className="lg:hidden fixed top-10 right-[5%] z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <button
              onClick={() => setCartOpen(true)}
              className={`relative w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${
                hasItems
                  ? "text-yum-pink hover:bg-yum-pink/10"
                  : "text-white hover:bg-white/10"
              }`}
              style={{
                background: hasItems ? "rgba(225, 37, 143, 0.1)" : "rgba(255, 255, 255, 0.08)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: hasItems ? "1px solid rgba(225, 37, 143, 0.3)" : "1px solid rgba(255, 255, 255, 0.12)",
                boxShadow: hasItems ? "0 4px 24px rgba(225, 37, 143, 0.2)" : "0 4px 24px rgba(0, 0, 0, 0.3)",
              }}
            >
              <ShoppingBag size={28} />

              {/* Cart badge */}
              {hasItems && (
                <motion.span
                  className="absolute -top-2 -right-2 min-w-[24px] h-6 flex items-center justify-center rounded-full text-sm font-bold text-white px-1.5"
                  style={{
                    background: "linear-gradient(135deg, #E1258F 0%, #DC0387 100%)",
                    boxShadow: "0 0 12px rgba(225, 37, 143, 0.6)",
                  }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                >
                  {itemCount}
                </motion.span>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Header - Full capsule bar with auto-hide */}
      <AnimatePresence>
        {buttonsVisible && (
          <motion.header
            className="hidden lg:block fixed top-[75px] left-0 right-0 z-50 px-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className="max-w-[1200px] mx-auto flex items-center justify-between px-4 py-[18px] rounded-xl relative overflow-hidden"
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

              {/* Nav - Center */}
              <nav className="flex items-center gap-6 relative z-10">
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
                <button className="p-1.5 text-white hover:text-white/80 transition-colors">
                  <Search size={18} />
                </button>

                <Link
                  href={isAuthenticated ? "/account" : "/login"}
                  className="p-1.5 text-white hover:text-white/80 transition-colors"
                >
                  <User size={18} />
                </Link>

                <button
                  onClick={() => setCartOpen(true)}
                  className={`p-1.5 transition-colors relative ${
                    hasItems ? "text-yum-pink" : "text-white hover:text-white/80"
                  }`}
                >
                  <ShoppingBag size={18} />
                  {hasItems && (
                    <span
                      className="absolute -top-1 -right-1 min-w-[16px] h-4 flex items-center justify-center rounded-full text-[10px] font-bold text-white px-1"
                      style={{
                        background: "linear-gradient(135deg, #E1258F 0%, #DC0387 100%)",
                      }}
                    >
                      {itemCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

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
                <Link
                  href={isAuthenticated ? "/account" : "/login"}
                  onClick={() => setIsOpen(false)}
                  className="flex flex-col items-center gap-2 text-white/60 hover:text-white transition-colors"
                >
                  <User size={24} />
                  <span className="text-xs uppercase tracking-wider">Account</span>
                </Link>
                <button
                  onClick={() => { setIsOpen(false); setCartOpen(true); }}
                  className="flex flex-col items-center gap-2 text-white/60 hover:text-white transition-colors relative"
                >
                  <ShoppingBag size={24} />
                  <span className="text-xs uppercase tracking-wider">Cart</span>
                  {hasItems && (
                    <span
                      className="absolute top-0 right-2 min-w-[16px] h-4 flex items-center justify-center rounded-full text-[10px] font-bold text-white px-1"
                      style={{ background: "#E1258F" }}
                    >
                      {itemCount}
                    </span>
                  )}
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartDrawerItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
      />
    </>
  );
}
