"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Package,
  Truck,
  MapPin,
  CreditCard,
  ExternalLink,
  RotateCcw,
} from "lucide-react";
import { AccountLayout } from "@/components/account";
import {
  getOrder,
  formatOrderStatus,
  formatFulfillmentStatus,
  formatPaymentStatus,
  formatOrderDate,
  formatOrderAmount,
  canRequestReturn,
  Order,
} from "@/lib/orders";

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrder() {
      try {
        const { order: fetchedOrder } = await getOrder(resolvedParams.id);
        setOrder(fetchedOrder);
      } catch {
        setError("Order not found");
      } finally {
        setIsLoading(false);
      }
    }
    loadOrder();
  }, [resolvedParams.id]);

  const getStatusBadgeClasses = (status: Order["status"]) => {
    const baseClasses = "px-3 py-1.5 rounded-full text-sm font-medium";
    switch (status) {
      case "completed":
        return `${baseClasses} bg-green-500/20 text-green-400 border border-green-500/30`;
      case "pending":
        return `${baseClasses} bg-yellow-500/20 text-yellow-400 border border-yellow-500/30`;
      case "canceled":
        return `${baseClasses} bg-red-500/20 text-red-400 border border-red-500/30`;
      default:
        return `${baseClasses} bg-white/10 text-white/60 border border-white/20`;
    }
  };

  if (isLoading) {
    return (
      <AccountLayout title="Order Details">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-white/10 rounded" />
          <div className="h-64 bg-white/5 rounded-2xl" />
          <div className="h-48 bg-white/5 rounded-2xl" />
        </div>
      </AccountLayout>
    );
  }

  if (error || !order) {
    return (
      <AccountLayout title="Order Not Found">
        <div className="text-center py-16">
          <Package size={48} className="text-white/20 mx-auto mb-4" />
          <p className="text-white/50 mb-4">{error || "Order not found"}</p>
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-2 text-yum-pink hover:underline"
          >
            <ArrowLeft size={18} />
            Back to orders
          </Link>
        </div>
      </AccountLayout>
    );
  }

  return (
    <AccountLayout
      title={`Order #${order.display_id}`}
      description={formatOrderDate(order.created_at)}
    >
      {/* Back Link */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-6"
      >
        <Link
          href="/account/orders"
          className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft size={18} />
          <span>Back to orders</span>
        </Link>
      </motion.div>

      {/* Status Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center gap-3 mb-6"
      >
        <span className={getStatusBadgeClasses(order.status)}>
          {formatOrderStatus(order.status)}
        </span>
        <span className="px-3 py-1.5 rounded-full text-sm bg-blue-500/20 text-blue-400 border border-blue-500/30">
          {formatFulfillmentStatus(order.fulfillment_status)}
        </span>
        <span className="px-3 py-1.5 rounded-full text-sm bg-purple-500/20 text-purple-400 border border-purple-500/30">
          {formatPaymentStatus(order.payment_status)}
        </span>
      </motion.div>

      {/* Order Items */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-6 rounded-2xl mb-6"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Package size={20} className="text-white/60" />
          Order Items
        </h2>
        <div className="divide-y divide-white/10">
          {order.items.map((item) => (
            <div key={item.id} className="py-4 first:pt-0 last:pb-0">
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-xl bg-white/10 overflow-hidden shrink-0">
                  {item.thumbnail ? (
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package size={24} className="text-white/30" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white mb-1">{item.title}</p>
                  {item.variant && (
                    <p className="text-sm text-white/50 mb-2">
                      {item.variant.title}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-white/60">Qty: {item.quantity}</span>
                    <span className="text-white">
                      {formatOrderAmount(item.unit_price, order.currency_code)} each
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-semibold text-white">
                    {formatOrderAmount(item.total, order.currency_code)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Order Summary & Addresses */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Order Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-2xl"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <CreditCard size={20} className="text-white/60" />
            Order Summary
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between text-white/60">
              <span>Subtotal</span>
              <span>{formatOrderAmount(order.subtotal, order.currency_code)}</span>
            </div>
            {order.discount_total > 0 && (
              <div className="flex justify-between text-green-400">
                <span>Discount</span>
                <span>
                  -{formatOrderAmount(order.discount_total, order.currency_code)}
                </span>
              </div>
            )}
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
                <span>{formatOrderAmount(order.tax_total, order.currency_code)}</span>
              </div>
            )}
            <div className="border-t border-white/10 pt-3 mt-3">
              <div className="flex justify-between text-white font-semibold text-lg">
                <span>Total</span>
                <span>{formatOrderAmount(order.total, order.currency_code)}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Shipping Address */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-2xl"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <MapPin size={20} className="text-white/60" />
            Shipping Address
          </h2>
          {order.shipping_address && (
            <div className="text-white/70 space-y-1">
              <p className="text-white font-medium">
                {order.shipping_address.first_name} {order.shipping_address.last_name}
              </p>
              <p>{order.shipping_address.address_1}</p>
              {order.shipping_address.address_2 && (
                <p>{order.shipping_address.address_2}</p>
              )}
              <p>
                {order.shipping_address.city}, {order.shipping_address.province}{" "}
                {order.shipping_address.postal_code}
              </p>
              <p>{order.shipping_address.country_code?.toUpperCase()}</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Tracking Info */}
      {order.fulfillments && order.fulfillments.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 p-6 rounded-2xl"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Truck size={20} className="text-white/60" />
            Tracking Information
          </h2>
          <div className="space-y-3">
            {order.fulfillments.map((fulfillment) => (
              <div key={fulfillment.id} className="space-y-2">
                {fulfillment.tracking_numbers?.map((trackingNumber, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/5"
                  >
                    <div>
                      <p className="text-sm text-white/50">Tracking Number</p>
                      <p className="text-white font-mono">{trackingNumber}</p>
                    </div>
                    {fulfillment.tracking_links?.[idx] && (
                      <a
                        href={fulfillment.tracking_links[idx].url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-lg bg-yum-pink/20 text-yum-pink hover:bg-yum-pink/30 transition-colors flex items-center gap-2"
                      >
                        Track
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Request Return Button */}
      {canRequestReturn(order) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6"
        >
          <Link
            href={`/account/returns/new?order_id=${order.id}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-all"
          >
            <RotateCcw size={18} />
            Request Return
          </Link>
        </motion.div>
      )}
    </AccountLayout>
  );
}
