"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { 
  Minus, 
  Plus, 
  Trash2, 
  ShoppingBag, 
  ArrowLeft,
  Shield,
  Truck,
  RotateCcw,
  Lock,
  CreditCard,
  Tag,
  ChevronRight
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import MobileLogo from "@/components/MobileLogo";
import Footer from "@/components/Footer";

interface CartItem {
  id: number;
  name: string;
  price: string;
  priceNum: number;
  image: string;
  quantity: number;
}

type WindowWithCart = typeof window & {
  getFullCartItems?: () => CartItem[];
  updateCartQuantity?: (id: number, quantity: number) => void;
  onFullCartUpdate?: (callback: (items: CartItem[]) => void) => void;
};

const CART_STORAGE_KEY = "yum-cart";

// Shipping thresholds
const FREE_SHIPPING_THRESHOLD = 50;
const STANDARD_SHIPPING = 5.99;

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [selectedShipping, setSelectedShipping] = useState<"standard" | "express">("standard");

  // Sync with global cart state
  useEffect(() => {
    const win = window as WindowWithCart;
    let initialItems: CartItem[] = [];
    
    // Try to get from global state first
    if (win.getFullCartItems) {
      initialItems = win.getFullCartItems();
    }
    
    // Fallback: read directly from localStorage if global state is empty
    if (initialItems.length === 0) {
      try {
        const saved = localStorage.getItem(CART_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            initialItems = parsed;
          }
        }
      } catch (e) {
        console.error("Failed to load cart from localStorage:", e);
      }
    }
    
    if (initialItems.length > 0) {
      setCartItems(initialItems);
    }
    
    // Subscribe to updates from Navbar
    if (win.onFullCartUpdate) {
      win.onFullCartUpdate((items) => {
        setCartItems(items);
      });
    }
  }, []);

  const updateQuantity = useCallback((id: number, quantity: number) => {
    const win = window as WindowWithCart;
    if (win.updateCartQuantity) {
      win.updateCartQuantity(id, quantity);
    }
  }, []);

  const removeItem = useCallback((id: number) => {
    updateQuantity(id, 0);
  }, [updateQuantity]);

  const applyPromoCode = () => {
    // Mock promo code validation
    if (promoCode.toUpperCase() === "YUM20") {
      setPromoApplied(true);
      setPromoError("");
    } else if (promoCode.length > 0) {
      setPromoError("Invalid promo code");
      setPromoApplied(false);
    }
  };

  // Calculations
  const subtotal = cartItems.reduce((sum, item) => sum + item.priceNum * item.quantity, 0);
  const discount = promoApplied ? subtotal * 0.2 : 0;
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : (selectedShipping === "express" ? 12.99 : STANDARD_SHIPPING);
  const total = subtotal - discount + shippingCost;
  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  const isEmpty = cartItems.length === 0;

  return (
    <main className="min-h-screen bg-yum-dark relative">
      <MobileLogo />
      <Navbar />
      
      <section className="relative pt-28 lg:pt-36 pb-16 px-4">
        <div className="max-w-[1200px] mx-auto">
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <Link 
              href="/collections"
              className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm"
            >
              <ArrowLeft size={16} />
              <span>Continue Shopping</span>
            </Link>
          </motion.div>

          {/* Page Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <h1 
              className="text-3xl lg:text-4xl font-bold mb-2"
              style={{
                background: "linear-gradient(180deg, #FFFFFF 0%, #CCCCCC 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Your Cart
            </h1>
            <p className="text-white/50">
              {isEmpty ? "Your cart is empty" : `${cartItems.reduce((sum, item) => sum + item.quantity, 0)} items in your cart`}
            </p>
          </motion.div>

          {isEmpty ? (
            /* Empty Cart State */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div 
                className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ background: "rgba(255,255,255,0.05)" }}
              >
                <ShoppingBag size={40} className="text-white/30" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Your cart is empty</h2>
              <p className="text-white/50 mb-8">Looks like you haven&apos;t added anything yet.</p>
              <Link
                href="/collections"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:scale-[1.02]"
                style={{
                  background: "linear-gradient(135deg, #E1258F 0%, #C01F7A 100%)",
                  boxShadow: "0 4px 20px rgba(225,37,143,0.4)",
                }}
              >
                Start Shopping
                <ChevronRight size={18} />
              </Link>
            </motion.div>
          ) : (
            /* Cart Content */
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="lg:col-span-2 space-y-4"
              >
                {/* Free Shipping Progress */}
                {amountToFreeShipping > 0 && (
                  <div 
                    className="p-4 rounded-xl mb-6"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Truck size={18} className="text-yum-cyan" />
                      <span className="text-white text-sm">
                        Add <span className="font-bold text-yum-pink">${amountToFreeShipping.toFixed(2)}</span> more for free shipping!
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: "linear-gradient(90deg, #E1258F 0%, #00B8E4 100%)" }}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                )}

                {/* Items List */}
                {cartItems.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex gap-4 p-4 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    {/* Product Image */}
                    <Link href={`/products/${item.id}`} className="flex-shrink-0">
                      <div 
                        className="relative w-24 h-24 rounded-lg overflow-hidden"
                        style={{ background: "rgba(20,20,20,0.5)" }}
                      >
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </Link>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <Link href={`/products/${item.id}`}>
                        <h3 className="text-white font-medium mb-1 hover:text-yum-pink transition-colors line-clamp-2">
                          {item.name}
                        </h3>
                      </Link>
                      <p className="text-yum-pink font-bold mb-3">{item.price}</p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-4">
                        <div 
                          className="flex items-center rounded-lg overflow-hidden"
                          style={{ border: "1px solid rgba(255,255,255,0.15)" }}
                        >
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-9 h-9 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-10 text-center text-white font-medium text-sm">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-9 h-9 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
                          >
                            <Plus size={16} />
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-white/40 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    {/* Line Total */}
                    <div className="text-right hidden sm:block">
                      <p className="text-white font-bold">
                        ${(item.priceNum * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Order Summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="lg:col-span-1"
              >
                <div 
                  className="sticky top-32 rounded-2xl p-6"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>

                  {/* Promo Code */}
                  <div className="mb-6">
                    <label className="text-white/60 text-sm mb-2 block">Promo Code</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                        <input
                          type="text"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          placeholder="Enter code"
                          className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-yum-pink transition-colors text-sm"
                        />
                      </div>
                      <button
                        onClick={applyPromoCode}
                        className="px-4 py-2.5 rounded-lg bg-white/10 text-white text-sm font-medium hover:bg-white/15 transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                    {promoApplied && (
                      <p className="text-green-400 text-xs mt-2 flex items-center gap-1">
                        <Shield size={12} /> YUM20 applied - 20% off!
                      </p>
                    )}
                    {promoError && (
                      <p className="text-red-400 text-xs mt-2">{promoError}</p>
                    )}
                  </div>

                  {/* Shipping Options */}
                  <div className="mb-6">
                    <label className="text-white/60 text-sm mb-2 block">Shipping</label>
                    <div className="space-y-2">
                      <button
                        onClick={() => setSelectedShipping("standard")}
                        className={`w-full p-3 rounded-lg text-left flex items-center justify-between transition-all ${
                          selectedShipping === "standard" ? "ring-2 ring-yum-pink bg-yum-pink/10" : "bg-white/5 hover:bg-white/10"
                        }`}
                      >
                        <div>
                          <p className="text-white text-sm font-medium">Standard (5-7 days)</p>
                          <p className="text-white/50 text-xs">
                            {subtotal >= FREE_SHIPPING_THRESHOLD ? "Free!" : `$${STANDARD_SHIPPING.toFixed(2)}`}
                          </p>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          selectedShipping === "standard" ? "border-yum-pink" : "border-white/30"
                        }`}>
                          {selectedShipping === "standard" && <div className="w-2 h-2 rounded-full bg-yum-pink" />}
                        </div>
                      </button>
                      <button
                        onClick={() => setSelectedShipping("express")}
                        className={`w-full p-3 rounded-lg text-left flex items-center justify-between transition-all ${
                          selectedShipping === "express" ? "ring-2 ring-yum-pink bg-yum-pink/10" : "bg-white/5 hover:bg-white/10"
                        }`}
                      >
                        <div>
                          <p className="text-white text-sm font-medium">Express (2-3 days)</p>
                          <p className="text-white/50 text-xs">$12.99</p>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          selectedShipping === "express" ? "border-yum-pink" : "border-white/30"
                        }`}>
                          {selectedShipping === "express" && <div className="w-2 h-2 rounded-full bg-yum-pink" />}
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Totals */}
                  <div className="space-y-3 py-4 border-t border-white/10">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Subtotal</span>
                      <span className="text-white">${subtotal.toFixed(2)}</span>
                    </div>
                    {promoApplied && (
                      <div className="flex justify-between text-sm">
                        <span className="text-green-400">Discount (20%)</span>
                        <span className="text-green-400">-${discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Shipping</span>
                      <span className="text-white">
                        {shippingCost === 0 ? <span className="text-green-400">Free</span> : `$${shippingCost.toFixed(2)}`}
                      </span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-white/10">
                      <span className="text-white font-semibold">Total</span>
                      <span className="text-white text-xl font-bold">${total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <Link
                    href="/checkout"
                    className="w-full py-4 rounded-xl font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98] mt-4 block text-center"
                    style={{
                      background: "linear-gradient(135deg, #E1258F 0%, #C01F7A 100%)",
                      boxShadow: "0 4px 20px rgba(225,37,143,0.4)",
                    }}
                  >
                    Proceed to Checkout
                  </Link>

                  {/* Trust Badges */}
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 text-white/50 text-xs">
                        <Lock size={14} className="text-green-400" />
                        <span>Secure Checkout</span>
                      </div>
                      <div className="flex items-center gap-2 text-white/50 text-xs">
                        <Shield size={14} className="text-yum-cyan" />
                        <span>Lab Tested</span>
                      </div>
                      <div className="flex items-center gap-2 text-white/50 text-xs">
                        <Truck size={14} className="text-yum-gold" />
                        <span>Fast Shipping</span>
                      </div>
                      <div className="flex items-center gap-2 text-white/50 text-xs">
                        <RotateCcw size={14} className="text-yum-pink" />
                        <span>Easy Returns</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Methods */}
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="flex items-center justify-center gap-2 text-white/30">
                      <CreditCard size={20} />
                      <span className="text-xs">Visa, Mastercard, Amex, PayPal</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}

