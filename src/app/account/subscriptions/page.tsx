"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { RefreshCw, ChevronRight, Calendar, Package } from "lucide-react";
import { AccountLayout } from "@/components/account";
import {
  getMySubscriptions,
  formatFrequency,
  formatStatus,
  Subscription,
} from "@/lib/subscriptions";
import { formatOrderAmount } from "@/lib/orders";

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSubscriptions() {
      try {
        const { subscriptions: fetched } = await getMySubscriptions();
        setSubscriptions(fetched);
      } catch (error) {
        console.error("Failed to load subscriptions:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadSubscriptions();
  }, []);

  const getStatusBadgeClasses = (status: Subscription["status"]) => {
    const baseClasses = "px-2.5 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case "active":
        return `${baseClasses} bg-green-500/20 text-green-400 border border-green-500/30`;
      case "paused":
        return `${baseClasses} bg-yellow-500/20 text-yellow-400 border border-yellow-500/30`;
      case "cancelled":
        return `${baseClasses} bg-red-500/20 text-red-400 border border-red-500/30`;
      case "expired":
        return `${baseClasses} bg-gray-500/20 text-gray-400 border border-gray-500/30`;
      default:
        return `${baseClasses} bg-white/10 text-white/60 border border-white/20`;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const calculateTotal = (subscription: Subscription) => {
    return subscription.items.reduce((sum, item) => {
      const discountedPrice =
        item.unit_price * (1 - subscription.discount_percent / 100);
      return sum + discountedPrice * item.quantity;
    }, 0);
  };

  return (
    <AccountLayout
      title="Subscriptions"
      description="Manage your Subscribe & Save orders"
    >
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-48 bg-white/5 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : subscriptions.length > 0 ? (
        <div className="space-y-4">
          {subscriptions.map((subscription, idx) => (
            <motion.div
              key={subscription.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Link
                href={`/account/subscriptions/${subscription.id}`}
                className="block p-5 rounded-2xl hover:bg-white/[0.02] transition-colors"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  {/* Product Thumbnails */}
                  <div className="flex items-center gap-3">
                    {subscription.items.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        className="w-16 h-16 rounded-xl bg-white/10 overflow-hidden shrink-0"
                      >
                        {item.product?.thumbnail ? (
                          <img
                            src={item.product.thumbnail}
                            alt={item.product.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package size={24} className="text-white/30" />
                          </div>
                        )}
                      </div>
                    ))}
                    {subscription.items.length > 3 && (
                      <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                        <span className="text-white/50 text-sm">
                          +{subscription.items.length - 3}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Subscription Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={getStatusBadgeClasses(subscription.status)}>
                        {formatStatus(subscription.status)}
                      </span>
                      {subscription.discount_percent > 0 && (
                        <span className="px-2 py-0.5 rounded text-xs bg-yum-pink/20 text-yum-pink">
                          {subscription.discount_percent}% off
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      {subscription.items.slice(0, 2).map((item) => (
                        <p key={item.id} className="text-white text-sm truncate">
                          {item.product.title}
                          {item.quantity > 1 && (
                            <span className="text-white/50"> × {item.quantity}</span>
                          )}
                        </p>
                      ))}
                      {subscription.items.length > 2 && (
                        <p className="text-white/50 text-sm">
                          +{subscription.items.length - 2} more items
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-white/50">
                      <div className="flex items-center gap-1.5">
                        <RefreshCw size={14} />
                        <span>{formatFrequency(subscription.frequency)}</span>
                      </div>
                      {subscription.status === "active" && (
                        <div className="flex items-center gap-1.5">
                          <Calendar size={14} />
                          <span>
                            Next delivery: {formatDate(subscription.next_billing_date)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Amount & Arrow */}
                  <div className="flex items-center gap-4 lg:text-right">
                    <div>
                      <p className="font-semibold text-white text-lg">
                        {formatOrderAmount(calculateTotal(subscription))}
                      </p>
                      <p className="text-white/50 text-sm">per shipment</p>
                    </div>
                    <ChevronRight size={20} className="text-white/40 shrink-0" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 rounded-2xl"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <RefreshCw size={48} className="text-white/20 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            No Active Subscriptions
          </h3>
          <p className="text-white/50 mb-6 max-w-sm mx-auto">
            Subscribe & Save to get automatic deliveries and exclusive discounts
            on your favorite products.
          </p>
          <Link
            href="/collections/all"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium text-white"
            style={{
              background: "linear-gradient(135deg, #E1258F 0%, #C01F7A 100%)",
            }}
          >
            Browse Products
          </Link>
        </motion.div>
      )}
    </AccountLayout>
  );
}
