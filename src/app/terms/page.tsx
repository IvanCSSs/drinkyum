import Link from "next/link";

export const metadata = { title: "Terms & Conditions — DrinkYUM" };

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-yum-dark text-white px-6 py-16 max-w-3xl mx-auto">
      <Link href="/" className="text-white/40 hover:text-white/70 text-sm mb-8 inline-block transition-colors">← Back</Link>
      <h1 className="text-3xl font-bold mb-2">Terms &amp; Conditions</h1>
      <p className="text-white/40 text-sm mb-8">Last Updated: {new Date().getFullYear()}</p>
      <div className="space-y-6 text-white/70 leading-relaxed text-sm">
        <p>By accessing or using our website, products, or services, you agree to be bound by these Terms of Service.</p>

        <h2 className="text-white font-semibold text-base mt-8">1. Eligibility</h2>
        <p>By placing an order, you confirm that you are at least 21 years of age and legally permitted to purchase our products. Our products may only be purchased in states where they are legal.</p>

        <h2 className="text-white font-semibold text-base mt-8">2. Right to Refuse Service</h2>
        <p>We reserve the right to refuse service to anyone at our sole discretion, and to limit quantities purchased per person, household, or order.</p>

        <h2 className="text-white font-semibold text-base mt-8">3. Product Use</h2>
        <p>Our products are intended for personal consumption only by adults 21 and over. Resale or redistribution by unlicensed individuals is strictly prohibited.</p>

        <h2 className="text-white font-semibold text-base mt-8">4. Prices and Modifications</h2>
        <p>Prices are subject to change without notice. We reserve the right to modify or discontinue products, programs, or promotions at any time.</p>

        <h2 className="text-white font-semibold text-base mt-8">5. Disclaimer</h2>
        <p>These statements have not been evaluated by the Food and Drug Administration. These products are not intended to diagnose, treat, cure or prevent any disease. These products are not for use by or sale to persons under the age of 21. Do not use if pregnant or nursing. Consult with a physician before use if you have a serious medical condition or use prescription medications. Void where prohibited by law.</p>

        <h2 className="text-white font-semibold text-base mt-8">6. Contact</h2>
        <p>Questions? Email us at <a href="mailto:hello@drinkyum.com" className="text-yum-pink hover:underline">hello@drinkyum.com</a>.</p>
      </div>
    </main>
  );
}
