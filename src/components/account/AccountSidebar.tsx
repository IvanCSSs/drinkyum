"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  RefreshCw,
  MapPin,
  User,
  Lock,
  RotateCcw,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { href: "/account", label: "Dashboard", icon: LayoutDashboard },
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/account/subscriptions", label: "Subscriptions", icon: RefreshCw },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/profile", label: "Profile", icon: User },
  { href: "/account/password", label: "Password", icon: Lock },
  { href: "/account/returns", label: "Returns", icon: RotateCcw },
];

export default function AccountSidebar() {
  const pathname = usePathname();
  const { logout, customer } = useAuth();

  const isActive = (href: string) => {
    if (href === "/account") {
      return pathname === "/account";
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0">
        <div
          className="sticky top-32 p-4 rounded-2xl"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {/* User Info */}
          {customer && (
            <div className="px-3 py-4 mb-4 border-b border-white/10">
              <p className="text-white font-medium truncate">
                {customer.first_name} {customer.last_name}
              </p>
              <p className="text-white/50 text-sm truncate">{customer.email}</p>
            </div>
          )}

          {/* Navigation */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative ${
                    active
                      ? "text-white"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 rounded-xl"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(225,37,143,0.2) 0%, rgba(192,31,122,0.2) 100%)",
                        border: "1px solid rgba(225,37,143,0.3)",
                      }}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <Icon size={18} className="relative z-10" />
                  <span className="relative z-10 font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <button
              onClick={logout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/60 hover:text-red-400 hover:bg-red-500/10 transition-all w-full"
            >
              <LogOut size={18} />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Tabs */}
      <div className="lg:hidden mb-6 -mx-4 px-4 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 min-w-max pb-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  active
                    ? "text-white"
                    : "text-white/60 bg-white/5 hover:bg-white/10"
                }`}
                style={
                  active
                    ? {
                        background:
                          "linear-gradient(135deg, rgba(225,37,143,0.3) 0%, rgba(192,31,122,0.3) 100%)",
                        border: "1px solid rgba(225,37,143,0.4)",
                      }
                    : {}
                }
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* Mobile Logout */}
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium text-white/60 bg-white/5 hover:text-red-400 hover:bg-red-500/10 transition-all whitespace-nowrap"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
}
