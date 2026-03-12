"use client";

import { motion } from "framer-motion";
import { useState, useRef } from "react";
import { Send, CheckCircle, Upload } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileLogo from "@/components/MobileLogo";

const businessTypes = [
  "Retail Brick & Mortar",
  "Wholesale Online",
  "Distributor",
];

const heardFromOptions = [
  "Word of Mouth",
  "Sales Person",
  "Customer",
  "Email",
  "Social Media",
  "Google",
  "Other",
];

export default function WholesalePage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    companyWebsite: "",
    companyAddress: "",
    businessType: "",
    taxId: "",
    heardFrom: "",
  });
  const [taxDoc, setTaxDoc] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Build FormData with form fields
    const formDataToSend = new FormData();
    formDataToSend.append('first_name', formData.firstName);
    formDataToSend.append('last_name', formData.lastName);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('phone', formData.phone);
    formDataToSend.append('company_website', formData.companyWebsite);
    formDataToSend.append('company_address', formData.companyAddress);
    formDataToSend.append('business_type', formData.businessType);
    formDataToSend.append('tax_id', formData.taxId);
    formDataToSend.append('how_heard', formData.heardFrom);

    // Append the tax document file if present
    if (taxDoc) {
      formDataToSend.append('tax_doc', taxDoc);
    }

    try {
      const response = await fetch('/api/wholesale', {
        method: 'POST',
        body: formDataToSend,
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.message || 'Submission failed. Please try again.');
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      setIsSubmitted(true);
    } catch (error) {
      console.error('[Wholesale] Submission error:', error);
      alert('Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setTaxDoc(e.target.files[0]);
    }
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
              YUM Wholesale Application
            </h1>
            <p className="text-white/60 text-lg max-w-xl mx-auto">
              Thank you for your interest in YUM. Submit your information and we&apos;ll get back to you shortly.
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
                  <h3 className="text-2xl font-bold text-white mb-3">Application Submitted!</h3>
                  <p className="text-white/60 mb-6">
                    Thanks for your interest in YUM wholesale. We&apos;ll review your application and get back to you within 2-3 business days.
                  </p>
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setFormData({
                        firstName: "",
                        lastName: "",
                        email: "",
                        phone: "",
                        companyWebsite: "",
                        companyAddress: "",
                        businessType: "",
                        taxId: "",
                        heardFrom: "",
                      });
                      setTaxDoc(null);
                    }}
                    className="text-yum-pink hover:underline"
                  >
                    Submit another application
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Row 1: First Name + Last Name */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-white/60 text-sm mb-1.5 block">
                        First Name <span className="text-yum-pink">*</span>
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        placeholder="John"
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-yum-pink transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-white/60 text-sm mb-1.5 block">
                        Last Name <span className="text-yum-pink">*</span>
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        placeholder="Doe"
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-yum-pink transition-colors"
                      />
                    </div>
                  </div>

                  {/* Row 2: Email + Phone */}
                  <div className="grid sm:grid-cols-2 gap-4">
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
                    <div>
                      <label className="text-white/60 text-sm mb-1.5 block">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="(555) 123-4567"
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-yum-pink transition-colors"
                      />
                    </div>
                  </div>

                  {/* Row 3: Company Website */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-white/60 text-sm mb-1.5 block">
                        Company Website <span className="text-yum-pink">*</span>
                      </label>
                      <input
                        type="url"
                        name="companyWebsite"
                        value={formData.companyWebsite}
                        onChange={handleChange}
                        required
                        placeholder="https://yourcompany.com"
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-yum-pink transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-white/60 text-sm mb-1.5 block">
                        Business Type
                      </label>
                      <select
                        name="businessType"
                        value={formData.businessType}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-yum-pink transition-colors appearance-none cursor-pointer"
                        style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.75rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em" }}
                      >
                        <option value="" className="bg-yum-dark">Select business type</option>
                        {businessTypes.map(type => (
                          <option key={type} value={type} className="bg-yum-dark">
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Row 4: Company Address */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-1">
                      <label className="text-white/60 text-sm mb-1.5 block">
                        Company Address <span className="text-yum-pink">*</span>
                      </label>
                      <textarea
                        name="companyAddress"
                        value={formData.companyAddress}
                        onChange={handleChange}
                        required
                        rows={3}
                        placeholder="123 Business St, Suite 100&#10;City, State 12345"
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-yum-pink transition-colors resize-none"
                      />
                    </div>
                    <div>
                      <label className="text-white/60 text-sm mb-1.5 block">
                        Tax ID/EIN <span className="text-yum-pink">*</span>
                      </label>
                      <input
                        type="text"
                        name="taxId"
                        value={formData.taxId}
                        onChange={handleChange}
                        required
                        placeholder="XX-XXXXXXX"
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-yum-pink transition-colors"
                      />
                    </div>
                  </div>

                  {/* Row 5: Tax ID Documentation - File Upload */}
                  <div>
                    <label className="text-white/60 text-sm mb-1.5 block">
                      State Tax ID Documentation <span className="text-yum-pink">*</span>
                    </label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      required
                      accept="jpg,jpeg,png,gif,svg,pdf"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full px-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white hover:border-yum-pink transition-colors flex items-center justify-center gap-3"
                    >
                      <Upload className="w-5 h-5 text-white/50" />
                      {taxDoc ? (
                        <span className="text-white">{taxDoc.name}</span>
                      ) : (
                        <span className="text-white/50">Upload file (jpg, jpeg, png, gif, svg, pdf)</span>
                      )}
                    </button>
                  </div>

                  {/* Row 6: How did you hear about us? */}
                  <div>
                    <label className="text-white/60 text-sm mb-1.5 block">
                      How did you hear about us? <span className="text-yum-pink">*</span>
                    </label>
                    <select
                      name="heardFrom"
                      value={formData.heardFrom}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-yum-pink transition-colors appearance-none cursor-pointer"
                      style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.75rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em" }}
                    >
                      <option value="" className="bg-yum-dark">Select an option</option>
                      {heardFromOptions.map(option => (
                        <option key={option} value={option} className="bg-yum-dark">
                          {option}
                        </option>
                      ))}
                    </select>
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
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Submit Application
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

            {/* FDA Disclaimer */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-8 text-center"
            >
              <p className="text-white/40 text-xs leading-relaxed max-w-2xl mx-auto">
                These statements have not been evaluated by the Food and Drug Administration. 
                This product is not intended to diagnose, treat, cure, or prevent any disease.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
