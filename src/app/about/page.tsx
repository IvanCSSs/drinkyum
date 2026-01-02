"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Heart, Leaf, Shield, Award, Users, Zap } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileLogo from "@/components/MobileLogo";

const values = [
  {
    icon: Leaf,
    title: "Pure & Natural",
    description: "We source only the highest quality kratom from trusted Southeast Asian farms with sustainable practices.",
    color: "text-green-400",
  },
  {
    icon: Shield,
    title: "Lab Tested",
    description: "Every batch is third-party tested for purity, potency, and contaminants. No exceptions.",
    color: "text-yum-cyan",
  },
  {
    icon: Heart,
    title: "Customer First",
    description: "Your satisfaction is our priority. We're here to help you find what works best for you.",
    color: "text-yum-pink",
  },
  {
    icon: Award,
    title: "Quality Obsessed",
    description: "From sourcing to bottling, we maintain the highest standards at every step.",
    color: "text-yellow-400",
  },
];

const stats = [
  { value: "50K+", label: "Happy Customers" },
  { value: "99%", label: "Satisfaction Rate" },
  { value: "100%", label: "Lab Tested" },
  { value: "24/48h", label: "Fast Shipping" },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-yum-dark">
      <Navbar />
      <MobileLogo />
      
      {/* Hero Section */}
      <section className="relative pt-32 lg:pt-44 pb-16 lg:pb-24 px-4">
        <div className="max-w-[1200px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Love It. Taste It. <span className="text-yum-pink">Feel It.</span>
            </h1>
            <p className="text-white/60 text-lg lg:text-xl leading-relaxed">
              We started YUM with a simple mission: create the most delicious, 
              effective kratom extracts on the market. No compromises on quality, 
              no shortcuts on taste.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-20"
          >
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="p-6 rounded-2xl text-center"
                style={{ 
                  background: "rgba(255,255,255,0.03)", 
                  border: "1px solid rgba(255,255,255,0.08)" 
                }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                >
                  <p className="text-3xl lg:text-4xl font-bold text-yum-pink mb-1">{stat.value}</p>
                  <p className="text-white/50 text-sm">{stat.label}</p>
                </motion.div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Our Story */}
      <section className="relative py-16 lg:py-24 px-4">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">Our Story</h2>
              <div className="space-y-4 text-white/70 leading-relaxed">
                <p>
                  YUM was born from frustration. As longtime kratom enthusiasts, we were tired of 
                  products that either tasted terrible or didn&apos;t deliver on their promises. 
                  We knew there had to be a better way.
                </p>
                <p>
                  So we set out to create something different. We partnered directly with 
                  farmers in Southeast Asia, worked with food scientists on our extraction 
                  process, and spent months perfecting our flavor profiles.
                </p>
                <p>
                  The result? A kratom extract that actually tastes good — and works even better. 
                  Our pocket-sized bottles are designed for your lifestyle: convenient, discreet, 
                  and ready whenever you are.
                </p>
                <p className="text-white font-semibold">
                  This isn&apos;t just another kratom company. This is YUM.
                </p>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div 
                className="aspect-square rounded-3xl overflow-hidden"
                style={{ 
                  background: "linear-gradient(135deg, rgba(225,37,143,0.2) 0%, rgba(0,212,255,0.2) 100%)",
                  border: "1px solid rgba(255,255,255,0.1)"
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <Image
                    src="/images/product-1.png"
                    alt="YUM Product"
                    width={300}
                    height={300}
                    className="object-contain"
                  />
                </div>
              </div>
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-yum-pink/20 blur-2xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 rounded-full bg-yum-cyan/20 blur-2xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="relative py-16 lg:py-24 px-4">
        <div className="max-w-[1200px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">What We Stand For</h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              Our values guide everything we do, from sourcing to shipping.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-6 rounded-2xl"
                style={{ 
                  background: "rgba(255,255,255,0.03)", 
                  border: "1px solid rgba(255,255,255,0.08)" 
                }}
              >
                <value.icon className={`w-10 h-10 ${value.color} mb-4`} />
                <h3 className="text-white font-semibold text-lg mb-2">{value.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quality Promise */}
      <section className="relative py-16 lg:py-24 px-4">
        <div className="max-w-[900px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="p-8 lg:p-12 rounded-3xl text-center"
            style={{ 
              background: "linear-gradient(135deg, rgba(225,37,143,0.1) 0%, rgba(0,212,255,0.1) 100%)",
              border: "1px solid rgba(255,255,255,0.1)"
            }}
          >
            <Zap className="w-12 h-12 text-yum-pink mx-auto mb-6" />
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4">
              The YUM Quality Promise
            </h2>
            <p className="text-white/70 leading-relaxed mb-8 max-w-2xl mx-auto">
              Every bottle of YUM is backed by our commitment to excellence. We never cut corners, 
              never compromise on ingredients, and always put your experience first. If you&apos;re 
              not completely satisfied, we&apos;ll make it right.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/collections"
                className="px-8 py-4 rounded-xl font-semibold text-white transition-all hover:scale-[1.02]"
                style={{
                  background: "linear-gradient(135deg, #E1258F 0%, #C01F7A 100%)",
                }}
              >
                Shop Now
              </Link>
              <Link
                href="/lab-results"
                className="px-8 py-4 rounded-xl font-semibold text-white border border-white/20 hover:border-white/40 transition-colors"
              >
                View Lab Results
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Team/Community */}
      <section className="relative py-16 lg:py-24 px-4">
        <div className="max-w-[1200px] mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Users className="w-12 h-12 text-yum-cyan mx-auto mb-6" />
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Join the YUM Community
            </h2>
            <p className="text-white/60 max-w-2xl mx-auto mb-8">
              Thousands of people have made YUM part of their daily routine. 
              Follow us on social media for tips, updates, and exclusive offers.
            </p>
            <div className="flex gap-4 justify-center">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{ background: "rgba(255,255,255,0.1)" }}
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{ background: "rgba(255,255,255,0.1)" }}
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{ background: "rgba(255,255,255,0.1)" }}
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                </svg>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}


