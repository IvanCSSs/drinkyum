"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, X, Plus, Minus, ChevronDown, Check } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

type SampleOption = {
	id: "bg" | "tb";
	variantId: string;
	productHandle: string;
	couponCode: string;
	flavor: string;
	image: string;
	tasteNote: string;
	accent: string;
	description: string;
};

type Props = {
	sampleOptions: SampleOption[];
};

const REVIEWS = [
	{
		text: "I am amazed. Extremely relaxing without any odd side effects. A natural yet pure feeling. Thank you YUM.",
		author: "Samantha R.",
	},
	{
		text: "Best flavor so far. Best performing botanical shot I have tried. Other supplements pale in comparison.",
		author: "Brett M.",
	},
	{
		text: "Helps me relax and unwind without compromising alertness or focus.",
		author: "Galilee T.",
	},
	{
		text: "A saving grace since I don't enjoy alc🍺hol or other alternatives, but still want to feel something. The flavors are amazing.",
		author: "Bridget K.",
	},
	{
		text: "Loved it. Phenomenal flavor and not like anything else on the market.",
		author: "Paige L.",
	},
	{
		text: "Love these so much. Great alternative to relax with.",
		author: "Myles D.",
	},
];

const STACK_UP = {
	yum: [
		"Real botanical effects",
		"Balanced, focused calm",
		"Plant-based ingredients",
		"Lab tested every batch",
		"No jitters, no crash",
	],
	others: [
		"Energy spikes",
		"Jitters & fog",
		"Artificial ingredients",
		"One-size-fits-all dosing",
		"Sleep disruption",
	],
};

const FAQS = [
	{
		q: "What is YUM?",
		a: "A 14ml botanical extract shot powered by ancient plants. Designed for moments when you want to feel something real — without alc🍺hol or stimulants.",
	},
	{
		q: "How does the free sample work?",
		a: "Pick a flavor, cover the small shipping fee, and we'll send you a single 14ml bottle. No subscription, no gimmick. Try it, decide for yourself.",
	},
	{
		q: "Is this safe?",
		a: "Each batch is third-party lab tested. Not evaluated by the FDA — this isn't a medicine, it's a botanical shot for adults 21+. Don't use if pregnant, nursing, or on medication.",
	},
	{
		q: "How long until I feel it?",
		a: "Most people feel the shift within 15–20 minutes. Effects last roughly 2–4 hours depending on your body and what else is in your system.",
	},
	{
		q: "Can I drink alc🍺hol with it?",
		a: "We don't recommend mixing. People come to YUM specifically as an alternative — and most find they don't want both.",
	},
	{
		q: "What if I don't love it?",
		a: "Reach out. We're a small team and we'd rather make it right than have a customer who's unhappy.",
	},
];

export default function CloakHomeClient({ sampleOptions }: Props) {
	const router = useRouter();
	const { cart, addToCart, applyCoupon, clearCart, refreshCart, updateQuantity, removeItem, isAddingToCart } = useCart();

	const [selectedId, setSelectedId] = useState<SampleOption["id"]>(sampleOptions[0].id);
	const [cartOpen, setCartOpen] = useState(false);
	const [reviewIdx, setReviewIdx] = useState(0);
	const [openFaq, setOpenFaq] = useState<number | null>(0);
	const [claiming, setClaiming] = useState(false);
	const [claimError, setClaimError] = useState<string | null>(null);

	const selected = sampleOptions.find((o) => o.id === selectedId) ?? sampleOptions[0];
	const cartCount = cart?.items?.reduce((s, i) => s + i.quantity, 0) ?? 0;

	const handleClaim = async () => {
		if (claiming) return;
		setClaiming(true);
		setClaimError(null);

		try {
			clearCart();
			await new Promise((r) => setTimeout(r, 250));

			await addToCart(selected.variantId, 1, {
				free_sample_offer: true,
				free_sample_flavor: selected.flavor,
			});
			await applyCoupon(selected.couponCode);
			await refreshCart();

			// Cloak users always pass through the compliance gate before
			// the .com checkout handoff. /need-to-know reads the cart on
			// mount and signs the handoff token.
			router.push("/need-to-know");
		} catch (err) {
			console.error("[cloak] claim failed:", err);
			setClaimError(
				err instanceof Error ? err.message : "Couldn't claim your sample. Try again.",
			);
			setClaiming(false);
		}
	};

	return (
		<div className="min-h-screen bg-yum-dark text-white font-sans">
			{/* ============================= HEADER ============================= */}
			<header className="fixed top-5 sm:top-8 left-0 right-0 z-50 px-4 sm:px-8">
				<div
					className="max-w-[1200px] mx-auto flex items-center justify-between px-4 sm:px-6 py-3 sm:py-[14px] rounded-xl relative overflow-hidden"
					style={{
						background: "rgba(1, 6, 25, 0.45)",
						backdropFilter: "blur(20px)",
						WebkitBackdropFilter: "blur(20px)",
					}}
				>
					<div
						className="absolute inset-0 rounded-xl pointer-events-none"
						style={{
							padding: "1px",
							background:
								"radial-gradient(ellipse at top center, rgba(225, 37, 143, 0.8) 0%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.05) 100%)",
							mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
							maskComposite: "xor",
							WebkitMask:
								"linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
							WebkitMaskComposite: "xor",
						}}
					/>
					<Link href="/" className="flex-shrink-0 relative z-10" aria-label="YUM home">
						<Image
							src="/images/logo.svg"
							alt="YUM"
							width={100}
							height={28}
							className="h-7 w-auto"
							priority
						/>
					</Link>
					<button
						onClick={() => setCartOpen(true)}
						className="relative z-10 p-2 rounded-full hover:bg-white/10 transition-colors"
						aria-label="Open cart"
					>
						<ShoppingCart size={22} />
						{cartCount > 0 && (
							<span
								className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center text-white"
								style={{ background: "#E1258F" }}
							>
								{cartCount}
							</span>
						)}
					</button>
				</div>
			</header>

			{/* ============================= HERO ============================= */}
			<section className="relative px-6 pt-32 sm:pt-36 pb-20 overflow-hidden">
				<div className="absolute inset-0 pointer-events-none z-0">
					<div
						className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full blur-[140px]"
						style={{
							background:
								"radial-gradient(ellipse, rgba(225,37,143,0.22) 0%, transparent 70%)",
						}}
					/>
				</div>

				<div className="relative z-10 max-w-5xl mx-auto grid lg:grid-cols-2 gap-10 items-center">
					{/* Left: copy + flavor picker + CTA */}
					<div>
						<p className="uppercase tracking-[0.3em] text-white/50 text-xs mb-5">
							Feel Something Real
						</p>
						<h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] mb-5">
							Your first one is{" "}
							<span style={{ color: "#E1258F" }}>on us.</span>
						</h1>
						<p className="text-white/75 text-lg mb-8 leading-relaxed max-w-lg">
							A botanical extract shot powered by ancient plants. Pick a flavor — we'll cover the bottle, you cover shipping.
						</p>

						{/* Flavor picker */}
						<div className="grid grid-cols-2 gap-3 mb-6">
							{sampleOptions.map((opt) => {
								const isSelected = selectedId === opt.id;
								return (
									<button
										key={opt.id}
										onClick={() => setSelectedId(opt.id)}
										className="relative rounded-2xl p-4 text-left transition-all"
										style={{
											background: isSelected
												? "rgba(255,255,255,0.08)"
												: "rgba(255,255,255,0.03)",
											border: isSelected
												? `2px solid ${opt.accent}`
												: "2px solid rgba(255,255,255,0.08)",
										}}
									>
										{isSelected && (
											<div
												className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center"
												style={{ background: opt.accent }}
											>
												<Check size={12} className="text-white" />
											</div>
										)}
										<div className="text-base font-semibold">{opt.flavor}</div>
										<div className="text-white/50 text-xs mt-1">{opt.tasteNote}</div>
									</button>
								);
							})}
						</div>

						{claimError && (
							<div className="mb-4 rounded-xl border border-red-400/30 bg-red-500/10 text-red-200 text-sm px-4 py-3">
								{claimError}
							</div>
						)}

						<button
							onClick={handleClaim}
							disabled={claiming || isAddingToCart}
							className="w-full sm:w-auto h-14 px-10 rounded-full font-semibold text-white text-base sm:text-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100 shadow-[0_10px_30px_rgba(225,37,143,0.4)]"
							style={{
								background: "linear-gradient(135deg, #E1258F 0%, #FF4DA6 100%)",
							}}
						>
							{claiming ? "Setting up your sample…" : `Claim my ${selected.flavor}`}
						</button>

						<p className="text-white/40 text-xs mt-3">
							Just cover shipping · 21+ only · One per customer
						</p>
					</div>

					{/* Right: product image — local asset, instant load */}
					<div className="relative flex items-center justify-center min-h-[400px]">
						<div
							className="absolute inset-0 rounded-full blur-[80px] opacity-50"
							style={{
								background: `radial-gradient(circle, ${selected.accent}55 0%, transparent 60%)`,
							}}
						/>
						<Image
							src={selected.image}
							alt={`${selected.flavor} bottle`}
							width={420}
							height={420}
							priority
							className="relative object-contain drop-shadow-[0_30px_80px_rgba(225,37,143,0.35)]"
						/>
					</div>
				</div>
			</section>

			{/* ============================= WHAT'S INSIDE ============================= */}
			<section className="px-6 pb-24 max-w-5xl mx-auto">
				<p className="text-center text-white/50 uppercase tracking-widest text-xs mb-3">
					What's Inside
				</p>
				<h2 className="text-center text-3xl sm:text-4xl font-bold mb-12">
					Ancient plants. Real effects.
				</h2>
				<div className="grid sm:grid-cols-3 gap-5">
					{[
						{
							emoji: "🌿",
							name: "KR🌀TOM",
							label: "Mitragyna Speciosa",
							desc: "A tropical leaf used for centuries in Southeast Asia for its natural balancing properties.",
						},
						{
							emoji: "🌺",
							name: "KAVA",
							label: "Piper Methysticum",
							desc: "A Polynesian root used in social rituals. Promotes calm, relaxation, mild euphoria.",
						},
						{
							emoji: "🍵",
							name: "GREEN TEA",
							label: "Camellia Sinensis",
							desc: "Globally enjoyed for centuries. Adds gentle, clean energy and antioxidants.",
						},
					].map((ing) => (
						<div
							key={ing.name}
							className="rounded-3xl p-6 text-center"
							style={{
								background: "rgba(255,255,255,0.03)",
								border: "1px solid rgba(255,255,255,0.08)",
							}}
						>
							<div className="text-5xl mb-4">{ing.emoji}</div>
							<p className="text-white/40 text-[10px] uppercase tracking-widest mb-2">
								{ing.label}
							</p>
							<h3 className="font-semibold text-base mb-3">{ing.name}</h3>
							<p className="text-white/60 text-sm leading-relaxed">{ing.desc}</p>
						</div>
					))}
				</div>
			</section>

			{/* ============================= SIP THE RITUAL ============================= */}
			<section className="px-6 pb-24 max-w-5xl mx-auto">
				<p className="text-center text-white/50 uppercase tracking-widest text-xs mb-3">
					The Ritual
				</p>
				<h2 className="text-center text-3xl sm:text-4xl font-bold mb-12">
					Sip. Feel. Flow.
				</h2>
				<div className="grid sm:grid-cols-3 gap-5">
					{[
						{
							num: "01",
							title: "Sip the Botanicals",
							desc: "A 14ml shot of ancient plants. No mixing, no waiting, no aftertaste.",
						},
						{
							num: "02",
							title: "Feel the Shift",
							desc: "Within 15–20 minutes the botanicals work in. Smooth, present, clear.",
						},
						{
							num: "03",
							title: "Find Your Flow",
							desc: "Stay sharp. Stay social. Or quietly enjoy the moment, your way.",
						},
					].map((step) => (
						<div
							key={step.num}
							className="rounded-3xl p-6 text-center relative overflow-hidden"
							style={{
								background: "rgba(255,255,255,0.03)",
								border: "1px solid rgba(255,255,255,0.08)",
							}}
						>
							<span
								className="block text-6xl font-bold mb-4"
								style={{ color: "rgba(225,37,143,0.35)" }}
							>
								{step.num}
							</span>
							<h3 className="font-semibold text-lg mb-3">{step.title}</h3>
							<p className="text-white/60 text-sm leading-relaxed">{step.desc}</p>
						</div>
					))}
				</div>
			</section>

			{/* ============================= BOTANICAL EXPERIENCE ============================= */}
			<section className="px-6 pb-24 max-w-5xl mx-auto">
				<p className="text-center text-white/50 uppercase tracking-widest text-xs mb-3">
					Thoughtfully Made
				</p>
				<h2 className="text-center text-3xl sm:text-4xl font-bold mb-12">
					A botanical experience.
				</h2>
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
					{[
						{
							title: "Ancient Plants, Modern Purpose",
							desc: "Rooted in centuries-old rituals — Kr🌀tom, Kava, Green Tea.",
						},
						{
							title: "Crafted for 21+",
							desc: "Mindful sipping for adults. No noise. No compromise.",
						},
						{
							title: "Organic, Natural Ingredients",
							desc: "Real plant extracts. Nothing synthetic, nothing artificial.",
						},
						{
							title: "Choose Your Moment",
							desc: "Solo evening or social gathering — each shot fits in.",
						},
					].map((v) => (
						<div
							key={v.title}
							className="rounded-2xl p-5"
							style={{
								background: "rgba(255,255,255,0.03)",
								border: "1px solid rgba(255,255,255,0.08)",
							}}
						>
							<h3 className="font-semibold text-sm mb-2">{v.title}</h3>
							<p className="text-white/60 text-xs leading-relaxed">{v.desc}</p>
						</div>
					))}
				</div>
			</section>

			{/* ============================= REVIEWS ============================= */}
			<section className="px-6 pb-24 max-w-3xl mx-auto">
				<p className="text-center text-white/50 uppercase tracking-widest text-xs mb-3">
					Real People, Real Effects
				</p>
				<h2 className="text-center text-3xl sm:text-4xl font-bold mb-10">
					What customers are saying.
				</h2>
				<div
					className="rounded-3xl p-8 text-center relative overflow-hidden"
					style={{
						background: "rgba(255,255,255,0.03)",
						border: "1px solid rgba(255,255,255,0.08)",
					}}
				>
					<span className="text-yellow-400 text-lg block mb-3">★★★★★</span>
					<p className="text-white/85 text-lg leading-relaxed mb-4 italic">
						&ldquo;{REVIEWS[reviewIdx].text}&rdquo;
					</p>
					<p className="text-white/50 text-sm font-semibold">
						— {REVIEWS[reviewIdx].author}
					</p>
					<div className="flex items-center justify-center gap-2 mt-6">
						{REVIEWS.map((_, i) => (
							<button
								key={i}
								onClick={() => setReviewIdx(i)}
								aria-label={`Show review ${i + 1}`}
								className="w-2 h-2 rounded-full transition-all"
								style={{
									background:
										i === reviewIdx ? "#E1258F" : "rgba(255,255,255,0.2)",
								}}
							/>
						))}
					</div>
				</div>
			</section>

			{/* ============================= HOW WE STACK UP ============================= */}
			<section className="px-6 pb-24 max-w-4xl mx-auto">
				<p className="text-center text-white/50 uppercase tracking-widest text-xs mb-3">
					Comparison
				</p>
				<h2 className="text-center text-3xl sm:text-4xl font-bold mb-12">
					How we stack up.
				</h2>
				<div
					className="rounded-3xl overflow-hidden"
					style={{
						background: "rgba(255,255,255,0.03)",
						border: "1px solid rgba(255,255,255,0.08)",
					}}
				>
					<div className="grid grid-cols-2">
						<div className="p-6 sm:p-8 border-r border-white/10">
							<p className="uppercase tracking-widest text-xs mb-4 font-semibold" style={{ color: "#E1258F" }}>
								YUM
							</p>
							<ul className="space-y-3">
								{STACK_UP.yum.map((item) => (
									<li key={item} className="flex items-start gap-2 text-sm text-white/85">
										<Check size={16} className="mt-0.5 flex-shrink-0" style={{ color: "#E1258F" }} />
										<span>{item}</span>
									</li>
								))}
							</ul>
						</div>
						<div className="p-6 sm:p-8">
							<p className="uppercase tracking-widest text-xs mb-4 text-white/50 font-semibold">
								Others
							</p>
							<ul className="space-y-3">
								{STACK_UP.others.map((item) => (
									<li key={item} className="flex items-start gap-2 text-sm text-white/50">
										<X size={16} className="mt-0.5 flex-shrink-0 text-white/30" />
										<span>{item}</span>
									</li>
								))}
							</ul>
						</div>
					</div>
				</div>
			</section>

			{/* ============================= ANCIENT PLANTS DEEP DIVE ============================= */}
			<section className="px-6 pb-24 max-w-4xl mx-auto">
				<p className="text-center text-white/50 uppercase tracking-widest text-xs mb-3">
					Tradition
				</p>
				<h2 className="text-center text-3xl sm:text-4xl font-bold mb-4">
					Ancient plants, real effects.
				</h2>
				<p className="text-center text-white/60 mb-12 max-w-2xl mx-auto leading-relaxed">
					Long before pharmacies and packaged drinks, people turned to the earth for clarity, calm, and connection. These traditions still hold up.
				</p>

				<div className="space-y-8">
					<div
						className="rounded-3xl p-6 sm:p-8"
						style={{
							background: "rgba(255,255,255,0.03)",
							border: "1px solid rgba(255,255,255,0.08)",
						}}
					>
						<div className="flex items-center gap-3 mb-3">
							<span className="text-3xl">🌿</span>
							<h3 className="font-semibold text-lg">KR🌀TOM</h3>
						</div>
						<p className="text-white/70 leading-relaxed text-sm sm:text-base">
							In the heart of Southeast Asia, tribal communities have long
							revered this sacred leaf. Passed down through generations,
							farmers would chew its leaves to restore energy, soothe long
							days, and stay alert through the tropical sun. It was tradition
							before it was wellness — a ritual rooted in rhythm with nature.
						</p>
					</div>

					<div
						className="rounded-3xl p-6 sm:p-8"
						style={{
							background: "rgba(255,255,255,0.03)",
							border: "1px solid rgba(255,255,255,0.08)",
						}}
					>
						<div className="flex items-center gap-3 mb-3">
							<span className="text-3xl">🌺</span>
							<h3 className="font-semibold text-lg">KAVA ROOT</h3>
						</div>
						<p className="text-white/70 leading-relaxed text-sm sm:text-base">
							Across the Pacific, Polynesian communities have gathered around
							Kava for centuries. The root is prepared into a calming drink at
							ceremonies and quiet evenings alike — passed from elder to
							young, marking moments of welcome, agreement, and rest.
						</p>
					</div>

					<div
						className="rounded-3xl p-6 sm:p-8"
						style={{
							background: "rgba(255,255,255,0.03)",
							border: "1px solid rgba(255,255,255,0.08)",
						}}
					>
						<div className="flex items-center gap-3 mb-3">
							<span className="text-3xl">🍵</span>
							<h3 className="font-semibold text-lg">GREEN TEA</h3>
						</div>
						<p className="text-white/70 leading-relaxed text-sm sm:text-base">
							From the mountains of East Asia, green tea has been a daily
							companion to scholars, monks, and craftsmen — prized for the
							gentle clarity it brings. Calm, focused, awake. Centuries of
							quiet productivity in a single leaf.
						</p>
					</div>
				</div>
			</section>

			{/* ============================= FAQ ============================= */}
			<section className="px-6 pb-24 max-w-3xl mx-auto">
				<p className="text-center text-white/50 uppercase tracking-widest text-xs mb-3">
					FAQ
				</p>
				<h2 className="text-center text-3xl sm:text-4xl font-bold mb-12">
					Your questions, answered.
				</h2>
				<div className="space-y-3">
					{FAQS.map((faq, i) => {
						const isOpen = openFaq === i;
						return (
							<div
								key={faq.q}
								className="rounded-2xl overflow-hidden"
								style={{
									background: "rgba(255,255,255,0.03)",
									border: "1px solid rgba(255,255,255,0.08)",
								}}
							>
								<button
									onClick={() => setOpenFaq(isOpen ? null : i)}
									className="w-full flex items-center justify-between text-left px-5 py-4 hover:bg-white/[0.02] transition-colors"
								>
									<span className="font-medium text-sm sm:text-base pr-4">
										{faq.q}
									</span>
									<ChevronDown
										size={18}
										className="text-white/50 flex-shrink-0 transition-transform"
										style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
									/>
								</button>
								{isOpen && (
									<div className="px-5 pb-4 text-white/65 text-sm leading-relaxed">
										{faq.a}
									</div>
								)}
							</div>
						);
					})}
				</div>
			</section>

			{/* ============================= FINAL CTA ============================= */}
			<section className="text-center px-6 pb-24">
				<h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to feel it?</h2>
				<p className="text-white/60 mb-8 max-w-md mx-auto">
					Pick a flavor, cover shipping. We'll send you the rest.
				</p>
				<button
					onClick={() => {
						window.scrollTo({ top: 0, behavior: "smooth" });
					}}
					className="h-14 px-10 rounded-full font-semibold text-white text-lg transition-all hover:scale-[1.03] shadow-[0_10px_30px_rgba(225,37,143,0.4)]"
					style={{ background: "linear-gradient(135deg, #E1258F 0%, #FF4DA6 100%)" }}
				>
					Claim My Free Sample
				</button>
			</section>

			{/* ============================= FOOTER ============================= */}
			<footer
				className="border-t px-6 py-8 text-center text-white/40 text-xs"
				style={{ borderColor: "rgba(255,255,255,0.08)" }}
			>
				<p className="mb-3">
					<Link href="/privacy" className="hover:text-white/70 mr-4 transition-colors">
						Privacy Policy
					</Link>
					<Link href="/terms" className="hover:text-white/70 transition-colors">
						Terms & Conditions
					</Link>
				</p>
				<p className="mb-3 max-w-2xl mx-auto leading-relaxed">
					Disclaimer: These statements have not been evaluated by the Food and Drug Administration. These products are not intended to diagnose, treat, cure or prevent any diseases. Not for use by or sale to persons under the age of 21. Consult with a physician before use if you have a serious medical condition or use prescription medications. Void where prohibited by law.
				</p>
				<p>© {new Date().getFullYear()} DrinkYUM. All rights reserved.</p>
			</footer>

			{/* ============================= CART DRAWER ============================= */}
			{cartOpen && (
				<div className="fixed inset-0 z-50 flex">
					<div className="flex-1 bg-black/60" onClick={() => setCartOpen(false)} />
					<div className="w-full max-w-sm bg-[#111] flex flex-col h-full shadow-2xl">
						<div
							className="flex items-center justify-between p-5 border-b"
							style={{ borderColor: "rgba(255,255,255,0.1)" }}
						>
							<h2 className="font-semibold text-lg">Your Cart</h2>
							<button
								onClick={() => setCartOpen(false)}
								className="p-1 hover:bg-white/10 rounded-full transition-colors"
							>
								<X size={20} />
							</button>
						</div>
						<div className="flex-1 overflow-y-auto p-5 space-y-4">
							{!cart?.items?.length ? (
								<p className="text-white/50 text-sm text-center py-12">
									Your cart is empty.
								</p>
							) : (
								cart.items.map((item) => {
									const opt = sampleOptions.find(
										(o) => o.variantId === String(item.variant_id),
									);
									return (
										<div key={item.id} className="flex gap-3 items-start">
											{opt?.image && (
												<div
													className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0"
													style={{ background: "rgba(255,255,255,0.04)" }}
												>
													<Image
														src={opt.image}
														alt={opt.flavor}
														fill
														sizes="56px"
														className="object-cover"
													/>
												</div>
											)}
											<div className="flex-1 min-w-0">
												<p className="font-medium text-sm leading-tight">{item.title}</p>
												<p className="text-white/50 text-xs mt-1">
													${item.unit_price?.toFixed(2)}
												</p>
											</div>
											<div className="flex items-center gap-2">
												<button
													onClick={() =>
														item.quantity <= 1
															? removeItem(item.id)
															: updateQuantity(item.id, item.quantity - 1)
													}
													className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
												>
													<Minus size={12} />
												</button>
												<span className="text-sm w-4 text-center">{item.quantity}</span>
												<button
													onClick={() => updateQuantity(item.id, item.quantity + 1)}
													className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
												>
													<Plus size={12} />
												</button>
											</div>
										</div>
									);
								})
							)}
						</div>
						{cart?.items?.length ? (
							<div
								className="p-5 border-t space-y-3"
								style={{ borderColor: "rgba(255,255,255,0.1)" }}
							>
								<div className="flex justify-between text-sm">
									<span className="text-white/60">Subtotal</span>
									<span className="font-semibold">${cart.total?.toFixed(2)}</span>
								</div>
								<Link
									href="/need-to-know"
									onClick={() => setCartOpen(false)}
									className="block w-full h-12 rounded-full font-semibold text-white text-sm text-center leading-[48px] transition-all hover:scale-[1.02]"
									style={{
										background: "linear-gradient(135deg, #E1258F 0%, #FF4DA6 100%)",
									}}
								>
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
