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
import { useState } from "react";
import Navbar from "@/components/Navbar";
import MobileLogo from "@/components/MobileLogo";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";

// Shipping thresholds
const FREE_SHIPPING_THRESHOLD = 50;
const STANDARD_SHIPPING = 5.99;

export default function CartPage() {
  const { items, itemCount, subtotal, updateQuantity, removeItem, isLoading } = useCart();
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [selectedShipping, setSelectedShipping] = useState<"standard" | "express">("standard");

  const handleUpdateQuantity = async (lineItemId: string, quantity: number) => {
    try {
      await updateQuantity(lineItemId, quantity);
    } catch (err) {
      console.error("Failed to update quantity:", err);
    }
  };

  const handleRemoveItem = async (lineItemId: string) => {
    try {
      await removeItem(lineItemId);
    } catch (err) {
      console.error("Failed to remove item:", err);
    }
  };

  const applyPromoCode = () => {
    if (promoCode.toUpperCase() === "YUM20") {
      setPromoApplied(true);
      setPromoError("");
    } else if (promoCode.length > 0) {
      setPromoError("Invalid promo code");
      setPromoApplied(false);
    }
  };

  // Convert subtotal from cents to dollars
  const subtotalDollars = subtotal / 100;
  const discount = promoApplied ? subtotalDollars * 0.2 : 0;
  const shippingCost = subtotalDollars >= FREE_SHIPPING_THRESHOLD ? 0 : (selectedShipping === "express" ? 12.99 : STANDARD_SHIPPING);
  const total = subtotalDollars - discount + shippingCost;
  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotalDollars);

  const isEmpty = items.length === 0;

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
                background: "linear-gradient(180deg, #FFFFFF 0%, #999999 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Your Cart
            </h1>
            <p className="text-white/50">
              {isLoading ? "Loading..." : `${itemCount} ${itemCount === 1 ? "item" : "items"}`}
            </p>
          </motion.div>

          {isEmpty && !isLoading ? (
            /* Empty Cart State */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ background: "rgba(255, 255, 255, 0.05)" }}
              >
                <ShoppingBag size={40} className="text-white/30" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Your cart is empty</h2>
              <p className="text-white/50 mb-8 max-w-md mx-auto">
                Looks like you haven&apos;t added any YUM to your cart yet. Check out our bestsellers!
              </p>
              <Link
                href="/collections/bestsellers"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-white font-semibold transition-all hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, #E1258F 0%, #C01F7A 100%)",
                  boxShadow: "0 4px 20px rgba(225, 37, 143, 0.4)",
                }}
              >
                Shop Bestsellers
                <ChevronRight size={18} />
              </Link>
            </motion.div>
          ) : (
            /* Cart Content */
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {/* Free Shipping Progress */}
                {amountToFreeShipping > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl mb-6"
                    style={{
                      background: "linear-gradient(135deg, rgba(0, 184, 228, 0.1) 0%, rgba(0, 184, 228, 0.05) 100%)",
                      border: "1px solid rgba(0, 184, 228, 0.2)",
                    }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Truck size={20} className="text-yum-cyan" />
                      <span className="text-white text-sm">
                        Add <span className="font-bold text-yum-cyan">${amountToFreeShipping.toFixed(2)}</span> more for FREE shipping!
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: "linear-gradient(90deg, #00B8E4 0%, #00D4FF 100%)" }}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (subtotalDollars / FREE_SHIPPING_THRESHOLD) * 100)}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </motion.div>
                )}

                {/* Items */}
                {items.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex gap-4 sm:gap-6 p-4 sm:p-5 rounded-2xl"
                    style={{
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid rgba(255, 255, 255, 0.06)",
                    }}
                  >
                    {/* Product Image */}
                    <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden flex-shrink-0">
                      <Image
                        src={item.thumbnail || "/images/product-1.png"}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium text-sm sm:text-base mb-1 line-clamp-2">
                        {item.title}
                      </h3>
                      {item.variant?.title && item.variant.title !== "Default" && (
                        <p className="text-white/40 text-xs sm:text-sm mb-2">
                          {item.variant.title}
                        </p>
                      )}
                      <p className="text-yum-pink font-bold text-base sm:text-lg mb-4">
                        ${(item.unit_price / 100).toFixed(2)}
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between">
                        <div
                          className="flex items-center rounded-lg overflow-hidden"
                          style={{ border: "1px solid rgba(255, 255, 255, 0.15)" }}
                        >
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            className="w-9 h-9 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-10 text-center text-white font-medium text-sm">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            className="w-9 h-9 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-2 text-white/40 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Order Summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="lg:sticky lg:top-36 h-fit"
              >
                <div
                  className="p-6 rounded-2xl"
                  style={{
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                  }}
                >
                  <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>

                  {/* Promo Code */}
                  <div className="mb-6">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                        <input
                          type="text"
                          placeholder="Promo code"
                          value={promoCode}
                          onChange={(e) => {
                            setPromoCode(e.target.value);
                            setPromoError("");
                          }}
                          className="w-full h-11 pl-10 pr-4 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-yum-pink/50 text-sm"
                        />
                      </div>
                      <button
                        onClick={applyPromoCode}
                        className="px-4 h-11 rounded-lg font-medium text-sm transition-all"
                        style={{
                          background: promoApplied ? "rgba(34, 197, 94, 0.2)" : "rgba(255, 255, 255, 0.1)",
                          color: promoApplied ? "#22c55e" : "white",
                          border: promoApplied ? "1px solid rgba(34, 197, 94, 0.3)" : "1px solid transparent",
                        }}
                      >
                        {promoApplied ? "Applied!" : "Apply"}
                      </button>
                    </div>
                    {promoError && (
                      <p className="text-red-400 text-xs mt-2">{promoError}</p>
                    )}
                    {promoApplied && (
                      <p className="text-green-400 text-xs mt-2">20% discount applied!</p>
                    )}
                  </div>

                  {/* Shipping Options */}
                  <div className="mb-6">
                    <p className="text-white/60 text-sm mb-3">Shipping</p>
                    <div className="space-y-2">
                      <button
                        onClick={() => setSelectedShipping("standard")}
                        className={`w-full p-3 rounded-lg text-left flex items-center justify-between transition-all ${
                          selectedShipping === "standard"
                            ? "bg-yum-pink/10 border-yum-pink"
                            : "bg-white/5 border-white/10 hover:border-white/20"
                        }`}
                        style={{ border: `1px solid ${selectedShipping === "standard" ? "#E1258F" : "rgba(255,255,255,0.1)"}` }}
                      >
                        <span className="text-white text-sm">Standard (3-5 days)</span>
                        <span className="text-white font-medium text-sm">
                          {subtotalDollars >= FREE_SHIPPING_THRESHOLD ? "FREE" : `$${STANDARD_SHIPPING.toFixed(2)}`}
                        </span>
                      </button>
                      <button
                        onClick={() => setSelectedShipping("express")}
                        className={`w-full p-3 rounded-lg text-left flex items-center justify-between transition-all ${
                          selectedShipping === "express"
                            ? "bg-yum-pink/10 border-yum-pink"
                            : "bg-white/5 border-white/10 hover:border-white/20"
                        }`}
                        style={{ border: `1px solid ${selectedShipping === "express" ? "#E1258F" : "rgba(255,255,255,0.1)"}` }}
                      >
                        <span className="text-white text-sm">Express (1-2 days)</span>
                        <span className="text-white font-medium text-sm">$12.99</span>
                      </button>
                    </div>
                  </div>

                  {/* Summary Lines */}
                  <div className="space-y-3 mb-6 pb-6 border-b border-white/10">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Subtotal</span>
                      <span className="text-white">${subtotalDollars.toFixed(2)}</span>
                    </div>
                    {promoApplied && (
                      <div className="flex justify-between text-sm">
                        <span className="text-green-400">Discount (20%)</span>
                        <span className="text-green-400">-${discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Shipping</span>
                      <span className={shippingCost === 0 ? "text-green-400" : "text-white"}>
                        {shippingCost === 0 ? "FREE" : `$${shippingCost.toFixed(2)}`}
                      </span>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-white font-medium">Total</span>
                    <span
                      className="text-2xl font-bold"
                      style={{
                        background: "linear-gradient(180deg, #FFFFFF 0%, #CCCCCC 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                    >
                      ${total.toFixed(2)}
                    </span>
                  </div>

                  {/* Checkout Button */}
                  <Link
                    href="/checkout"
                    className="w-full h-14 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                      background: "linear-gradient(135deg, #E1258F 0%, #C01F7A 100%)",
                      boxShadow: "0 4px 20px rgba(225, 37, 143, 0.4)",
                    }}
                  >
                    <Lock size={18} />
                    Proceed to Checkout
                  </Link>

                  {/* Trust Badges */}
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <CreditCard size={24} className="text-white/40" />
                      <span className="text-white/40 text-xs">Secure payment powered by Stripe</span>
                    </div>
                    <div className="flex items-center justify-center gap-6 text-white/40">
                      <div className="flex items-center gap-1 text-xs">
                        <Shield size={14} />
                        <span>Secure</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <Truck size={14} />
                        <span>Fast Shipping</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <RotateCcw size={14} />
                        <span>Easy Returns</span>
                      </div>
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
