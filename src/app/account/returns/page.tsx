"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { RotateCcw, Package, ChevronRight, Clock } from "lucide-react";
import { AccountLayout } from "@/components/account";
import { getReturns, Return, formatOrderAmount } from "@/lib/orders";

export default function ReturnsPage() {
  const [returns, setReturns] = useState<Return[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadReturns() {
      try {
        const { returns: fetchedReturns } = await getReturns();
        setReturns(fetchedReturns);
      } catch (error) {
        console.error("Failed to load returns:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadReturns();
  }, []);

  const getStatusBadgeClasses = (status: Return["status"]) => {
    const baseClasses = "px-2.5 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case "requested":
        return `${baseClasses} bg-yellow-500/20 text-yellow-400 border border-yellow-500/30`;
      case "received":
        return `${baseClasses} bg-green-500/20 text-green-400 border border-green-500/30`;
      case "requires_action":
        return `${baseClasses} bg-orange-500/20 text-orange-400 border border-orange-500/30`;
      case "canceled":
        return `${baseClasses} bg-red-500/20 text-red-400 border border-red-500/30`;
      default:
        return `${baseClasses} bg-white/10 text-white/60 border border-white/20`;
    }
  };

  const formatStatus = (status: Return["status"]) => {
    const labels: Record<Return["status"], string> = {
      requested: "Requested",
      received: "Received",
      requires_action: "Action Required",
      canceled: "Canceled",
    };
    return labels[status] || status;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <AccountLayout
      title="Returns"
      description="Track your return requests and refunds"
    >
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-32 bg-white/5 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : returns.length > 0 ? (
        <div className="space-y-4">
          {returns.map((returnItem, idx) => (
            <motion.div
              key={returnItem.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-5 rounded-2xl"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                {/* Return Icon */}
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <RotateCcw size={20} className="text-white/50" />
                </div>

                {/* Return Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <p className="font-semibold text-white">
                      Return #{returnItem.id.slice(-8).toUpperCase()}
                    </p>
                    <span className={getStatusBadgeClasses(returnItem.status)}>
                      {formatStatus(returnItem.status)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-white/50 mb-3">
                    <Clock size={14} />
                    <span>Requested {formatDate(returnItem.created_at)}</span>
                  </div>

                  {/* Items */}
                  <div className="space-y-1">
                    {returnItem.items.map((item, i) => (
                      <p key={i} className="text-sm text-white/70">
                        Item: {item.item_id.slice(-8)} × {item.quantity}
                        {item.reason && (
                          <span className="text-white/40">
                            {" "}
                            - {item.reason}
                          </span>
                        )}
                      </p>
                    ))}
                  </div>

                  {/* Link to order */}
                  <Link
                    href={`/account/orders/${returnItem.order_id}`}
                    className="inline-flex items-center gap-1 text-sm text-yum-pink hover:underline mt-3"
                  >
                    View Original Order
                    <ChevronRight size={14} />
                  </Link>
                </div>

                {/* Refund Amount */}
                <div className="text-left sm:text-right shrink-0">
                  <p className="text-sm text-white/50 mb-1">Refund Amount</p>
                  <p className="font-semibold text-white text-lg">
                    {formatOrderAmount(returnItem.refund_amount)}
                  </p>
                </div>
              </div>
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
          <RotateCcw size={48} className="text-white/20 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            No Returns Yet
          </h3>
          <p className="text-white/50 mb-6 max-w-sm mx-auto">
            If you need to return an item, you can start a return request from
            your order details page.
          </p>
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium text-white"
            style={{
              background: "linear-gradient(135deg, #E1258F 0%, #C01F7A 100%)",
            }}
          >
            <Package size={18} />
            View Orders
          </Link>
        </motion.div>
      )}
    </AccountLayout>
  );
}
