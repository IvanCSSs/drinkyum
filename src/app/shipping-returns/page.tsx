"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Truck, RotateCcw, Clock, Package, MapPin, AlertCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileLogo from "@/components/MobileLogo";

export default function ShippingReturnsPage() {
  return (
    <main className="min-h-screen bg-yum-dark">
      <Navbar />
      <MobileLogo />
      
      <section className="relative pt-32 lg:pt-44 pb-16 lg:pb-24 px-4">
        <div className="max-w-[900px] mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
              Shipping & Returns
            </h1>
            <p className="text-white/60 text-lg">
              Everything you need to know about getting your YUM
            </p>
          </motion.div>

          {/* Quick Info Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid sm:grid-cols-3 gap-4 mb-12"
          >
            <div className="p-6 rounded-2xl text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <Truck className="w-8 h-8 text-yum-pink mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-1">Free Shipping</h3>
              <p className="text-white/50 text-sm">On orders over $50</p>
            </div>
            <div className="p-6 rounded-2xl text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <Clock className="w-8 h-8 text-yum-cyan mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-1">Fast Processing</h3>
              <p className="text-white/50 text-sm">Ships within 24-48 hours</p>
            </div>
            <div className="p-6 rounded-2xl text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <RotateCcw className="w-8 h-8 text-green-400 mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-1">30-Day Returns</h3>
              <p className="text-white/50 text-sm">Hassle-free process</p>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-8"
          >
            {/* Shipping Section */}
            <div className="p-6 lg:p-8 rounded-2xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="flex items-center gap-3 mb-6">
                <Package className="w-6 h-6 text-yum-pink" />
                <h2 className="text-2xl font-bold text-white">Shipping Information</h2>
              </div>
              
              <div className="space-y-6 text-white/70 leading-relaxed">
                <div>
                  <h3 className="text-white font-semibold mb-2">Processing Time</h3>
                  <p>
                    Orders are processed within 24-48 business hours (Monday-Friday, excluding holidays). 
                    Orders placed after 2:00 PM EST may be processed the following business day.
                  </p>
                </div>

                <div>
                  <h3 className="text-white font-semibold mb-2">Shipping Methods & Rates</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left py-3 text-white">Method</th>
                          <th className="text-left py-3 text-white">Delivery Time</th>
                          <th className="text-left py-3 text-white">Cost</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-white/5">
                          <td className="py-3">Standard Shipping</td>
                          <td className="py-3">5-7 business days</td>
                          <td className="py-3">$5.99 (Free over $50)</td>
                        </tr>
                        <tr className="border-b border-white/5">
                          <td className="py-3">Express Shipping</td>
                          <td className="py-3">2-3 business days</td>
                          <td className="py-3">$12.99</td>
                        </tr>
                        <tr>
                          <td className="py-3">Priority Overnight</td>
                          <td className="py-3">1 business day</td>
                          <td className="py-3">$24.99</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h3 className="text-white font-semibold mb-2">Shipping Carriers</h3>
                  <p>
                    We ship via USPS, UPS, and FedEx depending on your location and selected shipping method. 
                    Tracking information will be emailed to you once your order ships.
                  </p>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                  <MapPin className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-yellow-300 font-semibold mb-1">Shipping Restrictions</h4>
                    <p className="text-yellow-200/70 text-sm">
                      Due to state regulations, we cannot ship to the following states: Alabama, Arkansas, Indiana, 
                      Rhode Island, Vermont, and Wisconsin. We also cannot ship internationally at this time.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Returns Section */}
            <div className="p-6 lg:p-8 rounded-2xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="flex items-center gap-3 mb-6">
                <RotateCcw className="w-6 h-6 text-green-400" />
                <h2 className="text-2xl font-bold text-white">Return Policy</h2>
              </div>
              
              <div className="space-y-6 text-white/70 leading-relaxed">
                <div>
                  <h3 className="text-white font-semibold mb-2">30-Day Satisfaction Guarantee</h3>
                  <p>
                    We want you to love your YUM! If you&apos;re not completely satisfied with your purchase, 
                    you may return unopened products within 30 days of delivery for a full refund.
                  </p>
                </div>

                <div>
                  <h3 className="text-white font-semibold mb-2">Return Eligibility</h3>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Products must be <span className="text-white">unopened and in original packaging</span></li>
                    <li>Returns must be initiated within <span className="text-white">30 days of delivery</span></li>
                    <li>Proof of purchase (order number or receipt) is required</li>
                    <li>Products must not be damaged due to misuse or negligence</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-white font-semibold mb-2">How to Initiate a Return</h3>
                  <ol className="list-decimal list-inside space-y-2">
                    <li>Email us at <a href="mailto:returns@drinkyum.com" className="text-yum-pink hover:underline">returns@drinkyum.com</a> with your order number</li>
                    <li>We&apos;ll provide you with a return authorization number (RMA) and shipping instructions</li>
                    <li>Ship the product back using a trackable shipping method</li>
                    <li>Once received and inspected, your refund will be processed within 5-7 business days</li>
                  </ol>
                </div>

                <div>
                  <h3 className="text-white font-semibold mb-2">Refund Information</h3>
                  <p>
                    Refunds will be credited to your original payment method. Please allow 5-10 business days 
                    for the refund to appear on your statement, depending on your financial institution.
                  </p>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-red-300 font-semibold mb-1">Non-Returnable Items</h4>
                    <p className="text-red-200/70 text-sm">
                      For safety and quality reasons, opened or used products cannot be returned or refunded. 
                      Subscription orders may be cancelled at any time but are not eligible for refunds on 
                      already-shipped orders.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Damaged/Wrong Items */}
            <div className="p-6 lg:p-8 rounded-2xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <h2 className="text-2xl font-bold text-white mb-4">Damaged or Wrong Items?</h2>
              <p className="text-white/70 leading-relaxed mb-4">
                If you received a damaged or incorrect item, please contact us within 48 hours of delivery. 
                Include photos of the damage and your order number, and we&apos;ll make it right immediately — 
                either with a replacement or full refund at no additional cost to you.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:scale-[1.02]"
                style={{
                  background: "linear-gradient(135deg, #E1258F 0%, #C01F7A 100%)",
                }}
              >
                Contact Support
              </Link>
            </div>

            {/* Questions */}
            <div className="text-center py-8">
              <p className="text-white/50 mb-4">Still have questions about shipping or returns?</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/faq"
                  className="px-6 py-3 rounded-xl font-semibold text-white border border-white/20 hover:border-white/40 transition-colors"
                >
                  View FAQ
                </Link>
                <Link
                  href="/contact"
                  className="px-6 py-3 rounded-xl font-semibold text-white border border-white/20 hover:border-white/40 transition-colors"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Last Updated */}
          <p className="text-center text-white/30 text-sm mt-12">
            Last updated: December 2024
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}

