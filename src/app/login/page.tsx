"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { LogIn, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileLogo from "@/components/MobileLogo";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, isLoading: authLoading, error: authError, clearError } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const returnUrl = searchParams.get("returnUrl") || "/account";

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.push(returnUrl);
    }
  }, [isAuthenticated, authLoading, router, returnUrl]);

  // Sync auth error to local error state
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    clearError();
    setIsSubmitting(true);

    try {
      await login(email, password);
      router.push(returnUrl);
    } catch {
      // Error is handled by AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <main className="min-h-screen bg-yum-dark flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-yum-pink/30 border-t-yum-pink rounded-full animate-spin" />
      </main>
    );
  }

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
              Welcome Back
            </h1>
            <p className="text-white/60">
              Sign in to your account to continue
            </p>
          </motion.div>

          {/* Login Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div
              className="p-6 lg:p-8 rounded-2xl"
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

                {/* Email */}
                <div>
                  <label className="text-white/60 text-sm mb-1.5 block">
                    Email <span className="text-yum-pink">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="your@email.com"
                    autoComplete="email"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-yum-pink transition-colors"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="text-white/60 text-sm mb-1.5 block">
                    Password <span className="text-yum-pink">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Enter your password"
                      autoComplete="current-password"
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
                </div>

                {/* Forgot Password Link */}
                <div className="text-right">
                  <Link
                    href="/forgot-password"
                    className="text-sm text-yum-pink hover:underline"
                  >
                    Forgot password?
                  </Link>
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
                      Signing in...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" />
                      Sign In
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-white/40 text-sm">or</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {/* Register Link */}
              <p className="text-center text-white/60">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="text-yum-pink hover:underline font-medium"
                >
                  Create one
                </Link>
              </p>
            </div>
          </motion.div>

          {/* Guest Checkout Note */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center text-white/40 text-sm mt-6"
          >
            You can also checkout as a guest without creating an account.
          </motion.p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
