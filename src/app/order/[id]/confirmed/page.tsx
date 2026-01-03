"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle, Package, Truck, ArrowRight, Mail } from "lucide-react";
import {
  getOrder,
  formatOrderDate,
  formatOrderAmount,
  Order,
} from "@/lib/orders";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileLogo from "@/components/MobileLogo";

export default function OrderConfirmedPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      try {
        const { order: fetchedOrder } = await getOrder(resolvedParams.id);
        setOrder(fetchedOrder);
      } catch (error) {
        console.error("Failed to load order:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadOrder();
  }, [resolvedParams.id]);

  return (
    <main className="min-h-screen bg-yum-dark">
      <Navbar />
      <MobileLogo />

      <section className="relative pt-32 lg:pt-44 pb-16 lg:pb-24 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Success Animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.1,
            }}
            className="flex justify-center mb-8"
          >
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle size={48} className="text-green-400" />
              </div>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1.5, opacity: 0 }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  repeatDelay: 0.5,
                }}
                className="absolute inset-0 rounded-full bg-green-500/20"
              />
            </div>
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              Order Confirmed!
            </h1>
            <p className="text-white/60">
              Thank you for your order. We&apos;ll send you a confirmation email shortly.
            </p>
          </motion.div>

          {isLoading ? (
            <div className="space-y-6">
              <div className="h-32 bg-white/5 rounded-2xl animate-pulse" />
              <div className="h-48 bg-white/5 rounded-2xl animate-pulse" />
            </div>
          ) : order ? (
            <>
              {/* Order Info Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-6 rounded-2xl mb-6"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <p className="text-white/50 text-sm mb-1">Order Number</p>
                    <p className="text-2xl font-bold text-white">
                      #{order.display_id}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-white/50 text-sm mb-1">Order Date</p>
                    <p className="text-white">{formatOrderDate(order.created_at)}</p>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Mail size={20} className="text-yum-pink" />
                    <p className="text-white/70">
                      Confirmation sent to{" "}
                      <span className="text-white">{order.email}</span>
                    </p>
                  </div>

                  {order.shipping_address && (
                    <div className="flex items-start gap-3">
                      <Truck size={20} className="text-yum-pink shrink-0 mt-0.5" />
                      <div className="text-white/70">
                        <p className="text-white font-medium mb-1">Shipping to:</p>
                        <p>
                          {order.shipping_address.first_name}{" "}
                          {order.shipping_address.last_name}
                        </p>
                        <p>{order.shipping_address.address_1}</p>
                        <p>
                          {order.shipping_address.city},{" "}
                          {order.shipping_address.province}{" "}
                          {order.shipping_address.postal_code}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Order Items */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="p-6 rounded-2xl mb-6"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <h2 className="text-lg font-semibold text-white mb-4">
                  Order Summary
                </h2>

                <div className="space-y-4 mb-6">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-16 h-16 rounded-xl bg-white/10 overflow-hidden shrink-0">
                        {item.thumbnail ? (
                          <img
                            src={item.thumbnail}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package size={20} className="text-white/30" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white text-sm">{item.title}</p>
                        <p className="text-white/50 text-sm">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-medium text-white">
                          {formatOrderAmount(item.total, order.currency_code)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/10 pt-4 space-y-2">
                  <div className="flex justify-between text-white/60">
                    <span>Subtotal</span>
                    <span>
                      {formatOrderAmount(order.subtotal, order.currency_code)}
                    </span>
                  </div>
                  <div className="flex justify-between text-white/60">
                    <span>Shipping</span>
                    <span>
                      {order.shipping_total === 0
                        ? "Free"
                        : formatOrderAmount(order.shipping_total, order.currency_code)}
                    </span>
                  </div>
                  {order.tax_total > 0 && (
                    <div className="flex justify-between text-white/60">
                      <span>Tax</span>
                      <span>
                        {formatOrderAmount(order.tax_total, order.currency_code)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-white font-semibold text-lg pt-2 border-t border-white/10">
                    <span>Total</span>
                    <span>{formatOrderAmount(order.total, order.currency_code)}</span>
                  </div>
                </div>
              </motion.div>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Link
                  href={`/account/orders/${order.id}`}
                  className="flex-1 py-4 px-6 rounded-xl font-semibold text-white text-center transition-all hover:scale-[1.02]"
                  style={{
                    background: "linear-gradient(135deg, #E1258F 0%, #C01F7A 100%)",
                  }}
                >
                  View Order Details
                </Link>
                <Link
                  href="/collections/all"
                  className="flex-1 py-4 px-6 rounded-xl font-medium text-white text-center bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                >
                  Continue Shopping
                  <ArrowRight size={18} />
                </Link>
              </motion.div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center py-12"
            >
              <Package size={48} className="text-white/20 mx-auto mb-4" />
              <p className="text-white/50 mb-6">
                Could not load order details. Please check your email for confirmation.
              </p>
              <Link
                href="/account/orders"
                className="inline-flex items-center gap-2 text-yum-pink hover:underline"
              >
                View All Orders
                <ArrowRight size={18} />
              </Link>
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
