"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  RefreshCw,
  Calendar,
  Package,
  Pause,
  Play,
  SkipForward,
  XCircle,
  MapPin,
  Clock,
  CheckCircle,
} from "lucide-react";
import { AccountLayout } from "@/components/account";
import {
  getSubscription,
  pauseSubscription,
  resumeSubscription,
  skipNextShipment,
  cancelSubscription,
  changeFrequency,
  formatFrequency,
  formatStatus,
  Subscription,
  SubscriptionFrequency,
} from "@/lib/subscriptions";
import { formatOrderAmount } from "@/lib/orders";

const FREQUENCIES: { value: SubscriptionFrequency; label: string }[] = [
  { value: "weekly", label: "Every week" },
  { value: "biweekly", label: "Every 2 weeks" },
  { value: "monthly", label: "Every month" },
  { value: "bimonthly", label: "Every 2 months" },
  { value: "quarterly", label: "Every 3 months" },
];

export default function SubscriptionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    loadSubscription();
  }, [resolvedParams.id]);

  async function loadSubscription() {
    try {
      const { subscription: fetched } = await getSubscription(resolvedParams.id);
      setSubscription(fetched);
    } catch {
      setError("Subscription not found");
    } finally {
      setIsLoading(false);
    }
  }

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handlePause = async () => {
    if (!subscription) return;
    setActionLoading("pause");
    try {
      const { subscription: updated } = await pauseSubscription(subscription.id);
      setSubscription(updated);
      showSuccess("Subscription paused");
    } catch {
      setError("Failed to pause subscription");
    } finally {
      setActionLoading(null);
    }
  };

  const handleResume = async () => {
    if (!subscription) return;
    setActionLoading("resume");
    try {
      const { subscription: updated } = await resumeSubscription(subscription.id);
      setSubscription(updated);
      showSuccess("Subscription resumed");
    } catch {
      setError("Failed to resume subscription");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSkip = async () => {
    if (!subscription) return;
    setActionLoading("skip");
    try {
      const { subscription: updated, skipped_date } = await skipNextShipment(
        subscription.id
      );
      setSubscription(updated);
      showSuccess(`Skipped delivery on ${new Date(skipped_date).toLocaleDateString()}`);
    } catch {
      setError("Failed to skip shipment");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async () => {
    if (!subscription) return;
    setActionLoading("cancel");
    try {
      const { subscription: updated } = await cancelSubscription(subscription.id);
      setSubscription(updated);
      showSuccess("Subscription cancelled");
      setShowCancelConfirm(false);
    } catch {
      setError("Failed to cancel subscription");
    } finally {
      setActionLoading(null);
    }
  };

  const handleFrequencyChange = async (frequency: SubscriptionFrequency) => {
    if (!subscription) return;
    setActionLoading("frequency");
    try {
      const { subscription: updated } = await changeFrequency(
        subscription.id,
        frequency
      );
      setSubscription(updated);
      showSuccess("Frequency updated");
    } catch {
      setError("Failed to update frequency");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadgeClasses = (status: Subscription["status"]) => {
    const baseClasses = "px-3 py-1.5 rounded-full text-sm font-medium";
    switch (status) {
      case "active":
        return `${baseClasses} bg-green-500/20 text-green-400 border border-green-500/30`;
      case "paused":
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
    return sub.items.reduce((sum, item) => {
      const discountedPrice = item.unit_price * (1 - sub.discount_percent / 100);
      return sum + discountedPrice * item.quantity;
    }, 0);
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

      {/* Success Message */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-2"
        >
          <CheckCircle size={18} className="text-green-400" />
          <p className="text-green-400 text-sm">{successMessage}</p>
        </motion.div>
      )}

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
          {formatFrequency(subscription.frequency)}
        </span>
        {subscription.discount_percent > 0 && (
          <span className="px-3 py-1.5 rounded-full text-sm bg-yum-pink/20 text-yum-pink border border-yum-pink/30">
            {subscription.discount_percent}% discount
          </span>
        )}
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
              {subscription.items.map((item) => (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 rounded-xl bg-white/10 overflow-hidden shrink-0">
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
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white mb-1">
                        {item.product.title}
                      </p>
                      {item.variant && (
                        <p className="text-sm text-white/50 mb-2">
                          {item.variant.title}
                        </p>
                      )}
                      <p className="text-sm text-white/60">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold text-white">
                        {formatOrderAmount(
                          item.unit_price *
                            item.quantity *
                            (1 - subscription.discount_percent / 100)
                        )}
                      </p>
                      {subscription.discount_percent > 0 && (
                        <p className="text-sm text-white/40 line-through">
                          {formatOrderAmount(item.unit_price * item.quantity)}
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
          {subscription.shipping_address && (
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
                  {subscription.shipping_address.first_name}{" "}
                  {subscription.shipping_address.last_name}
                </p>
                <p>{subscription.shipping_address.address_1}</p>
                {subscription.shipping_address.address_2 && (
                  <p>{subscription.shipping_address.address_2}</p>
                )}
                <p>
                  {subscription.shipping_address.city},{" "}
                  {subscription.shipping_address.province}{" "}
                  {subscription.shipping_address.postal_code}
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
                {formatDate(subscription.next_billing_date)}
              </p>
            </motion.div>
          )}

          {/* Frequency Selector */}
          {subscription.status === "active" && (
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
                <Clock size={18} className="text-white/60" />
                Delivery Frequency
              </h3>
              <select
                value={subscription.frequency}
                onChange={(e) =>
                  handleFrequencyChange(e.target.value as SubscriptionFrequency)
                }
                disabled={actionLoading === "frequency"}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-yum-pink transition-colors disabled:opacity-50"
              >
                {FREQUENCIES.map((freq) => (
                  <option key={freq.value} value={freq.value}>
                    {freq.label}
                  </option>
                ))}
              </select>
            </motion.div>
          )}

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="p-6 rounded-2xl space-y-3"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <h3 className="text-white font-semibold mb-3">Actions</h3>

            {subscription.status === "active" && (
              <>
                <button
                  onClick={handleSkip}
                  disabled={actionLoading !== null}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50"
                >
                  <SkipForward size={18} />
                  Skip Next Shipment
                </button>
                <button
                  onClick={handlePause}
                  disabled={actionLoading !== null}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 transition-colors disabled:opacity-50"
                >
                  <Pause size={18} />
                  Pause Subscription
                </button>
              </>
            )}

            {subscription.status === "paused" && (
              <button
                onClick={handleResume}
                disabled={actionLoading !== null}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors disabled:opacity-50"
              >
                <Play size={18} />
                Resume Subscription
              </button>
            )}

            {(subscription.status === "active" ||
              subscription.status === "paused") && (
              <>
                {!showCancelConfirm ? (
                  <button
                    onClick={() => setShowCancelConfirm(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                  >
                    <XCircle size={18} />
                    Cancel Subscription
                  </button>
                ) : (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                    <p className="text-red-400 text-sm mb-3">
                      Are you sure you want to cancel? This cannot be undone.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleCancel}
                        disabled={actionLoading === "cancel"}
                        className="flex-1 px-3 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                      >
                        {actionLoading === "cancel" ? "Cancelling..." : "Yes, Cancel"}
                      </button>
                      <button
                        onClick={() => setShowCancelConfirm(false)}
                        className="flex-1 px-3 py-2 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 transition-colors"
                      >
                        Keep It
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </div>
      </div>
    </AccountLayout>
  );
}
