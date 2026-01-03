"use client";

import { motion } from "framer-motion";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, Eye, EyeOff, Check, CheckCircle, AlertCircle } from "lucide-react";
import { confirmPasswordReset } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileLogo from "@/components/MobileLogo";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password validation
  const passwordRequirements = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Contains a number", met: /\d/.test(password) },
    { label: "Contains uppercase", met: /[A-Z]/.test(password) },
  ];

  const allRequirementsMet = passwordRequirements.every((req) => req.met);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  // Redirect if no token
  useEffect(() => {
    if (!token) {
      router.push("/forgot-password");
    }
  }, [token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!allRequirementsMet) {
      setError("Please meet all password requirements");
      return;
    }

    if (!passwordsMatch) {
      setError("Passwords do not match");
      return;
    }

    if (!token) {
      setError("Invalid reset token");
      return;
    }

    setIsSubmitting(true);

    try {
      await confirmPasswordReset(token, password);
      setIsSuccess(true);
    } catch {
      setError("This reset link has expired or is invalid. Please request a new one.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center py-12">
        <AlertCircle size={48} className="text-yellow-400 mx-auto mb-4" />
        <p className="text-white/60">Redirecting...</p>
      </div>
    );
  }

  return (
    <div
      className="p-6 lg:p-8 rounded-2xl"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {isSuccess ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-6"
        >
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            Password Reset Successfully
          </h2>
          <p className="text-white/60 mb-6">
            Your password has been updated. You can now sign in with your new password.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-white transition-all hover:scale-[1.02]"
            style={{
              background: "linear-gradient(135deg, #E1258F 0%, #C01F7A 100%)",
            }}
          >
            Sign In
          </Link>
        </motion.div>
      ) : (
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

          {/* New Password */}
          <div>
            <label className="text-white/60 text-sm mb-1.5 block">
              New Password <span className="text-yum-pink">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter new password"
                autoComplete="new-password"
                className="w-full px-4 py-3 pr-12 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-yum-pink transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Password Requirements */}
            {password.length > 0 && (
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
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirm new password"
                autoComplete="new-password"
                className={`w-full px-4 py-3 pr-12 rounded-xl bg-white/5 border text-white placeholder:text-white/30 focus:outline-none transition-colors ${
                  confirmPassword.length > 0
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
            {confirmPassword.length > 0 && !passwordsMatch && (
              <p className="text-red-400 text-sm mt-1.5">Passwords do not match</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !allRequirementsMet || !passwordsMatch}
            className="w-full py-4 rounded-xl font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            style={{
              background: "linear-gradient(135deg, #E1258F 0%, #C01F7A 100%)",
            }}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Resetting...
              </>
            ) : (
              <>
                <Lock className="w-5 h-5" />
                Reset Password
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-yum-dark">
      <Navbar />
      <MobileLogo />

      <section className="relative pt-32 lg:pt-44 pb-16 lg:pb-24 px-4">
        <div className="max-w-[450px] mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              Create New Password
            </h1>
            <p className="text-white/60">
              Enter a new password for your account
            </p>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Suspense
              fallback={
                <div className="p-8 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-yum-pink/30 border-t-yum-pink rounded-full animate-spin" />
                </div>
              }
            >
              <ResetPasswordForm />
            </Suspense>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
