"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Shield, Eye, Database, Lock, Mail, Cookie } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileLogo from "@/components/MobileLogo";

export default function PrivacyPolicyPage() {
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
              Privacy Policy
            </h1>
            <p className="text-white/60 text-lg">
              Your privacy matters to us. Here&apos;s how we protect it.
            </p>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="prose prose-invert max-w-none"
          >
            <div className="p-6 lg:p-8 rounded-2xl space-y-8" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
              
              {/* Introduction */}
              <div>
                <p className="text-white/70 leading-relaxed">
                  YUM (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy 
                  explains how we collect, use, disclose, and safeguard your information when you visit our 
                  website drinkyum.com (the &quot;Site&quot;) or make a purchase from us.
                </p>
                <p className="text-white/70 leading-relaxed mt-4">
                  Please read this privacy policy carefully. If you do not agree with the terms of this 
                  privacy policy, please do not access the site.
                </p>
              </div>

              {/* Section 1 */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Database className="w-5 h-5 text-yum-pink" />
                  <h2 className="text-xl font-bold text-white m-0">1. Information We Collect</h2>
                </div>
                <div className="text-white/70 leading-relaxed space-y-4">
                  <div>
                    <h3 className="text-white font-semibold mb-2">Personal Information</h3>
                    <p>When you make a purchase or create an account, we may collect:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Name and contact information (email, phone, address)</li>
                      <li>Billing and shipping addresses</li>
                      <li>Payment information (processed securely via Authorize.net)</li>
                      <li>Date of birth (for age verification purposes)</li>
                      <li>Order history and preferences</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-2">Automatically Collected Information</h3>
                    <p>When you visit our Site, we automatically collect:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>IP address and browser type</li>
                      <li>Device information and operating system</li>
                      <li>Pages visited and time spent on the Site</li>
                      <li>Referring website or source</li>
                      <li>Click patterns and navigation behavior</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Section 2 */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Eye className="w-5 h-5 text-yum-cyan" />
                  <h2 className="text-xl font-bold text-white m-0">2. How We Use Your Information</h2>
                </div>
                <div className="text-white/70 leading-relaxed">
                  <p>We use your information to:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Process and fulfill your orders</li>
                    <li>Verify your age (you must be 21+ to purchase)</li>
                    <li>Send order confirmations, shipping updates, and receipts</li>
                    <li>Respond to customer service requests</li>
                    <li>Send marketing communications (if you opted in)</li>
                    <li>Improve our website and product offerings</li>
                    <li>Prevent fraud and enhance security</li>
                    <li>Comply with legal obligations</li>
                  </ul>
                </div>
              </div>

              {/* Section 3 */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-5 h-5 text-green-400" />
                  <h2 className="text-xl font-bold text-white m-0">3. How We Protect Your Information</h2>
                </div>
                <div className="text-white/70 leading-relaxed">
                  <p>We implement appropriate security measures including:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>SSL/TLS encryption for all data transmission</li>
                    <li>PCI-DSS compliant payment processing via Authorize.net</li>
                    <li>We never store your full credit card number</li>
                    <li>Regular security audits and monitoring</li>
                    <li>Limited employee access to personal data</li>
                    <li>Secure data storage with encryption at rest</li>
                  </ul>
                </div>
              </div>

              {/* Section 4 */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Lock className="w-5 h-5 text-yellow-400" />
                  <h2 className="text-xl font-bold text-white m-0">4. Information Sharing</h2>
                </div>
                <div className="text-white/70 leading-relaxed">
                  <p className="font-semibold text-white">We do not sell your personal information.</p>
                  <p className="mt-2">We may share your information with:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li><span className="text-white">Service Providers:</span> Payment processors (Authorize.net), shipping carriers (USPS, UPS, FedEx), email service providers</li>
                    <li><span className="text-white">Analytics Partners:</span> Google Analytics for website improvement (anonymized data)</li>
                    <li><span className="text-white">Legal Requirements:</span> When required by law or to protect our rights</li>
                    <li><span className="text-white">Business Transfers:</span> In connection with a merger, acquisition, or sale of assets</li>
                  </ul>
                </div>
              </div>

              {/* Section 5 */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Cookie className="w-5 h-5 text-orange-400" />
                  <h2 className="text-xl font-bold text-white m-0">5. Cookies & Tracking</h2>
                </div>
                <div className="text-white/70 leading-relaxed">
                  <p>We use cookies and similar technologies to:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Remember your preferences and cart items</li>
                    <li>Authenticate your session</li>
                    <li>Analyze site traffic and usage patterns</li>
                    <li>Deliver targeted advertising (with your consent)</li>
                  </ul>
                  <p className="mt-4">
                    You can control cookies through your browser settings. Note that disabling cookies 
                    may affect site functionality.
                  </p>
                </div>
              </div>

              {/* Section 6 */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Mail className="w-5 h-5 text-purple-400" />
                  <h2 className="text-xl font-bold text-white m-0">6. Marketing Communications</h2>
                </div>
                <div className="text-white/70 leading-relaxed">
                  <p>If you opt in to marketing:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>We may send promotional emails about new products, sales, and offers</li>
                    <li>We may send SMS messages if you opted in (message & data rates may apply)</li>
                    <li>You can unsubscribe at any time via the link in our emails or by replying STOP to texts</li>
                  </ul>
                  <p className="mt-4">
                    We will always send transactional emails (order confirmations, shipping updates) 
                    regardless of marketing preferences.
                  </p>
                </div>
              </div>

              {/* Section 7 */}
              <div>
                <h2 className="text-xl font-bold text-white mb-4">7. Your Rights</h2>
                <div className="text-white/70 leading-relaxed">
                  <p>Depending on your location, you may have the right to:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Access the personal information we hold about you</li>
                    <li>Request correction of inaccurate information</li>
                    <li>Request deletion of your personal information</li>
                    <li>Opt out of marketing communications</li>
                    <li>Request a copy of your data in a portable format</li>
                  </ul>
                  <p className="mt-4">
                    To exercise these rights, please contact us at{" "}
                    <a href="mailto:privacy@drinkyum.com" className="text-yum-pink hover:underline">
                      privacy@drinkyum.com
                    </a>
                  </p>
                </div>
              </div>

              {/* Section 8 */}
              <div>
                <h2 className="text-xl font-bold text-white mb-4">8. California Residents (CCPA)</h2>
                <div className="text-white/70 leading-relaxed">
                  <p>
                    If you are a California resident, you have additional rights under the California 
                    Consumer Privacy Act (CCPA), including the right to know what personal information 
                    we collect and how it&apos;s used, the right to delete your information, and the right 
                    to opt out of the sale of your information.
                  </p>
                  <p className="mt-4">
                    As stated above, we do not sell your personal information.
                  </p>
                </div>
              </div>

              {/* Section 9 */}
              <div>
                <h2 className="text-xl font-bold text-white mb-4">9. Children&apos;s Privacy</h2>
                <div className="text-white/70 leading-relaxed">
                  <p>
                    Our Site is not intended for individuals under 21 years of age. We do not knowingly 
                    collect personal information from anyone under 21. If you are a parent or guardian 
                    and believe your child has provided us with personal information, please contact us 
                    immediately.
                  </p>
                </div>
              </div>

              {/* Section 10 */}
              <div>
                <h2 className="text-xl font-bold text-white mb-4">10. Changes to This Policy</h2>
                <div className="text-white/70 leading-relaxed">
                  <p>
                    We may update this Privacy Policy from time to time. We will notify you of any 
                    changes by posting the new Privacy Policy on this page and updating the &quot;Last Updated&quot; 
                    date. We encourage you to review this Privacy Policy periodically.
                  </p>
                </div>
              </div>

              {/* Section 11 */}
              <div>
                <h2 className="text-xl font-bold text-white mb-4">11. Contact Us</h2>
                <div className="text-white/70 leading-relaxed">
                  <p>If you have questions about this Privacy Policy, please contact us:</p>
                  <div className="mt-4 p-4 rounded-xl bg-white/5">
                    <p className="text-white font-semibold">YUM</p>
                    <p>Email: <a href="mailto:privacy@drinkyum.com" className="text-yum-pink hover:underline">privacy@drinkyum.com</a></p>
                    <p>Website: <Link href="/contact" className="text-yum-pink hover:underline">Contact Form</Link></p>
                  </div>
                </div>
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

