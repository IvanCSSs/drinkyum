"use client";

import { motion } from "framer-motion";
import { useState, useRef } from "react";
import Link from "next/link";
import { Send, CheckCircle, Upload, X, AlertCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileLogo from "@/components/MobileLogo";

const ISSUE_TYPES = [
  "Shipping damage",
  "Shortage / missing units",
  "Incorrect product",
  "Missing documentation",
  "Other",
];

export default function ShippingIssuesPage() {
  const [formData, setFormData] = useState({
    orderNumber: "",
    name: "",
    email: "",
    phone: "",
    deliveryDate: "",
    issueType: "",
    affectedProduct: "",
    affectedQuantity: "",
    description: "",
  });
  const [photos, setPhotos] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setPhotos((prev) => [...prev, ...files].slice(0, 8)); // cap at 8
  };

  const removePhoto = (idx: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const body = new FormData();
    body.append("order_number", formData.orderNumber);
    body.append("name", formData.name);
    body.append("email", formData.email);
    body.append("phone", formData.phone);
    body.append("delivery_date", formData.deliveryDate);
    body.append("issue_type", formData.issueType);
    body.append("affected_product", formData.affectedProduct);
    body.append("affected_quantity", formData.affectedQuantity);
    body.append("description", formData.description);
    photos.forEach((p) => body.append("photos[]", p));

    try {
      const res = await fetch("/api/shipping-claim", { method: "POST", body });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || "Something went wrong. Please try again or email Damage@lunayum.com.");
      } else {
        setIsSubmitted(true);
      }
    } catch {
      setError("Submission failed. Please email Damage@lunayum.com or call 855-805-5327.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-yum-pink transition-colors";

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
            className="text-center mb-10"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
              Report a Shipping Issue
            </h1>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Received damaged, incorrect, or missing product? Report it below within{" "}
              <span className="text-white">2 business days of delivery</span> and attach photos so
              we can resolve it quickly.
            </p>
            <p className="text-white/40 text-sm mt-3">
              Prefer email or phone? Reach us at{" "}
              <a href="mailto:Damage@lunayum.com" className="text-yum-pink hover:underline">
                Damage@lunayum.com
              </a>{" "}
              or <span className="text-white/60">855-805-5327</span>. See our{" "}
              <Link href="/shipping-policy" className="text-yum-pink hover:underline">
                claims policy
              </Link>
              .
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="max-w-3xl mx-auto"
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
                  <h3 className="text-2xl font-bold text-white mb-3">Report Submitted</h3>
                  <p className="text-white/60 mb-6 max-w-md mx-auto">
                    Thanks — we&apos;ve received your report and our team will review it within 1-3
                    business days. Please keep the damaged product and packaging until we follow up.
                  </p>
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setFormData({
                        orderNumber: "", name: "", email: "", phone: "", deliveryDate: "",
                        issueType: "", affectedProduct: "", affectedQuantity: "", description: "",
                      });
                      setPhotos([]);
                    }}
                    className="text-yum-pink hover:underline"
                  >
                    Report another issue
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Order # + Delivery date */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-white/60 text-sm mb-1.5 block">Order / Invoice Number</label>
                      <input type="text" name="orderNumber" value={formData.orderNumber} onChange={handleChange}
                        placeholder="e.g. #10432" className={inputClass} />
                    </div>
                    <div>
                      <label className="text-white/60 text-sm mb-1.5 block">Delivery Date</label>
                      <input type="date" name="deliveryDate" value={formData.deliveryDate} onChange={handleChange}
                        className={inputClass} />
                    </div>
                  </div>

                  {/* Name + Email */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-white/60 text-sm mb-1.5 block">Your Name</label>
                      <input type="text" name="name" value={formData.name} onChange={handleChange}
                        placeholder="Full name" className={inputClass} />
                    </div>
                    <div>
                      <label className="text-white/60 text-sm mb-1.5 block">
                        Email <span className="text-yum-pink">*</span>
                      </label>
                      <input type="email" name="email" value={formData.email} onChange={handleChange} required
                        placeholder="your@email.com" className={inputClass} />
                    </div>
                  </div>

                  {/* Phone + Issue type */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-white/60 text-sm mb-1.5 block">Phone Number</label>
                      <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                        placeholder="(555) 123-4567" className={inputClass} />
                    </div>
                    <div>
                      <label className="text-white/60 text-sm mb-1.5 block">
                        Issue Type <span className="text-yum-pink">*</span>
                      </label>
                      <select name="issueType" value={formData.issueType} onChange={handleChange} required
                        className={inputClass}>
                        <option value="" className="bg-yum-dark">Select an issue…</option>
                        {ISSUE_TYPES.map((t) => (
                          <option key={t} value={t} className="bg-yum-dark">{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Affected product + quantity */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-white/60 text-sm mb-1.5 block">Affected Product</label>
                      <input type="text" name="affectedProduct" value={formData.affectedProduct} onChange={handleChange}
                        placeholder="Which product?" className={inputClass} />
                    </div>
                    <div>
                      <label className="text-white/60 text-sm mb-1.5 block">Affected Quantity</label>
                      <input type="text" name="affectedQuantity" value={formData.affectedQuantity} onChange={handleChange}
                        placeholder="e.g. 6 units" className={inputClass} />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-white/60 text-sm mb-1.5 block">
                      Describe the Issue <span className="text-yum-pink">*</span>
                    </label>
                    <textarea name="description" value={formData.description} onChange={handleChange} required rows={5}
                      placeholder="Tell us what happened — what was damaged/missing/incorrect, and any details from the packing slip or carton labels."
                      className={inputClass + " resize-none"} />
                  </div>

                  {/* Photo upload */}
                  <div>
                    <label className="text-white/60 text-sm mb-1.5 block">
                      Photos <span className="text-white/40">(recommended — damaged products, cartons, labels)</span>
                    </label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full px-4 py-6 rounded-xl bg-white/5 border border-dashed border-white/20 text-center cursor-pointer hover:border-yum-pink transition-colors"
                    >
                      <Upload className="w-6 h-6 text-white/40 mx-auto mb-2" />
                      <p className="text-white/50 text-sm">Click to upload (up to 8 images or PDFs)</p>
                      <input ref={fileInputRef} type="file" accept="image/*,application/pdf" multiple
                        onChange={handlePhotos} className="hidden" />
                    </div>
                    {photos.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {photos.map((p, i) => (
                          <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                            <span className="text-white/70 text-xs max-w-[160px] truncate">{p.name}</span>
                            <button type="button" onClick={() => removePhoto(i)} className="text-white/40 hover:text-yum-pink">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {error && (
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-red-300 text-sm">{error}</p>
                    </div>
                  )}

                  <button type="submit" disabled={isSubmitting}
                    className="w-full py-4 rounded-xl font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{ background: "linear-gradient(135deg, #E1258F 0%, #C01F7A 100%)" }}>
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Submitting…
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" /> Submit Report
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
