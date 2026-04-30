import Link from "next/link";

export const metadata = { title: "Privacy Policy — DrinkYUM" };

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-yum-dark text-white px-6 py-16 max-w-3xl mx-auto">
      <Link href="/" className="text-white/40 hover:text-white/70 text-sm mb-8 inline-block transition-colors">← Back</Link>
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
      <div className="prose prose-invert prose-sm max-w-none space-y-6 text-white/70 leading-relaxed">
        <p>When you visit our Site, we gather information about your device, how you interact with the Site, and details needed to process your purchases. Additional information may be collected if you contact us for customer support.</p>

        <h2 className="text-white font-semibold text-lg mt-8">Device Information</h2>
        <p>We collect web browser version, IP address, time zone, cookie information, pages or products viewed, search terms, and site interactions. This is collected automatically using cookies, log files, web beacons, tags, or pixels to ensure the site loads correctly and to perform analytics.</p>

        <h2 className="text-white font-semibold text-lg mt-8">Order Information</h2>
        <p>We collect name, billing address, shipping address, payment information, email address, and phone number to fulfill your order, process payments, arrange shipping, and communicate with you.</p>

        <h2 className="text-white font-semibold text-lg mt-8">Minors</h2>
        <p>The Site is intended for individuals aged 21 and older. We do not knowingly collect Personal Information from minors.</p>

        <h2 className="text-white font-semibold text-lg mt-8">Sharing Personal Information</h2>
        <p>We may share your Personal Information with service providers to help us offer our services and fulfill our agreements with you. We may disclose your information as needed to comply with legal requirements.</p>

        <h2 className="text-white font-semibold text-lg mt-8">Behavioral Advertising</h2>
        <p>We use your Personal Information to provide targeted ads and marketing communications. We use services including Google Analytics and Meta Pixel. You can opt out via Facebook Ad Settings, Google Ad Settings, or the Digital Advertising Alliance opt-out portal.</p>

        <h2 className="text-white font-semibold text-lg mt-8">Contact</h2>
        <p>For privacy questions, contact us at <a href="mailto:hello@drinkyum.com" className="text-yum-pink hover:underline">hello@drinkyum.com</a>.</p>
      </div>
    </main>
  );
}
