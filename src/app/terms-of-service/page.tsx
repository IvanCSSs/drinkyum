"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FileText, AlertTriangle, Scale, ShoppingBag, Ban, Gavel } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileLogo from "@/components/MobileLogo";

export default function TermsOfServicePage() {
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
              Terms of Service
            </h1>
            <p className="text-white/60 text-lg">
              Please read these terms carefully before using our services
            </p>
          </motion.div>

          {/* Important Notice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8 p-6 rounded-2xl bg-yum-pink/10 border border-yum-pink/30"
          >
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-yum-pink flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-white font-bold mb-2">Age Restriction</h3>
                <p className="text-white/70">
                  You must be at least 21 years of age to access this website and purchase our products. 
                  By using this website, you confirm that you are 21 years of age or older.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="prose prose-invert max-w-none"
          >
            <div className="p-6 lg:p-8 rounded-2xl space-y-8" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
              
              {/* Introduction */}
              <div>
                <p className="text-white/70 leading-relaxed">
                  Welcome to YUM. These Terms of Service (&quot;Terms&quot;) govern your use of the drinkyum.com 
                  website (the &quot;Site&quot;) and any purchases made through it. By accessing or using our Site, 
                  you agree to be bound by these Terms. If you do not agree to these Terms, please do not 
                  use our Site.
                </p>
              </div>

              {/* Section 1 */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="w-5 h-5 text-yum-pink" />
                  <h2 className="text-xl font-bold text-white m-0">1. Acceptance of Terms</h2>
                </div>
                <div className="text-white/70 leading-relaxed">
                  <p>
                    By accessing and using this Site, you accept and agree to be bound by these Terms 
                    and our Privacy Policy. We reserve the right to update or modify these Terms at any 
                    time without prior notice. Your continued use of the Site following any changes 
                    constitutes acceptance of those changes.
                  </p>
                </div>
              </div>

              {/* Section 2 */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                  <h2 className="text-xl font-bold text-white m-0">2. Age Requirement & Eligibility</h2>
                </div>
                <div className="text-white/70 leading-relaxed space-y-4">
                  <p>
                    <span className="text-white font-semibold">You must be at least 21 years old to use this Site and purchase our products.</span> 
                    By placing an order, you represent and warrant that you are at least 21 years of age.
                  </p>
                  <p>
                    We reserve the right to request proof of age at any time and may cancel orders if we 
                    have reason to believe the purchaser is under 21 years of age.
                  </p>
                  <p>
                    Our products are intended for use only by adults who are legally permitted to purchase 
                    them in their jurisdiction.
                  </p>
                </div>
              </div>

              {/* Section 3 */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <ShoppingBag className="w-5 h-5 text-yum-cyan" />
                  <h2 className="text-xl font-bold text-white m-0">3. Products & Orders</h2>
                </div>
                <div className="text-white/70 leading-relaxed space-y-4">
                  <div>
                    <h3 className="text-white font-semibold mb-2">Product Information</h3>
                    <p>
                      We strive to provide accurate product descriptions, images, and pricing. However, 
                      we do not warrant that product descriptions or other content is accurate, complete, 
                      or error-free. Colors may appear differently on different screens.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-2">Pricing</h3>
                    <p>
                      All prices are in US dollars and are subject to change without notice. We reserve 
                      the right to correct pricing errors and cancel orders placed at incorrect prices.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-2">Order Acceptance</h3>
                    <p>
                      Your receipt of an order confirmation does not constitute our acceptance of your order. 
                      We reserve the right to refuse or cancel any order for any reason, including but not 
                      limited to product availability, errors in pricing or product information, or suspected 
                      fraud.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-2">Payment</h3>
                    <p>
                      We accept major credit cards and other payment methods as displayed at checkout. 
                      Payment is processed securely through Authorize.net. By providing payment information, 
                      you represent that you are authorized to use the payment method.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 4 */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Ban className="w-5 h-5 text-red-400" />
                  <h2 className="text-xl font-bold text-white m-0">4. Shipping Restrictions</h2>
                </div>
                <div className="text-white/70 leading-relaxed">
                  <p>
                    Due to varying state and local regulations, we are unable to ship to certain locations. 
                    It is your responsibility to ensure that our products can be legally shipped to and 
                    possessed in your jurisdiction. We currently cannot ship to:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Alabama</li>
                    <li>Arkansas</li>
                    <li>Indiana</li>
                    <li>Rhode Island</li>
                    <li>Vermont</li>
                    <li>Wisconsin</li>
                    <li>International destinations</li>
                  </ul>
                  <p className="mt-4">
                    This list is subject to change. Orders placed to restricted locations will be cancelled 
                    and refunded.
                  </p>
                </div>
              </div>

              {/* Section 5 */}
              <div>
                <h2 className="text-xl font-bold text-white mb-4">5. Product Use & Disclaimer</h2>
                <div className="text-white/70 leading-relaxed space-y-4">
                  <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                    <p className="text-yellow-200/90">
                      <span className="font-semibold text-yellow-300">Important:</span> Our products are 
                      derived from kratom and are not intended to diagnose, treat, cure, or prevent any 
                      disease. These statements have not been evaluated by the Food and Drug Administration.
                    </p>
                  </div>
                  <p>
                    You agree to use our products responsibly and in accordance with all applicable laws. 
                    Do not operate heavy machinery or drive while using our products. Consult with a 
                    healthcare professional before use if you are pregnant, nursing, have a medical 
                    condition, or are taking medications.
                  </p>
                </div>
              </div>

              {/* Section 6 */}
              <div>
                <h2 className="text-xl font-bold text-white mb-4">6. Intellectual Property</h2>
                <div className="text-white/70 leading-relaxed">
                  <p>
                    All content on this Site, including but not limited to text, graphics, logos, images, 
                    and software, is the property of YUM or its content suppliers and is protected by 
                    copyright, trademark, and other intellectual property laws. You may not reproduce, 
                    distribute, modify, or create derivative works without our express written permission.
                  </p>
                </div>
              </div>

              {/* Section 7 */}
              <div>
                <h2 className="text-xl font-bold text-white mb-4">7. User Conduct</h2>
                <div className="text-white/70 leading-relaxed">
                  <p>You agree not to:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Use the Site for any unlawful purpose</li>
                    <li>Attempt to gain unauthorized access to our systems</li>
                    <li>Interfere with the proper functioning of the Site</li>
                    <li>Use automated systems to access the Site (bots, scrapers, etc.)</li>
                    <li>Impersonate any person or entity</li>
                    <li>Submit false or misleading information</li>
                    <li>Resell our products without authorization</li>
                  </ul>
                </div>
              </div>

              {/* Section 8 */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Scale className="w-5 h-5 text-purple-400" />
                  <h2 className="text-xl font-bold text-white m-0">8. Limitation of Liability</h2>
                </div>
                <div className="text-white/70 leading-relaxed">
                  <p>
                    TO THE MAXIMUM EXTENT PERMITTED BY LAW, YUM SHALL NOT BE LIABLE FOR ANY INDIRECT, 
                    INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF 
                    THE SITE OR PRODUCTS, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
                  </p>
                  <p className="mt-4">
                    Our total liability shall not exceed the amount you paid for the products giving rise 
                    to the claim.
                  </p>
                </div>
              </div>

              {/* Section 9 */}
              <div>
                <h2 className="text-xl font-bold text-white mb-4">9. Indemnification</h2>
                <div className="text-white/70 leading-relaxed">
                  <p>
                    You agree to indemnify and hold harmless YUM, its officers, directors, employees, and 
                    agents from any claims, damages, losses, or expenses arising from your use of the Site, 
                    violation of these Terms, or infringement of any rights of another.
                  </p>
                </div>
              </div>

              {/* Section 10 */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Gavel className="w-5 h-5 text-orange-400" />
                  <h2 className="text-xl font-bold text-white m-0">10. Governing Law & Disputes</h2>
                </div>
                <div className="text-white/70 leading-relaxed">
                  <p>
                    These Terms shall be governed by and construed in accordance with the laws of the 
                    State of Florida, without regard to its conflict of law provisions.
                  </p>
                  <p className="mt-4">
                    Any disputes arising from these Terms or your use of the Site shall be resolved 
                    through binding arbitration in accordance with the rules of the American Arbitration 
                    Association, except that either party may seek injunctive relief in a court of 
                    competent jurisdiction.
                  </p>
                </div>
              </div>

              {/* Section 11 */}
              <div>
                <h2 className="text-xl font-bold text-white mb-4">11. Severability</h2>
                <div className="text-white/70 leading-relaxed">
                  <p>
                    If any provision of these Terms is found to be invalid or unenforceable, the remaining 
                    provisions shall continue in full force and effect.
                  </p>
                </div>
              </div>

              {/* Section 12 */}
              <div>
                <h2 className="text-xl font-bold text-white mb-4">12. Contact Information</h2>
                <div className="text-white/70 leading-relaxed">
                  <p>For questions about these Terms, please contact us:</p>
                  <div className="mt-4 p-4 rounded-xl bg-white/5">
                    <p className="text-white font-semibold">YUM</p>
                    <p>Email: <a href="mailto:legal@drinkyum.com" className="text-yum-pink hover:underline">legal@drinkyum.com</a></p>
                    <p>Website: <Link href="/contact" className="text-yum-pink hover:underline">Contact Form</Link></p>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>

          {/* Related Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/privacy-policy"
              className="px-6 py-3 rounded-xl font-semibold text-white text-center border border-white/20 hover:border-white/40 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/shipping-returns"
              className="px-6 py-3 rounded-xl font-semibold text-white text-center border border-white/20 hover:border-white/40 transition-colors"
            >
              Shipping & Returns
            </Link>
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


