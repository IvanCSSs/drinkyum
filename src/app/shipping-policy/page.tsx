"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FileText, Phone, Mail, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileLogo from "@/components/MobileLogo";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-8">
    <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">{title}</h2>
    <div className="text-white/60 leading-relaxed space-y-3">{children}</div>
  </div>
);

const Bullets = ({ items }: { items: string[] }) => (
  <ul className="list-disc pl-5 space-y-1.5 text-white/60">
    {items.map((i) => (
      <li key={i}>{i}</li>
    ))}
  </ul>
);

export default function ShippingPolicyPage() {
  return (
    <main className="min-h-screen bg-yum-dark">
      <Navbar />
      <MobileLogo />

      <section className="relative pt-32 lg:pt-44 pb-16 lg:pb-24 px-4">
        <div className="max-w-[900px] mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
              Inventory Receiving, Inspection &amp; Claims Policy
            </h1>
            <p className="text-white/60 text-lg">
              Operational policy for approved purchasers and distribution partners
            </p>
            <p className="text-white/40 text-sm mt-2">Version 1.6 • July 2026</p>
          </motion.div>

          {/* Quick reference cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid sm:grid-cols-3 gap-4 mb-12"
          >
            <a href="mailto:support@drinkyum.com" className="p-6 rounded-2xl text-center block hover:border-yum-pink transition-colors"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <Mail className="w-8 h-8 text-yum-pink mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-1">Report by Email</h3>
              <p className="text-white/50 text-sm">support@drinkyum.com</p>
            </a>
            <a href="tel:8558055327" className="p-6 rounded-2xl text-center block hover:border-yum-pink transition-colors"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <Phone className="w-8 h-8 text-yum-pink mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-1">Phone</h3>
              <p className="text-white/50 text-sm">855-805-5327</p>
            </a>
            <Link href="/shipping_issues" className="p-6 rounded-2xl text-center block hover:border-yum-pink transition-colors"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <FileText className="w-8 h-8 text-yum-pink mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-1">Online Claims Form</h3>
              <p className="text-white/50 text-sm">Preferred method →</p>
            </Link>
          </motion.div>

          <div className="flex items-center justify-center gap-2 mb-12 text-white/60">
            <Clock className="w-5 h-5 text-yum-pink" />
            <span className="text-sm">Reporting window: <span className="text-white">within 2 business days of delivery</span></span>
          </div>

          {/* Body */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="p-6 lg:p-10 rounded-2xl"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <Section title="1. Purpose">
              <p>The purpose of this policy is to establish consistent procedures for receiving product shipments, inspecting inventory upon delivery, reporting shortages or damage, and processing freight claims.</p>
              <p>This policy is intended to protect both the Company and the Purchaser by ensuring shipment discrepancies are identified promptly and resolved efficiently.</p>
            </Section>

            <Section title="2. Scope">
              <p>This policy applies to all shipments delivered to approved Y.U.M. Purchasers, Brokers, Distributors, and other authorized customers unless otherwise specified in writing.</p>
              <p>This policy supplements the Y.U.M. Purchaser Agreement and other applicable Company policies.</p>
            </Section>

            <Section title="3. Order Confirmation & Document Process">
              <p>Once an order is placed, the assigned salesperson will receive an email containing the following documents:</p>
              <Bullets items={["Invoice", "Packing Slip", "Tracking Information", "Estimated Time of Arrival (ETA)"]} />
              <p>The Purchaser should use these documents to verify that the order is correct before the shipment arrives, and again once the package or freight arrives to verify the shipment against what was ordered.</p>
            </Section>

            <Section title="4. Shipment Receiving">
              <p>Upon delivery, the Purchaser should inspect each shipment as soon as reasonably practical. When practical, the Purchaser should verify:</p>
              <Bullets items={["Number of cartons received", "Product quantities", "Product identification", "Visible shipping damage", "Condition of shipping cartons"]} />
              <p>The packing slip or invoice should be used to verify shipment contents.</p>
            </Section>

            <Section title="5. What to Expect in Your Shipment">
              <p>Each shipment is typically accompanied by the following documentation:</p>
              <Bullets items={[
                "Packing Slip — lists the cartons, product descriptions, and quantities included in the shipment.",
                "Invoice — itemizes the products, quantities, and pricing associated with the order.",
                "Carton / Product Labeling — product identification, lot codes, or other markings on individual cartons.",
              ]} />
              <p>If a shipment arrives without a packing slip, invoice, or other expected documentation, this should be reported to the Company using the contacts above.</p>
            </Section>

            <Section title="6. Shipment Inspection">
              <p>Products should be counted and inspected within two (2) business days following delivery. Inspection should include verification that:</p>
              <Bullets items={["Products match the order.", "Quantities are correct.", "Packaging is intact.", "No obvious shipping damage exists.", "No products are missing."]} />
            </Section>

            <Section title="7. Reporting Discrepancies">
              <p>Shortages, shipping damage, incorrect products, missing documentation, or any other shipment discrepancy must be reported to the Company within two (2) business days of delivery, using one of the methods below:</p>
              <Bullets items={[
                "Online Form — the preferred method. Complete the claim form so photographs and supporting details can be attached directly to the claim record.",
                "Email — send a report to support@drinkyum.com if the online form cannot be used.",
                "Phone — call 855-805-5327 for assistance or to notify the Company of an issue.",
              ]} />
              <p className="text-white/80 font-medium mt-4">For faster review, submit through the online form and attach photos. Include when available:</p>
              <Bullets items={["Order or invoice number", "Delivery date", "Issue description", "Affected product and quantity", "Relevant photos or supporting documentation"]} />
            </Section>

            <Section title="8. Resolution Process">
              <Bullets items={[
                "Visible Carrier Damage — if the shipment or packaging shows clear signs of damage in transit, the Company will ship a replacement upon confirmation of photos showing the damage.",
                "Quantity Discrepancies — a reported shortage without visible damage will be investigated (reviewing the invoice, packing slip, and carrier records) before a resolution is issued.",
                "Other Discrepancies — incorrect products or other issues are reviewed and resolved case-by-case.",
              ]} />
              <p>The Company&apos;s goal is to resolve reported discrepancies within one (1) to three (3) business days of receiving a complete report. Cases requiring carrier investigation may take longer; the Purchaser will be kept informed. Prompt reporting helps preserve the Company&apos;s ability to pursue recovery from the shipping carrier.</p>
            </Section>

            <Section title="9. Freight Claims">
              <p>The Company will coordinate freight damage claims directly with the shipping carrier. The Purchaser agrees to cooperate by providing photographs, inspection information, and supporting documentation reasonably necessary to process the claim. The Company will communicate claim status as information becomes available.</p>
            </Section>

            <Section title="10. Shipment Acceptance">
              <p>Failure to report shortages, damage, or shipment discrepancies within the required reporting period may constitute acceptance of the shipment. Late claims will be reviewed at the Company&apos;s discretion and may be limited by carrier policies or claim filing deadlines.</p>
            </Section>

            <Section title="11. Resolution of Claims">
              <p>After reviewing the reported issue, the Company may, at its sole discretion:</p>
              <Bullets items={["Replace damaged or missing products.", "Issue account credit.", "Correct shipping errors.", "Provide another commercially reasonable remedy appropriate to the circumstances."]} />
              <p>Submission of a claim does not guarantee replacement or reimbursement.</p>
            </Section>

            <Section title="12. Purchaser Responsibilities">
              <Bullets items={["Inspecting shipments promptly.", "Reporting discrepancies within the required timeframe.", "Preserving damaged products and packaging until instructed otherwise.", "Cooperating with any reasonable requests necessary to investigate the claim."]} />
            </Section>

            <Section title="13. Company Responsibilities & Rights">
              <p>The Company will review reported discrepancies promptly, coordinate freight claims with the shipping carrier, communicate claim status, and resolve verified claims in a commercially reasonable manner. The Company reserves the right to request additional documentation, deny unsupported or fraudulent claims, modify receiving procedures as operational needs require, and update this policy from time to time.</p>
            </Section>

            <div className="mt-10 pt-6 border-t border-white/10 text-center">
              <p className="text-white/60 mb-4">Need to report an issue?</p>
              <Link href="/shipping_issues" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:scale-[1.02]"
                style={{ background: "linear-gradient(135deg, #E1258F 0%, #C01F7A 100%)" }}>
                <FileText className="w-5 h-5" /> File a Claim
              </Link>
            </div>
          </motion.div>

          <p className="text-white/30 text-xs text-center mt-8">
            Y.U.M. Inventory Receiving, Inspection &amp; Claims Policy • v1.6 • July 2026 • Lazaros LLC • Confidential
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
