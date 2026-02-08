"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag, Trash2, Tag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export interface CartItem {
  id: string | number;
  name: string;
  price: string;
  priceNum: number;
  image: string;
  quantity: number;
  // Subscription info (optional)
  isSubscription?: boolean;
  subscriptionInterval?: string;
  subscriptionIntervalCount?: number;
  subscriptionDiscount?: number;
}

export interface CartCouponDisplay {
  code: string;
  discount: number;
  label: string;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  coupons?: CartCouponDisplay[];
  discountTotal?: number;
  onUpdateQuantity: (id: string | number, quantity: number) => void;
  onRemoveItem: (id: string | number) => void;
  onApplyCoupon?: (code: string) => Promise<void>;
  onRemoveCoupon?: (code: string) => Promise<void>;
  isAddingToCart?: boolean;
}

export default function CartDrawer({
  isOpen,
  onClose,
  items,
  coupons = [],
  discountTotal = 0,
  onUpdateQuantity,
  onRemoveItem,
  onApplyCoupon,
  onRemoveCoupon,
  isAddingToCart = false,
}: CartDrawerProps) {
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const subtotal = items.reduce((sum, item) => sum + item.priceNum * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = subtotal - discountTotal;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim() || !onApplyCoupon) return;

    setIsApplyingCoupon(true);
    setCouponError("");

    try {
      await onApplyCoupon(couponCode.trim());
      setCouponCode("");
    } catch {
      setCouponError("Invalid or expired code");
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = async (code: string) => {
    if (onRemoveCoupon) {
      await onRemoveCoupon(code);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            className="fixed top-0 right-0 h-full w-full max-w-md z-[201] flex flex-col"
            style={{
              background: "linear-gradient(180deg, #0D0D0D 0%, #080808 100%)",
              borderLeft: "1px solid rgba(225, 37, 143, 0.3)",
              boxShadow: "-20px 0 60px rgba(0, 0, 0, 0.5)",
            }}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-6 py-5 border-b border-white/10"
            >
              <div className="flex items-center gap-3">
                <ShoppingBag size={22} className="text-yum-pink" />
                <h2
                  className="text-xl font-bold"
                  style={{
                    background: "linear-gradient(180deg, #FFFFFF 0%, #999999 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Your Cart
                </h2>
                {itemCount > 0 && (
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                    style={{ background: "rgba(225, 37, 143, 0.4)" }}
                  >
                    {itemCount} {itemCount === 1 ? "item" : "items"}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 text-white/60 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {/* Adding to cart loading state */}
              {isAddingToCart && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-3 mb-4 rounded-xl"
                  style={{
                    background: "rgba(225, 37, 143, 0.1)",
                    border: "1px solid rgba(225, 37, 143, 0.3)",
                  }}
                >
                  <div className="w-5 h-5 border-2 border-yum-pink border-t-transparent rounded-full animate-spin" />
                  <span className="text-yum-pink text-sm font-medium">Adding to cart...</span>
                </motion.div>
              )}
              {items.length === 0 && !isAddingToCart ? (
                <motion.div
                  className="flex flex-col items-center justify-center h-full text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
                    style={{ background: "rgba(255, 255, 255, 0.05)" }}
                  >
                    <ShoppingBag size={32} className="text-white/30" />
                  </div>
                  <p className="text-white/60 text-lg mb-2">Your cart is empty</p>
                  <p className="text-white/40 text-sm">Add some YUM to get started!</p>
                </motion.div>
              ) : (
                <div className="flex flex-col gap-4">
                  <AnimatePresence mode="popLayout">
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20, height: 0 }}
                        className="flex gap-4 p-3 rounded-xl"
                        style={{
                          background: "rgba(255, 255, 255, 0.03)",
                          border: "1px solid rgba(255, 255, 255, 0.06)",
                        }}
                      >
                        {/* Product Image */}
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 flex flex-col justify-between min-w-0">
                          <div>
                            <h3 className="text-white text-sm font-medium line-clamp-2 leading-tight">
                              {item.name}
                            </h3>
                            <p className="text-yum-pink font-bold text-sm mt-1">
                              {item.price}
                            </p>
                            {/* Subscription Badge */}
                            {item.isSubscription && (
                              <div className="mt-1 flex items-center gap-1">
                                <span className="text-xs px-1.5 py-0.5 rounded bg-yum-pink/20 text-yum-pink font-medium">
                                  Subscribe & Save
                                  {item.subscriptionDiscount ? ` ${item.subscriptionDiscount}%` : ''}
                                </span>
                                {item.subscriptionInterval && (
                                  <span className="text-xs text-white/50">
                                    {item.subscriptionIntervalCount && item.subscriptionIntervalCount > 1
                                      ? `Every ${item.subscriptionIntervalCount} ${item.subscriptionInterval}s`
                                      : `Every ${item.subscriptionInterval}`}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center justify-between mt-2">
                            <div
                              className="flex items-center gap-1 rounded-lg overflow-hidden"
                              style={{ border: "1px solid rgba(255, 255, 255, 0.15)" }}
                            >
                              <button
                                onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                                className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="w-8 text-center text-white text-sm font-medium">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                              >
                                <Plus size={14} />
                              </button>
                            </div>

                            <button
                              onClick={() => onRemoveItem(item.id)}
                              className="p-1.5 text-white/40 hover:text-red-400 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <motion.div
                className="px-6 py-5 border-t border-white/10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {/* Coupon Input */}
                {onApplyCoupon && (
                  <div className="mb-4">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                        <input
                          type="text"
                          placeholder="Coupon code"
                          value={couponCode}
                          onChange={(e) => {
                            setCouponCode(e.target.value);
                            setCouponError("");
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleApplyCoupon();
                          }}
                          disabled={isApplyingCoupon}
                          className="w-full h-9 pl-9 pr-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-yum-pink/50 text-sm disabled:opacity-50"
                        />
                      </div>
                      <button
                        onClick={handleApplyCoupon}
                        disabled={isApplyingCoupon || !couponCode.trim()}
                        className="px-3 h-9 rounded-lg font-medium text-xs transition-all disabled:opacity-50 bg-white/10 text-white hover:bg-white/15"
                      >
                        {isApplyingCoupon ? "..." : "Apply"}
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-red-400 text-xs mt-1">{couponError}</p>
                    )}
                    {/* Applied Coupons */}
                    {coupons.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {coupons.map((coupon) => (
                          <div
                            key={coupon.code}
                            className="flex items-center justify-between p-1.5 rounded-lg bg-green-500/10 border border-green-500/20"
                          >
                            <div className="flex items-center gap-1.5">
                              <Tag size={12} className="text-green-400" />
                              <span className="text-green-400 text-xs font-medium">{coupon.label}</span>
                            </div>
                            <button
                              onClick={() => handleRemoveCoupon(coupon.code)}
                              className="text-green-400/70 hover:text-green-400 transition-colors p-0.5"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Subtotal */}
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-white/60">Subtotal</span>
                  <span className="text-white">${subtotal.toFixed(2)}</span>
                </div>

                {/* Discount */}
                {discountTotal > 0 && (
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-green-400">Discount</span>
                    <span className="text-green-400">-${discountTotal.toFixed(2)}</span>
                  </div>
                )}

                {/* Total */}
                <div className="flex items-center justify-between mb-4 pt-2 border-t border-white/10">
                  <span className="text-white/60">Total</span>
                  <span
                    className="text-xl font-bold"
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
                  onClick={onClose}
                  className="w-full py-4 rounded-xl font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98] block text-center"
                  style={{
                    background: "linear-gradient(135deg, #E1258F 0%, #C01F7A 100%)",
                    boxShadow: "0 4px 20px rgba(225, 37, 143, 0.4)",
                  }}
                >
                  Checkout
                </Link>

                {/* View Full Cart */}
                <Link
                  href="/cart"
                  onClick={onClose}
                  className="w-full mt-3 py-3 rounded-xl font-medium text-white/60 hover:text-white transition-colors text-center block"
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                >
                  View Full Cart
                </Link>

                {/* Continue Shopping */}
                <button
                  onClick={onClose}
                  className="w-full mt-2 py-2 text-sm font-medium text-white/40 hover:text-white/70 transition-colors"
                >
                  Continue Shopping
                </button>
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
