"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Check, Package, Truck, Mail, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import MobileLogo from "@/components/MobileLogo";
import Footer from "@/components/Footer";
import { trackPurchase, type GtagItem } from "@/lib/gtag";
import { klaviyoPlacedOrder, klaviyoIdentify } from "@/components/Klaviyo";
import { trackMetaEvent } from "@/components/MetaPixel";
import { useCart } from "@/contexts/CartContext";

// Order type matching the WooCommerce API response
interface Order {
  id: string;
  display_id: number;
  status: string;
  email: string;
  currency_code: string;
  items: Array<{
    id: string;
    title: string;
    thumbnail?: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
    total: number;
  }>;
  subtotal: number;
  discount_total: number;
  shipping_total: number;
  tax_total: number;
  total: number;
  shipping_address?: {
    first_name: string;
    last_name: string;
    address_1: string;
    address_2?: string;
    city: string;
    province: string;
    postal_code: string;
    country_code: string;
    phone?: string;
  };
  billing_address?: {
    first_name: string;
    last_name: string;
    address_1: string;
    address_2?: string;
    city: string;
    province: string;
    postal_code: string;
    country_code: string;
    phone?: string;
  };
  created_at: string;
}

// Fetch order from our WooCommerce API proxy
async function getOrder(orderId: string, orderKey?: string): Promise<{ order: Order }> {
  const url = orderKey 
    ? `/api/orders/${orderId}?key=${orderKey}`
    : `/api/orders/${orderId}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch order');
  }
  return response.json();
}

export default function OrderConfirmationPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const orderId = params.orderId as string;
  const orderKey = searchParams.get('key') || undefined;
  const { clearCart } = useCart();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrder() {
      if (!orderId) return;

      try {
        const response = await getOrder(orderId, orderKey);
        setOrder(response.order);

        // Clear cart in React context after successful order
        clearCart();

        // GA4 purchase event (fire once on load)
        const ord = response.order;
        const gtagItems: GtagItem[] = ord.items.map((item) => ({
          item_id: item.id,
          item_name: item.title,
          price: item.unit_price,
          quantity: item.quantity,
          currency: ord.currency_code?.toUpperCase() || 'USD',
        }));
        trackPurchase(
          String(ord.display_id || ord.id),
          ord.total,
          gtagItems,
          {
            currency: ord.currency_code?.toUpperCase() || 'USD',
            tax: ord.tax_total,
            shipping: ord.shipping_total,
          }
        );
        // Browser pixel purchase
        trackMetaEvent('Purchase', {
          content_ids: ord.items.map((item) => String(item.id)),
          content_type: 'product',
          value: ord.total,
          currency: ord.currency_code?.toUpperCase() || 'USD',
          num_items: ord.items.reduce((sum, item) => sum + item.quantity, 0),
          order_id: String(ord.display_id || ord.id),
        });
        // Klaviyo purchase tracking
        if (ord.email) {
          klaviyoIdentify(ord.email, {
            $first_name: ord.shipping_address?.first_name,
            $last_name: ord.shipping_address?.last_name,
          });
        }
        klaviyoPlacedOrder({
          $value: ord.total,
          OrderId: String(ord.display_id || ord.id),
          Items: ord.items.map((item) => ({
            ProductID: item.id,
            ProductName: item.title,
            Quantity: item.quantity,
            Price: item.unit_price,
          })),
        });
      } catch (err) {
        console.error("Failed to fetch order:", err);
        setError("Unable to load order details");
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-yum-dark relative">
        <MobileLogo />
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-12 h-12 border-4 border-yum-pink border-t-transparent rounded-full animate-spin" />
        </div>
        <Footer />
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="min-h-screen bg-yum-dark relative">
        <MobileLogo />
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <h1 className="text-2xl font-bold text-white mb-4">Order Not Found</h1>
          <p className="text-white/60 mb-8">{error || "We couldn't find this order."}</p>
          <Link
            href="/"
            className="px-6 py-3 rounded-xl text-white font-medium transition-all hover:scale-105"
            style={{ background: "#E1258F" }}
          >
            Return Home
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-yum-dark relative">
      <MobileLogo />
      <Navbar />

      <section className="relative pt-28 lg:pt-36 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Success Animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="flex justify-center mb-8"
          >
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #10B981 0%, #059669 100%)" }}
            >
              <Check size={48} className="text-white" strokeWidth={3} />
            </div>
          </motion.div>

          {/* Thank You Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-12"
          >
            <h1
              className="text-3xl lg:text-4xl font-bold mb-4"
              style={{
                background: "linear-gradient(180deg, #FFFFFF 0%, #CCCCCC 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Thank You for Your Order!
            </h1>
            <p className="text-white/60 text-lg">
              Order #{order.display_id} has been confirmed
            </p>
          </motion.div>

          {/* Order Status Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl p-6 mb-6"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-yum-pink/20 flex items-center justify-center">
                <Mail size={24} className="text-yum-pink" />
              </div>
              <div>
                <p className="text-white font-medium">Confirmation email sent to</p>
                <p className="text-white/60">{order.email}</p>
              </div>
            </div>

            {/* Order Progress */}
            <div className="flex items-center justify-between relative">
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-white/10" />
              <div className="absolute top-5 left-0 w-1/3 h-0.5 bg-green-500" />

              <div className="relative z-10 flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center mb-2">
                  <Check size={20} className="text-white" />
                </div>
                <span className="text-white/60 text-sm">Confirmed</span>
              </div>

              <div className="relative z-10 flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-2">
                  <Package size={20} className="text-white/40" />
                </div>
                <span className="text-white/40 text-sm">Processing</span>
              </div>

              <div className="relative z-10 flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-2">
                  <Truck size={20} className="text-white/40" />
                </div>
                <span className="text-white/40 text-sm">Shipped</span>
              </div>
            </div>
          </motion.div>

          {/* Order Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl p-6 mb-6"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <h2 className="text-lg font-semibold text-white mb-4">Order Details</h2>

            {/* Items */}
            <div className="space-y-4 mb-6">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                    {item.thumbnail && (
                      <Image
                        src={item.thumbnail}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium">{item.title}</p>
                    <p className="text-white/50 text-sm">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-white font-medium">
                    ${(item.total / 100).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-t border-white/10 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Subtotal</span>
                <span className="text-white">${(order.subtotal / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Shipping</span>
                <span className="text-white">${(order.shipping_total / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Tax</span>
                <span className="text-white">${(order.tax_total / 100).toFixed(2)}</span>
              </div>
              {order.discount_total > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Discount</span>
                  <span className="text-green-400">-${(order.discount_total / 100).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-white/10">
                <span className="text-white font-semibold">Total</span>
                <span className="text-white text-xl font-bold">${(order.total / 100).toFixed(2)}</span>
              </div>
            </div>
          </motion.div>

          {/* Shipping Address */}
          {order.shipping_address && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="rounded-2xl p-6 mb-8"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <h2 className="text-lg font-semibold text-white mb-4">Shipping Address</h2>
              <p className="text-white">
                {order.shipping_address.first_name} {order.shipping_address.last_name}
              </p>
              <p className="text-white/60">{order.shipping_address.address_1}</p>
              {order.shipping_address.address_2 && (
                <p className="text-white/60">{order.shipping_address.address_2}</p>
              )}
              <p className="text-white/60">
                {order.shipping_address.city}, {order.shipping_address.province} {order.shipping_address.postal_code}
              </p>
            </motion.div>
          )}

          {/* Continue Shopping Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center"
          >
            <Link
              href="/collections"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-white font-semibold transition-all hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #E1258F 0%, #C01F7A 100%)",
                boxShadow: "0 4px 20px rgba(225,37,143,0.4)",
              }}
            >
              Continue Shopping
              <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
