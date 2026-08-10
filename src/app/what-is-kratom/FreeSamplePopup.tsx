"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";

/**
 * Engagement popup for the kratom education page.
 * Fires on: (1) scroll past ~35% of the article, or (2) exit-intent (mouse to top),
 * whichever comes first — then never again this session (sessionStorage).
 * Goal: capture the reader who's now educated + curious with the free-sample offer.
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

    // Scroll trigger — past 35% of the page
    const onScroll = () => {
      const scrolled = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      if (scrolled > 0.35) {
        show();
        window.removeEventListener("scroll", onScroll);
      }
    };
    // Exit-intent trigger — mouse leaves toward the top (desktop)
    const onMouseOut = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        show();
        document.removeEventListener("mouseout", onMouseOut);
      }
    };
    // Time fallback — 40s in, if still reading
    const timer = window.setTimeout(show, 40000);

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("mouseout", onMouseOut);
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("mouseout", onMouseOut);
      window.clearTimeout(timer);
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
          Try the extract that&apos;s actually easy to drink — free.
        </h3>
        <p className="relative text-white/70 text-sm leading-relaxed mb-6">
          Now that you know what to look for, taste the difference for yourself.
          A full 14ml YUM bottle — <span className="text-white font-semibold">just cover shipping.</span>{" "}
          No bitter aftertaste, lab-tested, one per customer.
        </p>

        <Link
          href="/free-sample"
          onClick={close}
          className="relative block w-full rounded-full bg-yum-pink hover:bg-yum-pink-light transition py-4 font-bold text-white text-lg"
        >
          Claim my free sample →
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
