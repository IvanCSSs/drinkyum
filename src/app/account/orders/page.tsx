"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Package, ChevronRight, Clock, Search } from "lucide-react";
import { AccountLayout } from "@/components/account";
import {
  getOrders,
  formatOrderStatus,
  formatFulfillmentStatus,
  formatOrderDate,
  formatOrderAmount,
  Order,
} from "@/lib/orders";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [offset, setOffset] = useState(0);
  const limit = 10;

  useEffect(() => {
    async function loadOrders() {
      setIsLoading(true);
      try {
        const { orders: fetchedOrders, count } = await getOrders({
          limit,
          offset,
        });
        setOrders(fetchedOrders);
        setTotalCount(count);
      } catch (error) {
        console.error("Failed to load orders:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadOrders();
  }, [offset]);

  const filteredOrders = orders.filter((order) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      order.display_id.toString().includes(query) ||
      order.id.toLowerCase().includes(query) ||
      order.items.some((item) => item.title.toLowerCase().includes(query))
    );
  });

  const getStatusBadgeClasses = (status: Order["status"]) => {
    const baseClasses = "px-2.5 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case "completed":
        return `${baseClasses} bg-green-500/20 text-green-400 border border-green-500/30`;
      case "pending":
        return `${baseClasses} bg-yellow-500/20 text-yellow-400 border border-yellow-500/30`;
      case "canceled":
        return `${baseClasses} bg-red-500/20 text-red-400 border border-red-500/30`;
      case "requires_action":
        return `${baseClasses} bg-orange-500/20 text-orange-400 border border-orange-500/30`;
      default:
        return `${baseClasses} bg-white/10 text-white/60 border border-white/20`;
    }
  };

  const getFulfillmentBadgeClasses = (status: Order["fulfillment_status"]) => {
    const baseClasses = "px-2 py-0.5 rounded text-xs";
    switch (status) {
      case "shipped":
        return `${baseClasses} bg-blue-500/20 text-blue-400`;
      case "fulfilled":
        return `${baseClasses} bg-green-500/20 text-green-400`;
      case "not_fulfilled":
        return `${baseClasses} bg-white/10 text-white/50`;
      default:
        return `${baseClasses} bg-white/10 text-white/50`;
    }
  };

  const totalPages = Math.ceil(totalCount / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  return (
    <AccountLayout title="Orders" description="View and track your order history">
      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search orders by ID or product..."
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-yum-pink transition-colors"
          />
        </div>
      </div>

      {/* Orders List */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-24 bg-white/5 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : filteredOrders.length > 0 ? (
          <>
            <div className="divide-y divide-white/10">
              {filteredOrders.map((order, idx) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                >
                  <Link
                    href={`/account/orders/${order.id}`}
                    className="block p-5 hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      {/* Order Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <p className="font-semibold text-white">
                            Order #{order.display_id}
                          </p>
                          <span className={getStatusBadgeClasses(order.status)}>
                            {formatOrderStatus(order.status)}
                          </span>
                          <span
                            className={getFulfillmentBadgeClasses(
                              order.fulfillment_status
                            )}
                          >
                            {formatFulfillmentStatus(order.fulfillment_status)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-white/50 mb-3">
                          <Clock size={14} />
                          <span>{formatOrderDate(order.created_at)}</span>
                        </div>

                        {/* Order Items Preview */}
                        <div className="flex items-center gap-3">
                          {order.items.slice(0, 3).map((item) => (
                            <div
                              key={item.id}
                              className="w-12 h-12 rounded-lg bg-white/10 overflow-hidden shrink-0"
                            >
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
                          ))}
                          {order.items.length > 3 && (
                            <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                              <span className="text-white/50 text-sm">
                                +{order.items.length - 3}
                              </span>
                            </div>
                          )}
                          <span className="text-white/50 text-sm">
                            {order.items.length} item
                            {order.items.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>

                      {/* Amount & Arrow */}
                      <div className="flex items-center gap-4 sm:text-right">
                        <div>
                          <p className="font-semibold text-white text-lg">
                            {formatOrderAmount(order.total, order.currency_code)}
                          </p>
                        </div>
                        <ChevronRight size={20} className="text-white/40 shrink-0" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-white/10 flex items-center justify-between">
                <p className="text-sm text-white/50">
                  Showing {offset + 1}-{Math.min(offset + limit, totalCount)} of{" "}
                  {totalCount}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setOffset(Math.max(0, offset - limit))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg bg-white/5 text-white/70 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setOffset(offset + limit)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg bg-white/5 text-white/70 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <Package size={48} className="text-white/20 mx-auto mb-4" />
            <p className="text-white/50 mb-2">
              {searchQuery ? "No orders match your search" : "No orders yet"}
            </p>
            {!searchQuery && (
              <Link
                href="/collections/all"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-white mt-4"
                style={{
                  background: "linear-gradient(135deg, #E1258F 0%, #C01F7A 100%)",
                }}
              >
                Start Shopping
              </Link>
            )}
          </div>
        )}
      </div>
    </AccountLayout>
  );
}
