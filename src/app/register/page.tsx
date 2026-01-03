"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus, Eye, EyeOff, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileLogo from "@/components/MobileLogo";

export default function RegisterPage() {
  const router = useRouter();
  const { register, isAuthenticated, isLoading: authLoading, error: authError, clearError } = useAuth();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.push("/account");
    }
  }, [isAuthenticated, authLoading, router]);

  // Sync auth error to local error state
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Password validation
  const passwordRequirements = [
    { label: "At least 8 characters", met: formData.password.length >= 8 },
    { label: "Contains a number", met: /\d/.test(formData.password) },
    { label: "Contains uppercase", met: /[A-Z]/.test(formData.password) },
  ];

  const allRequirementsMet = passwordRequirements.every((req) => req.met);
  const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    clearError();

    // Validation
    if (!acceptedTerms) {
      setError("Please accept the terms and conditions");
      return;
    }

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
      await register({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
      });
      router.push("/account");
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
        <div className="max-w-[500px] mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              Create Account
            </h1>
            <p className="text-white/60">
              Join YUM and unlock exclusive benefits
            </p>
          </motion.div>

          {/* Register Form */}
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
                      autoComplete="given-name"
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
                      autoComplete="family-name"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-yum-pink transition-colors"
                    />
                  </div>
                </div>

                {/* Email */}
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
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="Create a strong password"
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
                  {formData.password.length > 0 && (
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
                    Confirm Password <span className="text-yum-pink">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      placeholder="Confirm your password"
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

                {/* Terms Checkbox */}
                <label className="flex items-start gap-3 cursor-pointer">
                  <div className="relative mt-0.5">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div
                      className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${
                        acceptedTerms
                          ? "bg-yum-pink border-yum-pink"
                          : "border-white/30 bg-transparent"
                      }`}
                    >
                      {acceptedTerms && <Check size={12} className="text-white" strokeWidth={3} />}
                    </div>
                  </div>
                  <span className="text-white/60 text-sm">
                    I agree to the{" "}
                    <Link href="/terms-of-service" className="text-yum-pink hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy-policy" className="text-yum-pink hover:underline">
                      Privacy Policy
                    </Link>
                  </span>
                </label>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || !acceptedTerms || !allRequirementsMet || !passwordsMatch}
                  className="w-full py-4 rounded-xl font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                  style={{
                    background: "linear-gradient(135deg, #E1258F 0%, #C01F7A 100%)",
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5" />
                      Create Account
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

              {/* Login Link */}
              <p className="text-center text-white/60">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-yum-pink hover:underline font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
