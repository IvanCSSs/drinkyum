"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Shield, FileCheck, FlaskConical, CheckCircle, Download, ExternalLink, Award, Microscope } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileLogo from "@/components/MobileLogo";

const testingPoints = [
  {
    icon: FlaskConical,
    title: "Alkaloid Content",
    description: "We test every batch for mitragynine and 7-hydroxymitragynine levels to ensure consistent potency.",
  },
  {
    icon: Shield,
    title: "Heavy Metals",
    description: "Screened for lead, arsenic, mercury, and cadmium to ensure safety below detectable limits.",
  },
  {
    icon: Microscope,
    title: "Microbial Testing",
    description: "Tested for E. coli, Salmonella, yeast, and mold to ensure product purity and safety.",
  },
  {
    icon: FileCheck,
    title: "Contaminants",
    description: "Screened for pesticides, herbicides, and other agricultural contaminants.",
  },
];

const certifications = [
  { name: "GMP Certified", description: "Good Manufacturing Practices" },
  { name: "Third-Party Tested", description: "Independent lab verification" },
  { name: "AKA GMP Qualified", description: "American Kratom Association standards" },
];

// Placeholder batch data - would come from backend in production
const recentBatches = [
  {
    batchNumber: "YUM-2024-1201",
    product: "Triple Play - Tropical Breeze",
    testDate: "December 1, 2024",
    mitragynine: "1.8%",
    status: "Passed",
  },
  {
    batchNumber: "YUM-2024-1115",
    product: "Triple Play - Berry Blast",
    testDate: "November 15, 2024",
    mitragynine: "1.7%",
    status: "Passed",
  },
  {
    batchNumber: "YUM-2024-1101",
    product: "Triple Play - Original",
    testDate: "November 1, 2024",
    mitragynine: "1.9%",
    status: "Passed",
  },
];

export default function LabResultsPage() {
  return (
    <main className="min-h-screen bg-yum-dark">
      <Navbar />
      <MobileLogo />
      
      {/* Hero Section */}
      <section className="relative pt-32 lg:pt-44 pb-16 lg:pb-24 px-4">
        <div className="max-w-[1100px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30 mb-6">
              <Shield className="w-4 h-4 text-green-400" />
              <span className="text-green-400 text-sm font-medium">100% Lab Tested</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Transparency You Can <span className="text-yum-pink">Trust</span>
            </h1>
            <p className="text-white/60 text-lg lg:text-xl leading-relaxed">
              Every batch of YUM is rigorously tested by independent, third-party laboratories. 
              We believe you deserve to know exactly what&apos;s in your products.
            </p>
          </motion.div>

          {/* Testing Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex justify-center mb-16"
          >
            <div className="relative w-40 h-40 lg:w-48 lg:h-48">
              <Image
                src="/images/lab-tested.png"
                alt="Lab Tested Badge"
                fill
                className="object-contain"
              />
            </div>
          </motion.div>

          {/* What We Test For */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-20"
          >
            <h2 className="text-2xl lg:text-3xl font-bold text-white text-center mb-10">
              What We Test For
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {testingPoints.map((point, index) => (
                <motion.div
                  key={point.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  className="p-6 rounded-2xl text-center"
                  style={{ 
                    background: "rgba(255,255,255,0.03)", 
                    border: "1px solid rgba(255,255,255,0.08)" 
                  }}
                >
                  <div className="w-12 h-12 rounded-xl bg-yum-pink/10 flex items-center justify-center mx-auto mb-4">
                    <point.icon className="w-6 h-6 text-yum-pink" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">{point.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{point.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Testing Process */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-20"
          >
            <div 
              className="p-8 lg:p-12 rounded-3xl"
              style={{ 
                background: "linear-gradient(135deg, rgba(225,37,143,0.1) 0%, rgba(0,212,255,0.1) 100%)",
                border: "1px solid rgba(255,255,255,0.1)"
              }}
            >
              <h2 className="text-2xl lg:text-3xl font-bold text-white text-center mb-10">
                Our Testing Process
              </h2>
              
              <div className="grid lg:grid-cols-4 gap-6">
                {[
                  { step: "01", title: "Sourcing", desc: "Raw materials tested at origin before shipping" },
                  { step: "02", title: "Arrival", desc: "Re-tested upon arrival at our facility" },
                  { step: "03", title: "Production", desc: "In-process quality checks during extraction" },
                  { step: "04", title: "Final QC", desc: "Finished product sent to third-party lab" },
                ].map((item, index) => (
                  <div key={item.step} className="text-center">
                    <div className="text-4xl lg:text-5xl font-bold text-yum-pink/30 mb-2">{item.step}</div>
                    <h3 className="text-white font-semibold mb-2">{item.title}</h3>
                    <p className="text-white/50 text-sm">{item.desc}</p>
                    {index < 3 && (
                      <div className="hidden lg:block absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2">
                        →
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Recent Batch Results */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-20"
          >
            <h2 className="text-2xl lg:text-3xl font-bold text-white text-center mb-4">
              Recent Batch Results
            </h2>
            <p className="text-white/50 text-center mb-10 max-w-2xl mx-auto">
              View test results for our most recent production batches. Full certificates of analysis available upon request.
            </p>
            
            <div 
              className="rounded-2xl overflow-hidden"
              style={{ 
                background: "rgba(255,255,255,0.03)", 
                border: "1px solid rgba(255,255,255,0.08)" 
              }}
            >
              {/* Table Header */}
              <div className="hidden lg:grid lg:grid-cols-5 gap-4 p-4 bg-white/5 border-b border-white/10">
                <div className="text-white/60 text-sm font-medium">Batch #</div>
                <div className="text-white/60 text-sm font-medium">Product</div>
                <div className="text-white/60 text-sm font-medium">Test Date</div>
                <div className="text-white/60 text-sm font-medium">Mitragynine</div>
                <div className="text-white/60 text-sm font-medium">Status</div>
              </div>
              
              {/* Table Rows */}
              {recentBatches.map((batch, index) => (
                <div 
                  key={batch.batchNumber}
                  className={`grid lg:grid-cols-5 gap-2 lg:gap-4 p-4 ${index !== recentBatches.length - 1 ? 'border-b border-white/5' : ''}`}
                >
                  <div className="flex lg:block items-center justify-between">
                    <span className="lg:hidden text-white/40 text-xs">Batch #</span>
                    <span className="text-white font-mono text-sm">{batch.batchNumber}</span>
                  </div>
                  <div className="flex lg:block items-center justify-between">
                    <span className="lg:hidden text-white/40 text-xs">Product</span>
                    <span className="text-white/80 text-sm">{batch.product}</span>
                  </div>
                  <div className="flex lg:block items-center justify-between">
                    <span className="lg:hidden text-white/40 text-xs">Test Date</span>
                    <span className="text-white/60 text-sm">{batch.testDate}</span>
                  </div>
                  <div className="flex lg:block items-center justify-between">
                    <span className="lg:hidden text-white/40 text-xs">Mitragynine</span>
                    <span className="text-yum-cyan font-medium text-sm">{batch.mitragynine}</span>
                  </div>
                  <div className="flex lg:block items-center justify-between">
                    <span className="lg:hidden text-white/40 text-xs">Status</span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-medium">
                      <CheckCircle className="w-3 h-3" />
                      {batch.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            <p className="text-white/40 text-sm text-center mt-4">
              Need a Certificate of Analysis? <Link href="/contact" className="text-yum-pink hover:underline">Contact us</Link> with your batch number.
            </p>
          </motion.div>

          {/* Certifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-16"
          >
            <h2 className="text-2xl lg:text-3xl font-bold text-white text-center mb-10">
              Our Certifications
            </h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {certifications.map((cert, index) => (
                <div
                  key={cert.name}
                  className="p-6 rounded-2xl text-center"
                  style={{ 
                    background: "rgba(255,255,255,0.03)", 
                    border: "1px solid rgba(255,255,255,0.08)" 
                  }}
                >
                  <Award className="w-10 h-10 text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-white font-semibold mb-1">{cert.name}</h3>
                  <p className="text-white/50 text-sm">{cert.description}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div 
              className="p-8 rounded-2xl"
              style={{ 
                background: "rgba(255,255,255,0.03)", 
                border: "1px solid rgba(255,255,255,0.08)" 
              }}
            >
              <h3 className="text-xl font-bold text-white mb-3">Questions About Our Testing?</h3>
              <p className="text-white/60 mb-6 max-w-lg mx-auto">
                We&apos;re happy to provide additional information about our quality assurance processes or specific batch results.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contact"
                  className="px-6 py-3 rounded-xl font-semibold text-white transition-all hover:scale-[1.02]"
                  style={{
                    background: "linear-gradient(135deg, #E1258F 0%, #C01F7A 100%)",
                  }}
                >
                  Contact Us
                </Link>
                <Link
                  href="/collections"
                  className="px-6 py-3 rounded-xl font-semibold text-white border border-white/20 hover:border-white/40 transition-colors"
                >
                  Shop Now
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}


