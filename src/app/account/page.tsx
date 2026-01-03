"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Package,
  RefreshCw,
  DollarSign,
  ChevronRight,
  Clock,
} from "lucide-react";
import { AccountLayout } from "@/components/account";
import { getAccountSummary } from "@/lib/auth";
import {
  getRecentOrders,
  formatOrderStatus,
  formatOrderDate,
  formatOrderAmount,
  Order,
} from "@/lib/orders";

interface AccountSummary {
  orders_count: number;
  subscriptions_count: number;
  total_spent: number;
}

export default function AccountDashboard() {
  const [summary, setSummary] = useState<AccountSummary | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [summaryData, ordersData] = await Promise.all([
          getAccountSummary().catch(() => ({
            orders_count: 0,
            subscriptions_count: 0,
            total_spent: 0,
          })),
          getRecentOrders().catch(() => []),
        ]);
        setSummary(summaryData);
        setRecentOrders(ordersData);
      } catch (error) {
        console.error("Failed to load account data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const summaryCards = [
    {
      label: "Total Orders",
      value: summary?.orders_count || 0,
      icon: Package,
      href: "/account/orders",
      color: "from-blue-500/20 to-blue-600/20",
      borderColor: "border-blue-500/30",
    },
    {
      label: "Active Subscriptions",
      value: summary?.subscriptions_count || 0,
      icon: RefreshCw,
      href: "/account/subscriptions",
      color: "from-green-500/20 to-green-600/20",
      borderColor: "border-green-500/30",
    },
    {
      label: "Total Spent",
      value: formatOrderAmount(summary?.total_spent || 0),
      icon: DollarSign,
      href: "/account/orders",
      color: "from-yum-pink/20 to-yum-pink/10",
      borderColor: "border-yum-pink/30",
    },
  ];

  const getStatusBadgeClasses = (status: Order["status"]) => {
    const baseClasses = "px-2.5 py-1 rounded-full text-xs font-medium";
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

  return (
    <AccountLayout title="Dashboard" description="Welcome back to your account">
      {/* Summary Cards */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {summaryCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
            >
              <Link
                href={card.href}
                className={`block p-5 rounded-2xl bg-gradient-to-br ${card.color} border ${card.borderColor} hover:scale-[1.02] transition-transform`}
              >
                <div className="flex items-center justify-between mb-3">
                  <Icon size={24} className="text-white/70" />
                  <ChevronRight size={18} className="text-white/40" />
                </div>
                {isLoading ? (
                  <div className="h-8 w-20 bg-white/10 rounded animate-pulse" />
                ) : (
                  <p className="text-2xl font-bold text-white">{card.value}</p>
                )}
                <p className="text-white/60 text-sm mt-1">{card.label}</p>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="p-6 rounded-2xl"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-white">Recent Orders</h2>
          <Link
            href="/account/orders"
            className="text-sm text-yum-pink hover:underline flex items-center gap-1"
          >
            View all <ChevronRight size={14} />
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 bg-white/5 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : recentOrders.length > 0 ? (
          <div className="space-y-3">
            {recentOrders.slice(0, 3).map((order) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="block p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-medium text-white">
                        Order #{order.display_id}
                      </p>
                      <span className={getStatusBadgeClasses(order.status)}>
                        {formatOrderStatus(order.status)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/50">
                      <Clock size={14} />
                      <span>{formatOrderDate(order.created_at)}</span>
                      <span className="text-white/30">•</span>
                      <span>{order.items.length} item{order.items.length !== 1 ? "s" : ""}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold text-white">
                      {formatOrderAmount(order.total, order.currency_code)}
                    </p>
                    <ChevronRight size={18} className="text-white/40 ml-auto mt-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Package size={40} className="text-white/20 mx-auto mb-3" />
            <p className="text-white/50 mb-3">No orders yet</p>
            <Link
              href="/collections/all"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-white"
              style={{
                background: "linear-gradient(135deg, #E1258F 0%, #C01F7A 100%)",
              }}
            >
              Start Shopping
            </Link>
          </div>
        )}
      </motion.div>

      {/* Quick Links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="mt-6 grid sm:grid-cols-2 gap-4"
      >
        <Link
          href="/account/profile"
          className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors flex items-center justify-between"
        >
          <span className="text-white/70">Edit Profile</span>
          <ChevronRight size={18} className="text-white/40" />
        </Link>
        <Link
          href="/account/addresses"
          className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors flex items-center justify-between"
        >
          <span className="text-white/70">Manage Addresses</span>
          <ChevronRight size={18} className="text-white/40" />
        </Link>
      </motion.div>
    </AccountLayout>
  );
}
