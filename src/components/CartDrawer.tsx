"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export interface CartItem {
  id: number;
  name: string;
  price: string;
  priceNum: number;
  image: string;
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: number, quantity: number) => void;
  onRemoveItem: (id: number) => void;
}

export default function CartDrawer({ 
  isOpen, 
  onClose, 
  items, 
  onUpdateQuantity, 
  onRemoveItem 
}: CartDrawerProps) {
  const subtotal = items.reduce((sum, item) => sum + item.priceNum * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

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
              {items.length === 0 ? (
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
                {/* Subtotal */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-white/60">Subtotal</span>
                  <span 
                    className="text-xl font-bold"
                    style={{
                      background: "linear-gradient(180deg, #FFFFFF 0%, #CCCCCC 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    ${subtotal.toFixed(2)}
                  </span>
                </div>

                {/* Checkout Button */}
                <button
                  className="w-full py-4 rounded-xl font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: "linear-gradient(135deg, #E1258F 0%, #C01F7A 100%)",
                    boxShadow: "0 4px 20px rgba(225, 37, 143, 0.4)",
                  }}
                >
                  Checkout
                </button>

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



