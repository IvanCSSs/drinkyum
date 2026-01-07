"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Mail, Loader2 } from "lucide-react";
import { verifyEmail, resendVerificationEmail } from "@/lib/auth";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileLogo from "@/components/MobileLogo";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const emailFromUrl = searchParams.get("email");
  const { isAuthenticated, customer } = useAuth();

  const [status, setStatus] = useState<"loading" | "success" | "error" | "no-token">(
    token ? "loading" : "no-token"
  );
  const [resendStatus, setResendStatus] = useState<
    "idle" | "sending" | "sent" | "error" | "rate-limited"
  >("idle");
  const [resendEmail, setResendEmail] = useState(emailFromUrl || "");
  const [rateLimitSeconds, setRateLimitSeconds] = useState(0);

  useEffect(() => {
    if (!token) {
      setStatus("no-token");
      return;
    }

    async function verify() {
      try {
        await verifyEmail(token!);
        setStatus("success");
      } catch {
        setStatus("error");
      }
    }

    verify();
  }, [token]);

  const handleResend = async () => {
    const emailToUse = isAuthenticated && customer?.email ? customer.email : resendEmail;
    if (!emailToUse) return;

    setResendStatus("sending");
    try {
      await resendVerificationEmail(emailToUse);
      setResendStatus("sent");
    } catch (err: unknown) {
      // Check for rate limit error
      const error = err as Error & { retry_after?: number };
      console.error("[verify-email] Resend failed:", error.message);
      if (error.message?.includes("wait") || error.message?.includes("Please wait")) {
        setResendStatus("rate-limited");
        // Extract seconds from error message if available
        const match = error.message.match(/(\d+)\s*second/);
        if (match) {
          setRateLimitSeconds(parseInt(match[1], 10));
        }
      } else {
        setResendStatus("error");
      }
    }
  };

  return (
    <div
      className="p-6 lg:p-8 rounded-2xl max-w-md mx-auto"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {status === "loading" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8"
        >
          <Loader2 size={48} className="text-yum-pink animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">
            Verifying Your Email
          </h2>
          <p className="text-white/60">Please wait a moment...</p>
        </motion.div>
      )}

      {status === "success" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-8"
        >
          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={40} className="text-green-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            Email Verified!
          </h2>
          <p className="text-white/60 mb-6">
            Your email has been successfully verified. You can now enjoy all
            features of your account.
          </p>
          <Link
            href="/account"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-white transition-all hover:scale-[1.02]"
            style={{
              background: "linear-gradient(135deg, #E1258F 0%, #C01F7A 100%)",
            }}
          >
            Go to Account
          </Link>
        </motion.div>
      )}

      {status === "error" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-8"
        >
          <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <XCircle size={40} className="text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            Verification Failed
          </h2>
          <p className="text-white/60 mb-6">
            This verification link has expired or is invalid. Please request a
            new verification email.
          </p>

          {/* Email input for unauthenticated users */}
          {!isAuthenticated && (
            <div className="mb-4">
              <input
                type="email"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-yum-pink transition-colors mb-3"
              />
            </div>
          )}

          <button
            onClick={handleResend}
            disabled={
              resendStatus === "sending" ||
              resendStatus === "sent" ||
              resendStatus === "rate-limited" ||
              (!isAuthenticated && !resendEmail)
            }
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-white transition-all hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(135deg, #E1258F 0%, #C01F7A 100%)",
            }}
          >
            {resendStatus === "sending" ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Sending...
              </>
            ) : resendStatus === "sent" ? (
              <>
                <CheckCircle size={18} />
                Email Sent!
              </>
            ) : resendStatus === "rate-limited" ? (
              <>
                <XCircle size={18} />
                Wait {rateLimitSeconds}s
              </>
            ) : (
              <>
                <Mail size={18} />
                Resend Verification Email
              </>
            )}
          </button>

          {resendStatus === "error" && (
            <p className="text-red-400 text-sm mt-3">
              Failed to send email. Please try again.
            </p>
          )}
          {resendStatus === "sent" && (
            <p className="text-green-400 text-sm mt-3">
              If an account exists with this email, you&apos;ll receive a verification link shortly.
            </p>
          )}
        </motion.div>
      )}

      {status === "no-token" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-8"
        >
          <div className="w-20 h-20 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-4">
            <Mail size={40} className="text-yellow-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            Email Verification
          </h2>
          <p className="text-white/60 mb-6">
            Please check your email inbox for a verification link. Click the
            link to verify your email address.
          </p>

          <p className="text-white/40 text-sm mb-4">
            Didn&apos;t receive the email?
          </p>

          {/* Email input for unauthenticated users */}
          {!isAuthenticated && (
            <div className="mb-4">
              <input
                type="email"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-yum-pink transition-colors mb-3"
              />
            </div>
          )}

          <button
            onClick={handleResend}
            disabled={
              resendStatus === "sending" ||
              resendStatus === "sent" ||
              resendStatus === "rate-limited" ||
              (!isAuthenticated && !resendEmail)
            }
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-white transition-all hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(135deg, #E1258F 0%, #C01F7A 100%)",
            }}
          >
            {resendStatus === "sending" ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Sending...
              </>
            ) : resendStatus === "sent" ? (
              <>
                <CheckCircle size={18} />
                Email Sent!
              </>
            ) : resendStatus === "rate-limited" ? (
              <>
                <XCircle size={18} />
                Wait {rateLimitSeconds}s
              </>
            ) : (
              <>
                <Mail size={18} />
                Resend Verification Email
              </>
            )}
          </button>

          {resendStatus === "error" && (
            <p className="text-red-400 text-sm mt-3">
              Failed to send email. Please try again.
            </p>
          )}
          {resendStatus === "rate-limited" && (
            <p className="text-yellow-400 text-sm mt-3">
              Please wait before requesting another email.
            </p>
          )}
          {resendStatus === "sent" && (
            <p className="text-green-400 text-sm mt-3">
              If an account exists with this email, you&apos;ll receive a verification link shortly.
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <main className="min-h-screen bg-yum-dark">
      <Navbar />
      <MobileLogo />

      <section className="relative pt-32 lg:pt-44 pb-16 lg:pb-24 px-4">
        <div className="max-w-xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              Email Verification
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Suspense
              fallback={
                <div className="p-8 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center">
                  <Loader2 size={32} className="text-yum-pink animate-spin" />
                </div>
              }
            >
              <VerifyEmailContent />
            </Suspense>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
