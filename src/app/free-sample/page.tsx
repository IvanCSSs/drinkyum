"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
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
    image: "/images/product-1.png",
    accent: "#E1258F",
    description: "Classic sweet Bubble Gum in a pocket-size 14ml bottle.",
  },
  {
    id: "tb",
    productHandle: "yum-tropical-breeze-14ml-free-sample",
    couponCode: "FREESAMPLETB14",
    flavor: "Tropical Breeze",
    image: "/images/product-2.png",
    accent: "#22c55e",
    description: "Bright tropical citrus and fruit notes in a pocket-size 14ml bottle.",
  },
] as const;

export default function FreeSamplePage() {
  const router = useRouter();
  const { clearCart, addToCart, applyCoupon, refreshCart } = useCart();
  const [selected, setSelected] = useState<(typeof SAMPLE_OPTIONS)[number]["id"]>("bg");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <main className="min-h-screen bg-yum-dark text-white relative">
      <MobileLogo />
      <Navbar />

      <section className="pt-28 lg:pt-36 pb-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="uppercase tracking-[0.3em] text-white/50 text-xs mb-4">Limited Offer</p>
            <h1 className="text-4xl lg:text-6xl font-bold mb-4">Claim Your Free 14ml Sample</h1>
            <p className="text-white/70 text-lg max-w-2xl mx-auto">
              Pick your flavor. Your 14ml bottle is free — you just cover shipping.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-10">
            {SAMPLE_OPTIONS.map((option) => {
              const active = selected === option.id;
              return (
                <button
                  key={option.id}
                  onClick={() => setSelected(option.id)}
                  className="rounded-3xl p-6 text-left transition-all border"
                  style={{
                    borderColor: active ? option.accent : "rgba(255,255,255,0.12)",
                    background: active ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)",
                    boxShadow: active ? `0 0 0 1px ${option.accent} inset` : "none",
                  }}
                >
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-black/20 mb-5">
                    <Image src={option.image} alt={option.flavor} fill className="object-contain p-6" />
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-semibold">{option.flavor}</h2>
                    {active && <span className="text-sm font-medium" style={{ color: option.accent }}>Selected</span>}
                  </div>
                  <p className="text-white/65 mb-4">{option.description}</p>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="line-through text-white/35">$14.99</span>
                    <span className="font-semibold" style={{ color: option.accent }}>FREE + Shipping</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="max-w-2xl mx-auto rounded-3xl border border-white/10 bg-white/5 p-6 lg:p-8 text-center">
            <div className="grid sm:grid-cols-3 gap-4 mb-6 text-sm text-white/75">
              <div>• 1 bottle only</div>
              <div>• Shipping charged at checkout</div>
              <div>• Not stackable with other offers</div>
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <button
              onClick={handleClaim}
              disabled={isSubmitting}
              className="w-full h-14 rounded-2xl font-semibold text-white transition-all disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #E1258F 0%, #FF4DA6 100%)" }}
            >
              {isSubmitting ? "Preparing your sample…" : `Claim ${selectedOption.flavor} Free Sample`}
            </button>

            <p className="text-white/45 text-xs mt-4">
              By continuing, your cart will be reset to this sample offer only.
            </p>
            <p className="text-white/45 text-xs mt-2">
              Want the regular store instead? <Link href="/collections" className="underline">Shop normally</Link>
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
