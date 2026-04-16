"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  FlaskConical,
  Leaf,
  Truck,
  BadgeCheck,
  Sparkles,
  Zap,
  Clock,
  ChevronDown,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import MobileLogo from "@/components/MobileLogo";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";

const SAMPLE_OPTIONS = [
  {
    id: "bg",
    productHandle: "yum-bubble-gum-14ml-free-sample",
    couponCode: "FREESAMPLEBG14",
    flavor: "Bubble Gum",
    emoji: "🍬",
    tasteNote: "Sweet · Nostalgic",
    accent: "#E1258F",
    description:
      "Pink, playful, and unapologetically sweet — the one everyone asks for by name. Tastes like the candy aisle, hits like an extract shot.",
  },
  {
    id: "tb",
    productHandle: "yum-tropical-breeze-14ml-free-sample",
    couponCode: "FREESAMPLETB14",
    flavor: "Tropical Breeze",
    emoji: "🏝️",
    tasteNote: "Citrus · Refreshing",
    accent: "#22c55e",
    description:
      "Bright citrus meets mellow tropical fruit — a clean, refreshing finish for when you want something less sweet and more sunshine.",
  },
] as const;

const TRUST_BADGES = [
  { icon: FlaskConical, label: "Lab tested", sub: "Every batch" },
  { icon: Leaf, label: "No fillers", sub: "Clean formula" },
  { icon: ShieldCheck, label: "Made in USA", sub: "Quality controlled" },
  { icon: BadgeCheck, label: "Love it or refund", sub: "No questions" },
];

const FEATURES = [
  {
    icon: Zap,
    title: "Consistent potency",
    body:
      "Standardized extraction means every bottle hits the same way. No guessing, no variation batch to batch.",
    color: "#E1258F",
  },
  {
    icon: Sparkles,
    title: "Actually tastes good",
    body:
      "We spent months on the flavor. No bitter kratom aftertaste — just clean, sweet, drinkable shots.",
    color: "#22c55e",
  },
  {
    icon: FlaskConical,
    title: "Full transparency",
    body:
      "Third-party lab tested for purity, potency, and contaminants. Results published for every batch.",
    color: "#60a5fa",
  },
];

const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Pick your flavor",
    body: "Bubble Gum or Tropical Breeze. Both are customer favorites.",
  },
  {
    step: "2",
    title: "Cover shipping",
    body: "Your 14ml bottle is free — you just pay $8.99 shipping.",
  },
  {
    step: "3",
    title: "Try it on us",
    body: "Shake, sip, and decide for yourself. No subscription, no strings.",
  },
];

const FAQS = [
  {
    q: "What is kratom?",
    a: "Kratom is a plant from Southeast Asia (Mitragyna speciosa) that's been used traditionally for centuries. YUM uses a purified extract standardized for consistency. Start with a small serving to find your level.",
  },
  {
    q: "Is it legal where I live?",
    a: "Kratom is legal in most U.S. states. It's currently restricted in Alabama, Arkansas, Indiana, Rhode Island, Vermont, and Wisconsin. A few cities and counties have additional rules — check your local laws before ordering.",
  },
  {
    q: "How should I take a 14ml shot?",
    a: "Shake well. Start with half the bottle if you're new to kratom and wait 30–45 minutes before taking more. Don't exceed the serving on the label. Not intended for daily use.",
  },
  {
    q: "Why am I paying shipping if it's free?",
    a: "The bottle is genuinely free — we cover the product cost so you can try YUM with zero risk. Shipping is a flat $8.99 so we can get it to you quickly in protective packaging.",
  },
  {
    q: "What if I don't like it?",
    a: "Reach out and we'll refund your shipping. We want you to love YUM — if it's not for you, we'd rather know than have you stuck with it.",
  },
];

export default function FreeSamplePage() {
  const router = useRouter();
  const { clearCart, addToCart, applyCoupon, refreshCart } = useCart();
  const [selected, setSelected] = useState<(typeof SAMPLE_OPTIONS)[number]["id"]>("bg");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const selectedOption = SAMPLE_OPTIONS.find((o) => o.id === selected)!;

  const handleClaim = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      clearCart();
      await new Promise((resolve) => setTimeout(resolve, 350));

      const productRes = await fetch(`/api/products/${encodeURIComponent(selectedOption.productHandle)}`);
      if (!productRes.ok) throw new Error("Couldn’t load sample product");
      const productData = await productRes.json();
      const variantId = productData?.product?.variants?.[0]?.id;
      if (!variantId) throw new Error("Sample variant missing");

      await addToCart(String(variantId), 1, {
        free_sample_offer: true,
        free_sample_flavor: selectedOption.flavor,
      });
      await applyCoupon(selectedOption.couponCode);
      await refreshCart();
      router.push("/checkout?offer=free-sample");
    } catch (err) {
      console.error("[Free Sample] claim failed:", err);
      setError(err instanceof Error ? err.message : "Failed to claim sample");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen text-white relative" style={{
      background: "radial-gradient(ellipse at top, #2a1a14 0%, #120a08 40%, #080808 100%)"
    }}>
      <MobileLogo />
      <Navbar />

      {/* Promo banner */}
      <div className="pt-20 lg:pt-24">
        <div
          className="w-full text-center text-xs sm:text-sm py-2.5 px-4"
          style={{
            background: "linear-gradient(90deg, rgba(225,37,143,0.18) 0%, rgba(34,197,94,0.18) 100%)",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <span className="text-white/80">
            <span className="font-semibold text-white">Limited offer:</span> Free 14ml bottle — just cover shipping. One per customer.
          </span>
        </div>
      </div>

      {/* Hero */}
      <section className="relative pt-6 lg:pt-10 pb-16 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 -left-20 w-96 h-96 rounded-full bg-yum-pink/10 blur-[120px]" />
          <div className="absolute bottom-0 -right-20 w-96 h-96 rounded-full bg-green-500/10 blur-[120px]" />
        </div>

        {/* Hero banner image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative max-w-6xl mx-auto mb-10 lg:mb-16 rounded-3xl overflow-hidden"
          style={{ border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full">
            <Image
              src="/images/free-sample-hero.png"
              alt="YUM kratom bottles with tropical fruit"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 1152px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-yum-dark via-yum-dark/20 to-transparent" />
          </div>
        </motion.div>

        <div className="relative max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="uppercase tracking-[0.3em] text-white/50 text-xs mb-5">
              Try YUM — on us
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Your first bottle is <span className="text-yum-pink">free.</span>
              <br />
              <span className="text-white/80">You just cover shipping.</span>
            </h1>
            <p className="text-white/70 text-lg leading-relaxed mb-8 max-w-xl">
              Pick a flavor, we ship you a full 14ml bottle of YUM kratom extract — same formula we sell every day. Shake, sip, and decide for yourself.
            </p>

            <div className="flex flex-wrap items-center gap-6 text-sm text-white/60">
              <div className="flex items-center gap-2">
                <Truck size={18} className="text-yum-pink" />
                <span>Ships in 24–48h</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-yum-pink" />
                <span>No subscription</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-yum-pink" />
                <span>One per customer</span>
              </div>
            </div>
          </motion.div>

          {/* Flavor picker card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-3xl p-6 lg:p-8"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.12)",
              backdropFilter: "blur(10px)",
              boxShadow: "0 30px 80px -20px rgba(0,0,0,0.6)",
            }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-semibold">Pick your flavor</h2>
              <span className="text-[11px] uppercase tracking-widest text-white/40">Step 1 of 1</span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {SAMPLE_OPTIONS.map((option) => {
                const active = selected === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => setSelected(option.id)}
                    className="relative rounded-2xl p-5 text-left transition-all overflow-hidden group"
                    style={{
                      borderWidth: 2,
                      borderStyle: "solid",
                      borderColor: active ? option.accent : "rgba(255,255,255,0.08)",
                      background: active
                        ? `linear-gradient(135deg, ${option.accent}22 0%, ${option.accent}08 100%)`
                        : "rgba(255,255,255,0.02)",
                    }}
                  >
                    {/* Soft accent glow */}
                    <div
                      className="absolute -top-10 -right-10 w-24 h-24 rounded-full blur-2xl transition-opacity"
                      style={{
                        background: option.accent,
                        opacity: active ? 0.35 : 0.12,
                      }}
                    />

                    {/* Flavor disc */}
                    <div
                      className="relative w-14 h-14 rounded-full mb-4 flex items-center justify-center text-2xl transition-transform group-hover:scale-105"
                      style={{
                        background: `radial-gradient(circle at 30% 30%, ${option.accent} 0%, ${option.accent}cc 60%, ${option.accent}88 100%)`,
                        boxShadow: active
                          ? `0 8px 24px -4px ${option.accent}88, inset 0 1px 0 rgba(255,255,255,0.3)`
                          : `0 4px 12px -2px ${option.accent}44, inset 0 1px 0 rgba(255,255,255,0.2)`,
                      }}
                    >
                      <span>{option.emoji}</span>
                    </div>

                    <h3 className="font-semibold text-base mb-1">{option.flavor}</h3>
                    <p className="text-[11px] text-white/50 leading-tight">{option.tasteNote}</p>

                    {active && (
                      <div
                        className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ background: option.accent }}
                      >
                        ✓
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <p className="text-sm text-white/70 mb-5 leading-relaxed">{selectedOption.description}</p>

            <div className="flex items-center gap-3 mb-5">
              <span className="text-white/40 line-through">$14.99</span>
              <span className="font-bold" style={{ color: selectedOption.accent }}>
                FREE
              </span>
              <span className="text-white/40">+ $8.99 shipping</span>
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <button
              onClick={handleClaim}
              disabled={isSubmitting}
              className="w-full h-14 rounded-2xl font-semibold text-white transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg, #E1258F 0%, #FF4DA6 100%)" }}
            >
              {isSubmitting ? "Preparing your sample…" : `Claim ${selectedOption.flavor} Sample`}
            </button>

            <p className="text-white/40 text-xs mt-3 text-center">
              Your cart will reset to this offer only.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="py-10 px-4 border-y border-white/5 bg-white/[0.015]">
        <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6">
          {TRUST_BADGES.map((badge) => {
            const Icon = badge.icon;
            return (
              <div key={badge.label} className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "rgba(225,37,143,0.1)", border: "1px solid rgba(225,37,143,0.2)" }}
                >
                  <Icon size={20} className="text-yum-pink" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{badge.label}</p>
                  <p className="text-xs text-white/50">{badge.sub}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Why YUM */}
      <section className="py-20 lg:py-28 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-14 max-w-2xl mx-auto"
          >
            <p className="uppercase tracking-[0.3em] text-white/50 text-xs mb-4">Why YUM</p>
            <h2 className="text-3xl lg:text-5xl font-bold mb-5">
              Kratom extract, <span className="text-yum-pink">done right.</span>
            </h2>
            <p className="text-white/70 text-lg leading-relaxed">
              Most kratom products taste like grass and hit inconsistently. We built YUM to fix both.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-5">
            {FEATURES.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="rounded-3xl p-8"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                    style={{ background: `${feature.color}15`, border: `1px solid ${feature.color}30` }}
                  >
                    <Icon size={22} style={{ color: feature.color }} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-white/65 leading-relaxed">{feature.body}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* What is kratom */}
      <section className="py-20 lg:py-28 px-4 bg-white/[0.015] border-y border-white/5">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="uppercase tracking-[0.3em] text-white/50 text-xs mb-4">New to kratom?</p>
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              A quick primer before you try.
            </h2>
            <div className="space-y-4 text-white/70 leading-relaxed">
              <p>
                Kratom (Mitragyna speciosa) is a leafy plant from Southeast Asia. People have used it traditionally for hundreds of years. YUM extracts the active compounds from the leaf and standardizes the potency so every bottle is consistent.
              </p>
              <p>
                Our 14ml shots are meant for occasional use — not daily. Start small, wait, and find your level. Everyone reacts differently.
              </p>
            </div>
            <div
              className="mt-6 rounded-2xl p-4 text-sm text-white/60"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <strong className="text-white/80">Heads up:</strong> Not for use by people under 21, pregnant or nursing, or with existing medical conditions. Always consult a healthcare provider if you're unsure.
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative aspect-square rounded-3xl overflow-hidden"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <Image
              src="/images/pocket-size-1.jpg"
              alt="YUM 14ml bottle"
              fill
              className="object-cover"
            />
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 lg:py-28 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="uppercase tracking-[0.3em] text-white/50 text-xs mb-4">How it works</p>
            <h2 className="text-3xl lg:text-5xl font-bold">Three steps. That's it.</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="rounded-3xl p-8 text-center"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 text-xl font-bold"
                  style={{
                    background: "linear-gradient(135deg, #E1258F 0%, #FF4DA6 100%)",
                  }}
                >
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-white/65 leading-relaxed">{step.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quality proof */}
      <section className="py-20 lg:py-28 px-4 bg-white/[0.015] border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <div
            className="rounded-3xl p-8 lg:p-12 text-center"
            style={{
              background: "linear-gradient(135deg, rgba(225,37,143,0.08) 0%, rgba(34,197,94,0.05) 100%)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <FlaskConical size={44} className="text-yum-pink mx-auto mb-5" />
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Third-party tested. Every batch.
            </h2>
            <p className="text-white/70 text-lg leading-relaxed max-w-2xl mx-auto mb-8">
              We publish lab results for purity, potency, and contaminants. No mystery, no shortcuts. What's on the label is what's in the bottle.
            </p>
            <Link
              href="/lab-results"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white/90 hover:text-white transition-colors"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              View lab results →
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 lg:py-28 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="uppercase tracking-[0.3em] text-white/50 text-xs mb-4">Questions?</p>
            <h2 className="text-3xl lg:text-5xl font-bold">We've got answers.</h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={i}
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full p-5 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors"
                  >
                    <span className="font-semibold pr-4">{faq.q}</span>
                    <ChevronDown
                      size={20}
                      className="text-white/50 shrink-0 transition-transform"
                      style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0)" }}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-white/70 leading-relaxed">{faq.a}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 lg:py-28 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-3xl p-10 lg:p-14"
            style={{
              background: "linear-gradient(135deg, rgba(225,37,143,0.15) 0%, rgba(255,77,166,0.08) 100%)",
              border: "1px solid rgba(225,37,143,0.3)",
            }}
          >
            <h2 className="text-3xl lg:text-5xl font-bold mb-5">Ready to try YUM?</h2>
            <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">
              Your {selectedOption.flavor} sample is ready. One click, cover shipping, done.
            </p>
            <button
              onClick={handleClaim}
              disabled={isSubmitting}
              className="inline-flex items-center justify-center h-14 px-10 rounded-2xl font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg, #E1258F 0%, #FF4DA6 100%)" }}
            >
              {isSubmitting ? "Preparing your sample…" : `Claim my ${selectedOption.flavor} sample`}
            </button>
            <p className="text-white/40 text-xs mt-5">
              Prefer the regular store? <Link href="/collections" className="underline hover:text-white/70">Shop normally</Link>
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
