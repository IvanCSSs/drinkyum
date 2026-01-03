"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Save, CheckCircle } from "lucide-react";
import { AccountLayout } from "@/components/account";
import { useAuth } from "@/contexts/AuthContext";
import { updateCustomer } from "@/lib/auth";

export default function ProfilePage() {
  const { customer, refreshCustomer } = useAuth();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Populate form with customer data
  useEffect(() => {
    if (customer) {
      setFormData({
        first_name: customer.first_name || "",
        last_name: customer.last_name || "",
        phone: customer.phone || "",
      });
    }
  }, [customer]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);

    try {
      await updateCustomer({
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone || undefined,
      });
      await refreshCustomer();
      setSuccess(true);
    } catch {
      setError("Failed to update profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AccountLayout title="Profile Settings" description="Manage your personal information">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl"
      >
        <div
          className="p-6 rounded-2xl"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-yum-pink/20 flex items-center justify-center">
              <User size={24} className="text-yum-pink" />
            </div>
            <div>
              <p className="font-semibold text-white">
                {customer?.first_name} {customer?.last_name}
              </p>
              <p className="text-sm text-white/50">{customer?.email}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-red-500/10 border border-red-500/20"
              >
                <p className="text-red-400 text-sm">{error}</p>
              </motion.div>
            )}

            {/* Success Message */}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-2"
              >
                <CheckCircle size={18} className="text-green-400" />
                <p className="text-green-400 text-sm">Profile updated successfully!</p>
              </motion.div>
            )}

            {/* Name Fields */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-white/60 text-sm mb-1.5 block">
                  First Name <span className="text-yum-pink">*</span>
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
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
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  placeholder="Doe"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-yum-pink transition-colors"
                />
              </div>
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="text-white/60 text-sm mb-1.5 block">Email</label>
              <input
                type="email"
                value={customer?.email || ""}
                disabled
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/50 cursor-not-allowed"
              />
              <p className="text-white/40 text-xs mt-1.5">
                Email cannot be changed
              </p>
            </div>

            {/* Phone */}
            <div>
              <label className="text-white/60 text-sm mb-1.5 block">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 123-4567"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-yum-pink transition-colors"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              style={{
                background: "linear-gradient(135deg, #E1258F 0%, #C01F7A 100%)",
              }}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </AccountLayout>
  );
}
