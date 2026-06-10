"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, X, Plus, Minus } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

type Product = {
  name: string;
  size: string;
  price: number;
  variantId: string;
  image: string;
  alt: string;
};

const REVIEWS = [
  {
    text: "I am amazed! What a first experience this was. Extremely relaxing without any odd side effects. A natural yet pure feeling. Thank you YUM.",
    author: "Samantha R.",
    stars: 5,
  },
  {
    text: "Best flavor so far. Best performing botanical shot I have tried. Other supplements pale in comparison.",
    author: "Brett M.",
    stars: 5,
  },
  {
    text: "These shots are great. I love the fact that they help me relax and unwind without compromising alertness or focus.",
    author: "Galilee T.",
    stars: 5,
  },
  {
    text: "YUM has been a saving grace since I don't enjoy alc🍺hol or other alternatives, but still want to feel something. The flavors are amazing.",
    author: "Bridget K.",
    stars: 5,
  },
  {
    text: "Loved it! Phenomenal flavor and not like anything else on the market.",
    author: "Paige L.",
    stars: 5,
  },
  {
    text: "Love these so much. Great alternative to relax with.",
    author: "Myles D.",
    stars: 5,
  },
];

const INGREDIENTS = [
  {
    emoji: "🌿",
    name: "KR🌀TOM — MITRAGYNA SPECIOSA",
    label: "Ancient Plant Extract",
    desc: "Kr🌀tom leaf grows on a tropical evergreen tree native to Southeast Asia. Used for centuries for its natural properties.",
  },
  {
    emoji: "🌺",
    name: "KAVA — PIPER METHYSTICUM",
    label: "Rooted in Tradition",
    desc: "A Polynesian root used for centuries in rituals and social settings. Promotes calm, relaxation, and mild euphoria.",
  },
  {
    emoji: "🍵",
    name: "GREEN TEA — CAMELLIA SINENSIS",
    label: "Natural Energy",
    desc: "An ancient beverage enjoyed globally for centuries, known to enhance alertness and provide antioxidant benefits.",
  },
];

function Stars({ n }: { n: number }) {
  return <span className="text-yellow-400 text-sm">{"★".repeat(n)}</span>;
}

export default function CloakHomeClient({ products }: { products: Product[] }) {
  const [cartOpen, setCartOpen] = useState(false);
  const [reviewIdx, setReviewIdx] = useState(0);
  const { cart, addToCart, updateQuantity, removeItem, isAddingToCart } = useCart();

  const cartCount = cart?.items?.reduce((s, i) => s + i.quantity, 0) ?? 0;

  const handleAdd = async (product: Product) => {
    await addToCart(product.variantId, 1);
    setCartOpen(true);
  };

  return (
    <div className="min-h-screen bg-yum-dark text-white font-sans">

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
        style={{ background: "rgba(8,8,8,0.92)", backdropFilter: "blur(8px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <span className="text-xl font-bold tracking-tight">YUM</span>
        <button
          onClick={() => setCartOpen(true)}
          className="relative p-2 rounded-full hover:bg-white/10 transition-colors"
          aria-label="Open cart"
        >
          <ShoppingCart size={22} />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center text-white"
              style={{ background: "#E1258F" }}>
              {cartCount}
            </span>
          )}
        </button>
      </header>

      {/* Hero */}
      <section className="relative flex flex-col items-center text-center px-6 pt-16 sm:pt-20 pb-20 overflow-hidden">
        {/* Pink blur glow — sits behind everything */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-[120px]"
            style={{ background: "radial-gradient(ellipse, rgba(225,37,143,0.18) 0%, transparent 70%)" }} />
        </div>

        {/* Eyebrow + headline */}
        <p className="relative z-10 uppercase tracking-[0.3em] text-white/50 text-xs mb-5">Feel Something Real</p>
        <h1 className="relative z-10 text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-2 max-w-3xl">
          The Botanical<br />
          <span style={{ color: "#E1258F" }}>Extract Shot.</span>
        </h1>

        {/* Bottle — in the flow, between headline and tagline so the page
            reads: title → bottle → tagline → CTA. Tight gap above ties
            the bottle visually to the headline. */}
        <div className="relative z-10 -mt-2 mb-6 flex justify-center">
          <Image
            src="/images/hero-product.png"
            alt=""
            width={112}
            height={336}
            priority
            className="object-contain drop-shadow-[0_20px_60px_rgba(225,37,143,0.45)]"
            style={{
              transform: "rotate(12deg)",
              maxWidth: "none",
            }}
          />
        </div>

        {/* Tagline below the bottle */}
        <p className="relative z-10 text-white/85 text-lg sm:text-xl max-w-xl mb-8 leading-relaxed text-center">
          Powered by ancient plants for effects you can actually feel. Sip intentionally, savor fully, enjoy responsibly.
        </p>

        {/* CTA */}
        <button
          onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })}
          className="relative z-10 h-14 px-10 rounded-full font-semibold text-white text-lg transition-all hover:scale-[1.03] active:scale-[0.98] shadow-[0_10px_30px_rgba(225,37,143,0.4)]"
          style={{ background: "linear-gradient(135deg, #E1258F 0%, #FF4DA6 100%)" }}
        >
          Experience It Now
        </button>
      </section>

      {/* Products */}
      <section id="products" className="max-w-5xl mx-auto px-6 pb-24">
        <p className="text-center text-white/50 uppercase tracking-widest text-xs mb-3">Find Your YUM</p>
        <h2 className="text-center text-3xl font-bold mb-4">Your invitation into the moment</h2>
        <p className="text-center text-white/60 max-w-lg mx-auto mb-12 leading-relaxed">
          A botanical extract shot with effects you can actually feel. Powered by ancient plants for a unique experience.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((p) => (
            <div
              key={p.variantId}
              className="group relative rounded-[20px] p-2 flex flex-col"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {/* Image — fills the square via object-cover, hover-scales like .com */}
              <div className="relative aspect-square w-full overflow-hidden rounded-[14px]"
                style={{ background: "rgba(255,255,255,0.02)" }}>
                <Image
                  src={p.image || "/images/product-1.png"}
                  alt={p.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.08]"
                  style={{ transform: "scale(1.05)" }}
                />
              </div>

              {/* Card body */}
              <div className="flex flex-col flex-1 gap-3 px-2 pt-3 pb-2">
                <div>
                  <h3
                    className="text-sm font-medium leading-[1.25] line-clamp-2"
                    style={{
                      background: "linear-gradient(180deg, #FFFFFF 0%, #999999 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {p.name}
                  </h3>
                  <p className="text-white/40 text-[11px] uppercase tracking-wider mt-1">
                    {p.size} · Botanical Extract Shot
                  </p>
                </div>

                <span className="text-[15px] font-bold" style={{ color: "#E12590" }}>
                  ${p.price.toFixed(2)}
                </span>

                <button
                  onClick={() => handleAdd(p)}
                  disabled={isAddingToCart}
                  className="mt-auto h-10 rounded-[10px] font-semibold text-white text-sm transition-all hover:opacity-90 disabled:opacity-60"
                  style={{
                    background: "linear-gradient(135deg, #E1258F 0%, #FF4DA6 100%)",
                  }}
                >
                  {isAddingToCart ? "Adding…" : "Add to Cart"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Reviews */}
      <section className="px-6 pb-24 max-w-3xl mx-auto">
        <div className="rounded-3xl p-8 text-center relative overflow-hidden"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <Stars n={REVIEWS[reviewIdx].stars} />
          <p className="text-white/80 text-lg leading-relaxed mt-4 mb-4 italic">
            &ldquo;{REVIEWS[reviewIdx].text}&rdquo;
          </p>
          <p className="text-white/50 text-sm font-semibold">— {REVIEWS[reviewIdx].author}</p>
          <div className="flex items-center justify-center gap-2 mt-6">
            {REVIEWS.map((_, i) => (
              <button key={i} onClick={() => setReviewIdx(i)}
                className="w-2 h-2 rounded-full transition-all"
                style={{ background: i === reviewIdx ? "#E1258F" : "rgba(255,255,255,0.2)" }} />
            ))}
          </div>
        </div>
      </section>

      {/* How it works — 3-step ritual */}
      <section className="px-6 pb-24 max-w-5xl mx-auto">
        <p className="text-center text-white/50 uppercase tracking-widest text-xs mb-3">The Ritual</p>
        <h2 className="text-center text-3xl font-bold mb-12">Sip. Feel. Flow.</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { num: "01", title: "Sip the Botanicals", desc: "A 30ml shot of ancient plants. No mixing, no waiting." },
            { num: "02", title: "Feel the Shift", desc: "Effects start within 15–20 minutes. Smooth, clear, present." },
            { num: "03", title: "Find Your Flow", desc: "Stay sharp. Stay social. Or quietly enjoy the moment." },
          ].map((step) => (
            <div key={step.num} className="rounded-3xl p-6 text-center relative overflow-hidden"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <span className="block text-6xl font-bold mb-4" style={{ color: "rgba(225,37,143,0.35)" }}>{step.num}</span>
              <h3 className="font-semibold text-lg mb-3">{step.title}</h3>
              <p className="text-white/60 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Ingredients */}
      <section className="px-6 pb-24 max-w-4xl mx-auto">
        <p className="text-center text-white/50 uppercase tracking-widest text-xs mb-3">What&apos;s Inside</p>
        <h2 className="text-center text-3xl font-bold mb-12">Ancient plants. Real effects.</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {INGREDIENTS.map((ing) => (
            <div key={ing.name} className="rounded-3xl p-6 text-center"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="text-5xl mb-4">{ing.emoji}</div>
              <p className="text-white/40 text-[10px] uppercase tracking-widest mb-2">{ing.label}</p>
              <h3 className="font-semibold text-sm mb-3">{ing.name}</h3>
              <p className="text-white/60 text-sm leading-relaxed">{ing.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Value props */}
      <section className="px-6 pb-24 max-w-5xl mx-auto">
        <p className="text-center text-white/50 uppercase tracking-widest text-xs mb-3">Thoughtfully Made</p>
        <h2 className="text-center text-3xl font-bold mb-12">A botanical experience.</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: "Ancient Plants", desc: "Traditional botanicals, modern purpose." },
            { title: "Crafted for 21+", desc: "Mindful sipping for adults." },
            { title: "Lab Tested", desc: "Every batch independently verified." },
            { title: "Choose Your Moment", desc: "On the couch, at the party, in the studio." },
          ].map((v) => (
            <div key={v.title} className="rounded-2xl p-5 text-center"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <h3 className="font-semibold text-base mb-2">{v.title}</h3>
              <p className="text-white/60 text-sm leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="text-center px-6 pb-24">
        <h2 className="text-4xl font-bold mb-4">Ready to feel it?</h2>
        <p className="text-white/60 mb-8">Join thousands who made the switch.</p>
        <button
          onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })}
          className="h-14 px-10 rounded-full font-semibold text-white text-lg transition-all hover:scale-[1.03]"
          style={{ background: "linear-gradient(135deg, #E1258F 0%, #FF4DA6 100%)" }}
        >
          Shop Now
        </button>
      </section>

      {/* Footer */}
      <footer className="border-t px-6 py-8 text-center text-white/40 text-xs"
        style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <p className="mb-3">
          <Link href="/privacy" className="hover:text-white/70 mr-4 transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-white/70 transition-colors">Terms &amp; Conditions</Link>
        </p>
        <p className="mb-3 max-w-2xl mx-auto leading-relaxed">
          Disclaimer: These statements have not been evaluated by the Food and Drug Administration. These products are not intended to diagnose, treat, cure or prevent any diseases. These products are not for use by or sale to persons under the age of 21. Consult with a physician before use if you have a serious medical condition or use prescription medications. Void where prohibited by law.
        </p>
        <p>© {new Date().getFullYear()} DrinkYUM. All rights reserved.</p>
      </footer>

      {/* Cart Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/60" onClick={() => setCartOpen(false)} />
          <div className="w-full max-w-sm bg-[#111] flex flex-col h-full shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
              <h2 className="font-semibold text-lg">Your Cart</h2>
              <button onClick={() => setCartOpen(false)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {!cart?.items?.length ? (
                <p className="text-white/50 text-sm text-center py-12">Your cart is empty.</p>
              ) : (
                cart.items.map((item) => {
                  // Match item back to the cloak product (we only have 2 SKUs)
                  // so we can show a thumbnail in the drawer.
                  const product = products.find(
                    (p) => p.variantId === String(item.variant_id),
                  );
                  return (
                  <div key={item.id} className="flex gap-3 items-start">
                    {product?.image ? (
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0"
                        style={{ background: "rgba(255,255,255,0.04)" }}>
                        <Image
                          src={product.image}
                          alt={product.alt}
                          fill
                          sizes="56px"
                          className="object-contain p-1"
                        />
                      </div>
                    ) : null}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm leading-tight">{item.title}</p>
                      <p className="text-white/50 text-xs mt-1">${item.unit_price?.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => item.quantity <= 1 ? removeItem(item.id) : updateQuantity(item.id, item.quantity - 1)}
                        className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
                        <Minus size={12} />
                      </button>
                      <span className="text-sm w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                  );
                })
              )}
            </div>
            {cart?.items?.length ? (
              <div className="p-5 border-t space-y-3" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Subtotal</span>
                  <span className="font-semibold">${cart.total?.toFixed(2)}</span>
                </div>
                <Link href="/need-to-know"
                  onClick={() => setCartOpen(false)}
                  className="block w-full h-12 rounded-full font-semibold text-white text-sm text-center leading-[48px] transition-all hover:scale-[1.02]"
                  style={{ background: "linear-gradient(135deg, #E1258F 0%, #FF4DA6 100%)" }}>
                  Checkout
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
