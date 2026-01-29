"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Mail, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

type Status = "idle" | "loading" | "success" | "error" | "notfound";

export default function LabLookupForm() {
  const [labId, setLabId] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Format Lab ID as user types (XXXX-XXXX)
  const handleLabIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    
    if (value.length > 8) {
      value = value.slice(0, 8);
    }
    
    if (value.length > 4) {
      value = value.slice(0, 4) + "-" + value.slice(4);
    }
    
    setLabId(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (labId.length !== 9 || !email) {
      setStatus("error");
      setErrorMessage("Please enter a valid Lab ID and email");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/lab-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ labId, email }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus("success");
        setLabId("");
        setEmail("");
      } else if (response.status === 404) {
        setStatus("notfound");
        setErrorMessage(data.error || "Lab ID not found");
      } else {
        setStatus("error");
        setErrorMessage(data.error || "Something went wrong");
      }
    } catch {
      setStatus("error");
      setErrorMessage("Network error. Please try again.");
    }
  };

  const resetForm = () => {
    setStatus("idle");
    setErrorMessage("");
  };

  return (
    <div
      className="p-6 lg:p-8 rounded-2xl"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-yum-pink/10 flex items-center justify-center">
          <Search className="w-5 h-5 text-yum-pink" />
        </div>
        <div>
          <h3 className="text-white font-semibold">Look Up Your Lab Results</h3>
          <p className="text-white/50 text-sm">Enter your Lab ID to receive results via email</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {status === "success" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center py-6"
          >
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <h4 className="text-white font-semibold mb-2">Results Sent!</h4>
            <p className="text-white/60 text-sm mb-4">
              Check your email for your lab test results PDF.
            </p>
            <button
              onClick={resetForm}
              className="text-yum-pink text-sm hover:underline"
            >
              Look up another result
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div>
              <label htmlFor="labId" className="block text-white/70 text-sm mb-1.5">
                Lab ID
              </label>
              <input
                type="text"
                id="labId"
                value={labId}
                onChange={handleLabIdChange}
                placeholder="XXXX-XXXX"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-yum-pink/50 font-mono tracking-wider"
                disabled={status === "loading"}
              />
              <p className="text-white/40 text-xs mt-1">
                Find this on your product packaging or receipt
              </p>
            </div>

            <div>
              <label htmlFor="email" className="block text-white/70 text-sm mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-yum-pink/50"
                  disabled={status === "loading"}
                />
              </div>
            </div>

            {(status === "error" || status === "notfound") && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-red-400 text-sm"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={status === "loading" || labId.length !== 9 || !email}
              className="w-full py-3 rounded-xl font-semibold text-white transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
              style={{
                background: "linear-gradient(135deg, #E1258F 0%, #C01F7A 100%)",
              }}
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Looking up...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Get Lab Results
                </>
              )}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
