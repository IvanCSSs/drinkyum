"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Mail, MessageSquare, Clock, Send, CheckCircle, Phone, MapPin } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileLogo from "@/components/MobileLogo";

const contactReasons = [
  "Order Issue",
  "Product Question",
  "Shipping Inquiry",
  "Returns & Refunds",
  "Wholesale Inquiry",
  "Partnership",
  "Other",
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    orderNumber: "",
    reason: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // TODO: Integrate with backend/email service
    // For now, simulate submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log("[Contact Form] Submission:", formData);
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <main className="min-h-screen bg-yum-dark">
      <Navbar />
      <MobileLogo />
      
      <section className="relative pt-32 lg:pt-44 pb-16 lg:pb-24 px-4">
        <div className="max-w-[1100px] mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
              Get in Touch
            </h1>
            <p className="text-white/60 text-lg max-w-xl mx-auto">
              Have a question or need help? We&apos;re here for you. Our team typically responds within 24 hours.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-2 space-y-6"
            >
              {/* Quick Contact Cards */}
              <div 
                className="p-6 rounded-2xl"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <Mail className="w-8 h-8 text-yum-pink mb-4" />
                <h3 className="text-white font-semibold mb-2">Email Us</h3>
                <a href="mailto:support@drinkyum.com" className="text-white/60 hover:text-yum-pink transition-colors">
                  support@drinkyum.com
                </a>
              </div>

              <div 
                className="p-6 rounded-2xl"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <Clock className="w-8 h-8 text-yum-cyan mb-4" />
                <h3 className="text-white font-semibold mb-2">Business Hours</h3>
                <p className="text-white/60">
                  Monday - Friday<br />
                  9:00 AM - 6:00 PM EST
                </p>
              </div>

              <div 
                className="p-6 rounded-2xl"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <MessageSquare className="w-8 h-8 text-green-400 mb-4" />
                <h3 className="text-white font-semibold mb-2">Response Time</h3>
                <p className="text-white/60">
                  We aim to respond to all inquiries within 24 hours during business days.
                </p>
              </div>

              {/* Additional Contact Info */}
              <div className="pt-6 border-t border-white/10 space-y-4">
                <div className="flex items-center gap-3 text-white/50">
                  <Phone className="w-5 h-5" />
                  <span className="text-sm">Phone support coming soon</span>
                </div>
                <div className="flex items-start gap-3 text-white/50">
                  <MapPin className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">
                    YUM Headquarters<br />
                    Miami, FL
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-3"
            >
              <div 
                className="p-6 lg:p-8 rounded-2xl"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                {isSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-white mb-3">Message Sent!</h3>
                    <p className="text-white/60 mb-6">
                      Thanks for reaching out. We&apos;ll get back to you within 24 hours.
                    </p>
                    <button
                      onClick={() => {
                        setIsSubmitted(false);
                        setFormData({ name: "", email: "", orderNumber: "", reason: "", message: "" });
                      }}
                      className="text-yum-pink hover:underline"
                    >
                      Send another message
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <h2 className="text-xl font-bold text-white mb-6">Send us a message</h2>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-white/60 text-sm mb-1.5 block">
                          Name <span className="text-yum-pink">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          placeholder="Your name"
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-yum-pink transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-white/60 text-sm mb-1.5 block">
                          Email <span className="text-yum-pink">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="your@email.com"
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-yum-pink transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-white/60 text-sm mb-1.5 block">
                          Order Number <span className="text-white/40">(if applicable)</span>
                        </label>
                        <input
                          type="text"
                          name="orderNumber"
                          value={formData.orderNumber}
                          onChange={handleChange}
                          placeholder="#YUM-12345"
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-yum-pink transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-white/60 text-sm mb-1.5 block">
                          Reason for Contact <span className="text-yum-pink">*</span>
                        </label>
                        <select
                          name="reason"
                          value={formData.reason}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-yum-pink transition-colors appearance-none cursor-pointer"
                          style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.75rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em" }}
                        >
                          <option value="" className="bg-yum-dark">Select a reason</option>
                          {contactReasons.map(reason => (
                            <option key={reason} value={reason} className="bg-yum-dark">
                              {reason}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-white/60 text-sm mb-1.5 block">
                        Message <span className="text-yum-pink">*</span>
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={5}
                        placeholder="How can we help you?"
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-yum-pink transition-colors resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 rounded-xl font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      style={{
                        background: "linear-gradient(135deg, #E1258F 0%, #C01F7A 100%)",
                      }}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Send Message
                        </>
                      )}
                    </button>

                    <p className="text-white/40 text-xs text-center">
                      By submitting this form, you agree to our{" "}
                      <a href="/privacy-policy" className="text-yum-pink hover:underline">Privacy Policy</a>.
                    </p>
                  </form>
                )}
              </div>
            </motion.div>
          </div>

          {/* FAQ Link */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-16 text-center"
          >
            <p className="text-white/50 mb-4">Looking for quick answers?</p>
            <a
              href="/faq"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white border border-white/20 hover:border-white/40 transition-colors"
            >
              Check our FAQ
            </a>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}


