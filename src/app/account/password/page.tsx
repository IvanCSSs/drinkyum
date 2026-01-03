"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, Check, CheckCircle } from "lucide-react";
import { AccountLayout } from "@/components/account";
import { changePassword } from "@/lib/auth";

export default function PasswordPage() {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setSuccess(false);
    setError(null);
  };

  // Password validation
  const passwordRequirements = [
    { label: "At least 8 characters", met: formData.newPassword.length >= 8 },
    { label: "Contains a number", met: /\d/.test(formData.newPassword) },
    { label: "Contains uppercase", met: /[A-Z]/.test(formData.newPassword) },
  ];

  const allRequirementsMet = passwordRequirements.every((req) => req.met);
  const passwordsMatch =
    formData.newPassword === formData.confirmPassword &&
    formData.confirmPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!allRequirementsMet) {
      setError("Please meet all password requirements");
      return;
    }

    if (!passwordsMatch) {
      setError("Passwords do not match");
      return;
    }

    setIsSubmitting(true);

    try {
      await changePassword(formData.currentPassword, formData.newPassword);
      setSuccess(true);
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch {
      setError("Current password is incorrect. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AccountLayout
      title="Change Password"
      description="Update your account password"
    >
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
                <p className="text-green-400 text-sm">
                  Password changed successfully!
                </p>
              </motion.div>
            )}

            {/* Current Password */}
            <div>
              <label className="text-white/60 text-sm mb-1.5 block">
                Current Password <span className="text-yum-pink">*</span>
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  required
                  placeholder="Enter current password"
                  autoComplete="current-password"
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-yum-pink transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                >
                  {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="text-white/60 text-sm mb-1.5 block">
                New Password <span className="text-yum-pink">*</span>
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                  placeholder="Enter new password"
                  autoComplete="new-password"
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-yum-pink transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                >
                  {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Password Requirements */}
              {formData.newPassword.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {passwordRequirements.map((req, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center ${
                          req.met ? "bg-green-500/20" : "bg-white/10"
                        }`}
                      >
                        {req.met && <Check size={10} className="text-green-400" />}
                      </div>
                      <span className={req.met ? "text-green-400" : "text-white/40"}>
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-white/60 text-sm mb-1.5 block">
                Confirm New Password <span className="text-yum-pink">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                  className={`w-full px-4 py-3 pr-12 rounded-xl bg-white/5 border text-white placeholder:text-white/30 focus:outline-none transition-colors ${
                    formData.confirmPassword.length > 0
                      ? passwordsMatch
                        ? "border-green-500/50 focus:border-green-500"
                        : "border-red-500/50 focus:border-red-500"
                      : "border-white/10 focus:border-yum-pink"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {formData.confirmPassword.length > 0 && !passwordsMatch && (
                <p className="text-red-400 text-sm mt-1.5">Passwords do not match</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={
                isSubmitting ||
                !allRequirementsMet ||
                !passwordsMatch ||
                !formData.currentPassword
              }
              className="w-full py-4 rounded-xl font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              style={{
                background: "linear-gradient(135deg, #E1258F 0%, #C01F7A 100%)",
              }}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Changing Password...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  Change Password
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </AccountLayout>
  );
}
