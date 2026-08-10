"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";

/**
 * Engagement popup — follows Klaviyo's standard, gentler trigger rules:
 *   - Time delay: ~8 seconds after load (not immediate), OR
 *   - Scroll depth: past ~50% of the page,
 *   whichever comes first — then not again this session (sessionStorage).
 * No aggressive exit-intent / fast 40s fallback; give the reader time to engage first.
 */
export default function FreeSamplePopup() {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const show = useCallback(() => {
    if (dismissed) return;
    if (typeof window !== "undefined" && sessionStorage.getItem("yum_sample_popup_seen")) return;
    setOpen(true);
  }, [dismissed]);

  const close = useCallback(() => {
    setOpen(false);
    setDismissed(true);
    try {
      sessionStorage.setItem("yum_sample_popup_seen", "1");
    } catch {}
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("yum_sample_popup_seen")) return;

    // Klaviyo-style time delay: 8 seconds
    const timer = window.setTimeout(show, 8000);

    // Klaviyo-style scroll trigger: past 50% of the page
    const onScroll = () => {
      const denom = document.body.scrollHeight - window.innerHeight;
      const scrolled = denom > 0 ? window.scrollY / denom : 0;
      if (scrolled > 0.5) {
        show();
        window.removeEventListener("scroll", onScroll);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [show]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-label="Free sample offer"
    >
      <div
        className="relative w-full max-w-md rounded-3xl bg-[#0B0B0B] border border-white/10 p-8 text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-yum-pink/25 blur-[100px] pointer-events-none" />
        <button
          onClick={close}
          aria-label="Close"
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition"
        >
          ✕
        </button>

        <p className="relative uppercase tracking-[0.3em] text-yum-gold text-xs mb-3">
          Before you go
        </p>
        <h3 className="relative text-2xl font-bold text-white mb-3 leading-snug">
          Try the extract that&apos;s actually easy to drink.
        </h3>
        <p className="relative text-white/70 text-sm leading-relaxed mb-6">
          Now that you know what to look for, taste the difference for yourself.
          <span className="text-white font-semibold"> Lab-tested, standardized,</span> and no bitter
          aftertaste — in two flavors people actually come back for.
        </p>

        <Link
          href="/"
          onClick={close}
          className="relative block w-full rounded-full bg-yum-pink hover:bg-yum-pink-light transition py-4 font-bold text-white text-lg"
        >
          See the full range →
        </Link>
        <button
          onClick={close}
          className="relative mt-3 text-white/40 text-xs hover:text-white/70 transition"
        >
          No thanks, I&apos;ll keep reading
        </button>
      </div>
    </div>
  );
}
