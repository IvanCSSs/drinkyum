"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  RefreshCw,
  Calendar,
  Package,
  MapPin,
  Mail,
} from "lucide-react";
import { AccountLayout } from "@/components/account";
import {
  getSubscription,
  formatFrequency,
  formatStatus,
  Subscription,
} from "@/lib/subscriptions";
import { formatOrderAmount } from "@/lib/orders";

export default function SubscriptionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSubscription();
  }, [resolvedParams.id]);

  async function loadSubscription() {
    try {
      const subscriptionId = parseInt(resolvedParams.id, 10);
      if (isNaN(subscriptionId)) {
        setError("Invalid subscription ID");
        return;
      }
      const { subscription: fetched } = await getSubscription(subscriptionId);
      setSubscription(fetched);
    } catch {
      setError("Subscription not found");
    } finally {
      setIsLoading(false);
    }
  }

  const getStatusBadgeClasses = (status: Subscription["status"]) => {
    const baseClasses = "px-3 py-1.5 rounded-full text-sm font-medium";
    switch (status) {
      case "active":
        return `${baseClasses} bg-green-500/20 text-green-400 border border-green-500/30`;
      case "on-hold":
        return `${baseClasses} bg-yellow-500/20 text-yellow-400 border border-yellow-500/30`;
      case "cancelled":
        return `${baseClasses} bg-red-500/20 text-red-400 border border-red-500/30`;
      default:
        return `${baseClasses} bg-white/10 text-white/60 border border-white/20`;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const calculateTotal = (sub: Subscription) => {
    // Use the pre-calculated total from WooCommerce
    return sub.total;
  };

  if (isLoading) {
    return (
      <AccountLayout title="Subscription Details">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-white/10 rounded" />
          <div className="h-64 bg-white/5 rounded-2xl" />
        </div>
      </AccountLayout>
    );
  }

  if (error || !subscription) {
    return (
      <AccountLayout title="Subscription Not Found">
        <div className="text-center py-16">
          <RefreshCw size={48} className="text-white/20 mx-auto mb-4" />
          <p className="text-white/50 mb-4">{error || "Subscription not found"}</p>
          <Link
            href="/account/subscriptions"
            className="inline-flex items-center gap-2 text-yum-pink hover:underline"
          >
            <ArrowLeft size={18} />
            Back to subscriptions
          </Link>
        </div>
      </AccountLayout>
    );
  }

  return (
    <AccountLayout title="Subscription Details">
      {/* Back Link */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-6"
      >
        <Link
          href="/account/subscriptions"
          className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft size={18} />
          <span>Back to subscriptions</span>
        </Link>
      </motion.div>


      {/* Status & Frequency */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center gap-3 mb-6"
      >
        <span className={getStatusBadgeClasses(subscription.status)}>
          {formatStatus(subscription.status)}
        </span>
        <span className="px-3 py-1.5 rounded-full text-sm bg-white/10 text-white/70 border border-white/20">
          {formatFrequency(subscription.billing_period, subscription.billing_interval)}
        </span>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-2xl"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Package size={20} className="text-white/60" />
              Subscription Items
            </h2>
            <div className="divide-y divide-white/10">
              {subscription.line_items.map((item) => (
                <div key={item.product_id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 rounded-xl bg-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                      <Package size={24} className="text-white/30" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white mb-1">
                        {item.name}
                      </p>
                      <p className="text-sm text-white/60">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold text-white">
                        {formatOrderAmount(item.total)}
                      </p>
                      {item.subtotal > item.total && (
                        <p className="text-sm text-white/40 line-through">
                          {formatOrderAmount(item.subtotal)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-white/10 pt-4 mt-4">
              <div className="flex justify-between text-white font-semibold text-lg">
                <span>Total per shipment</span>
                <span>{formatOrderAmount(calculateTotal(subscription))}</span>
              </div>
            </div>
          </motion.div>

          {/* Shipping Address */}
          {subscription.shipping && (
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
                <MapPin size={20} className="text-white/60" />
                Shipping Address
              </h2>
              <div className="text-white/70 space-y-1">
                <p className="text-white font-medium">
                  {subscription.shipping.first_name}{" "}
                  {subscription.shipping.last_name}
                </p>
                <p>{subscription.shipping.address_1}</p>
                {subscription.shipping.address_2 && (
                  <p>{subscription.shipping.address_2}</p>
                )}
                <p>
                  {subscription.shipping.city},{" "}
                  {subscription.shipping.state}{" "}
                  {subscription.shipping.postcode}
                </p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Next Delivery */}
          {subscription.status === "active" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="p-6 rounded-2xl"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Calendar size={18} className="text-white/60" />
                Next Delivery
              </h3>
              <p className="text-yum-pink font-medium">
                {subscription.date_next_payment ? formatDate(subscription.date_next_payment) : "Not scheduled"}
              </p>
            </motion.div>
          )}

          {/* Need to Make Changes? */}
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
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Mail size={18} className="text-white/60" />
              Need to Make Changes?
            </h3>
            <p className="text-white/70 text-sm mb-4">
              To pause, resume, skip deliveries, change frequency, update your address, or cancel your subscription, please contact our support team.
            </p>
            <a
              href="mailto:support@drinkyum.com"
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-yum-pink text-white font-medium hover:bg-yum-pink/80 transition-colors"
            >
              <Mail size={18} />
              Contact Support
            </a>
          </motion.div>
        </div>
      </div>
    </AccountLayout>
  );
}
