"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Package, Truck, CreditCard, RotateCcw, Leaf, HelpCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileLogo from "@/components/MobileLogo";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  title: string;
  icon: React.ElementType;
  color: string;
  items: FAQItem[];
}

const faqCategories: FAQCategory[] = [
  {
    title: "Products",
    icon: Leaf,
    color: "text-green-400",
    items: [
      {
        question: "What is YUM kratom extract?",
        answer: "YUM is a premium kratom extract beverage designed for convenience and great taste. Our extracts are made from high-quality kratom leaves sourced from Southeast Asia, processed using proprietary extraction methods to ensure consistent potency and flavor.",
      },
      {
        question: "How should I use YUM?",
        answer: "Shake well before use. Start with a small serving to assess your tolerance. Effects typically begin within 15-30 minutes. Do not exceed recommended serving sizes. Not intended for daily use.",
      },
      {
        question: "What flavors do you offer?",
        answer: "We currently offer several delicious flavors including Tropical Breeze, Berry Blast, and more. Check our Shop page for the full lineup. We're always working on new flavors based on customer feedback!",
      },
      {
        question: "Is kratom legal?",
        answer: "Kratom is legal in most US states. However, it is banned in Alabama, Arkansas, Indiana, Rhode Island, Vermont, and Wisconsin. Some cities and counties also have restrictions. It's your responsibility to know the laws in your area before ordering.",
      },
      {
        question: "How should I store YUM products?",
        answer: "Store in a cool, dry place away from direct sunlight. Refrigeration is not required but can extend freshness after opening. Do not freeze. Best consumed within 30 days of opening.",
      },
    ],
  },
  {
    title: "Orders & Shipping",
    icon: Truck,
    color: "text-yum-cyan",
    items: [
      {
        question: "How long does shipping take?",
        answer: "Standard shipping takes 5-7 business days. Express shipping takes 2-3 business days. Priority overnight delivery is also available. Orders are processed within 24-48 hours on business days.",
      },
      {
        question: "Do you offer free shipping?",
        answer: "Yes! We offer free standard shipping on all orders over $50. Express and priority shipping are available at additional cost regardless of order value.",
      },
      {
        question: "Can I track my order?",
        answer: "Absolutely! Once your order ships, you'll receive an email with tracking information. You can also log into your account to view order status and tracking details.",
      },
      {
        question: "Do you ship internationally?",
        answer: "Currently, we only ship within the United States (excluding restricted states). We hope to offer international shipping in the future. Sign up for our newsletter to be notified when we expand.",
      },
      {
        question: "What states can't you ship to?",
        answer: "Due to state regulations, we cannot ship to Alabama, Arkansas, Indiana, Rhode Island, Vermont, or Wisconsin. Orders to these states will be cancelled and refunded.",
      },
    ],
  },
  {
    title: "Payment",
    icon: CreditCard,
    color: "text-yum-pink",
    items: [
      {
        question: "What payment methods do you accept?",
        answer: "We accept Visa, Mastercard, American Express, and Discover credit and debit cards. All payments are securely processed through Authorize.net with SSL encryption.",
      },
      {
        question: "Is my payment information secure?",
        answer: "Yes, absolutely. We use Authorize.net for payment processing, which is PCI-DSS compliant. Your card information is encrypted and tokenized — we never store your full card number on our servers.",
      },
      {
        question: "Do you offer payment plans?",
        answer: "We don't currently offer payment plans. However, we do offer Subscribe & Save options with discounts of up to 20% off for recurring orders.",
      },
      {
        question: "When will I be charged?",
        answer: "Your card is charged immediately when you place your order. For subscription orders, you'll be charged on your selected schedule (every 15, 30, 45, or 60 days).",
      },
    ],
  },
  {
    title: "Returns & Refunds",
    icon: RotateCcw,
    color: "text-yellow-400",
    items: [
      {
        question: "What is your return policy?",
        answer: "We offer a 30-day satisfaction guarantee. Unopened products in original packaging may be returned for a full refund within 30 days of delivery. See our Shipping & Returns page for complete details.",
      },
      {
        question: "How do I initiate a return?",
        answer: "Email returns@drinkyum.com with your order number. We'll provide a return authorization number (RMA) and shipping instructions. Returns without an RMA may not be accepted.",
      },
      {
        question: "Can I return opened products?",
        answer: "For safety and quality reasons, we cannot accept returns on opened or used products. If you received a defective or damaged product, please contact us within 48 hours of delivery.",
      },
      {
        question: "How long do refunds take?",
        answer: "Once we receive and inspect your return, refunds are processed within 5-7 business days. It may take an additional 5-10 business days for the refund to appear on your statement.",
      },
    ],
  },
  {
    title: "Subscriptions",
    icon: Package,
    color: "text-purple-400",
    items: [
      {
        question: "How does Subscribe & Save work?",
        answer: "Choose your products and delivery frequency (every 15, 30, 45, or 60 days). You'll save up to 20% on every order. Manage, pause, or cancel your subscription anytime from your account.",
      },
      {
        question: "Can I skip or pause my subscription?",
        answer: "Yes! Log into your account to skip an upcoming delivery or pause your subscription. You can also change your delivery frequency or update products at any time.",
      },
      {
        question: "How do I cancel my subscription?",
        answer: "You can cancel your subscription anytime from your account dashboard. There are no cancellation fees or penalties. Any orders already shipped are not eligible for refund.",
      },
      {
        question: "Can I change my subscription products?",
        answer: "Absolutely! Log into your account and you can add, remove, or swap products in your subscription. Changes take effect on your next billing cycle.",
      },
    ],
  },
];

function FAQAccordion({ item, isOpen, onToggle }: { item: FAQItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-white/10">
      <button
        onClick={onToggle}
        className="w-full py-5 flex items-center justify-between text-left group"
      >
        <span className="text-white font-medium pr-4 group-hover:text-yum-pink transition-colors">
          {item.question}
        </span>
        <ChevronDown 
          className={`w-5 h-5 text-white/50 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-white/60 leading-relaxed">
              {item.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const [activeCategory, setActiveCategory] = useState<string>(faqCategories[0].title);

  const toggleItem = (categoryTitle: string, index: number) => {
    const key = `${categoryTitle}-${index}`;
    setOpenItems(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <main className="min-h-screen bg-yum-dark">
      <Navbar />
      <MobileLogo />
      
      <section className="relative pt-32 lg:pt-44 pb-16 lg:pb-24 px-4">
        <div className="max-w-[1000px] mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-white/60 text-lg max-w-xl mx-auto">
              Find quick answers to common questions about YUM products, orders, and more.
            </p>
          </motion.div>

          {/* Category Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-wrap gap-2 justify-center mb-10"
          >
            {faqCategories.map((category) => (
              <button
                key={category.title}
                onClick={() => setActiveCategory(category.title)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeCategory === category.title
                    ? 'bg-white/10 text-white'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                <category.icon className={`w-4 h-4 ${activeCategory === category.title ? category.color : ''}`} />
                {category.title}
              </button>
            ))}
          </motion.div>

          {/* FAQ Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {faqCategories.map((category) => (
              <div
                key={category.title}
                className={activeCategory === category.title ? 'block' : 'hidden'}
              >
                <div 
                  className="p-6 lg:p-8 rounded-2xl"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                    <category.icon className={`w-6 h-6 ${category.color}`} />
                    <h2 className="text-xl font-bold text-white">{category.title}</h2>
                  </div>
                  
                  <div>
                    {category.items.map((item, index) => (
                      <FAQAccordion
                        key={index}
                        item={item}
                        isOpen={openItems[`${category.title}-${index}`] || false}
                        onToggle={() => toggleItem(category.title, index)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Still Have Questions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-12 text-center"
          >
            <div 
              className="p-8 rounded-2xl"
              style={{ 
                background: "linear-gradient(135deg, rgba(225,37,143,0.1) 0%, rgba(0,212,255,0.1) 100%)",
                border: "1px solid rgba(255,255,255,0.1)"
              }}
            >
              <HelpCircle className="w-10 h-10 text-yum-pink mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Still have questions?</h3>
              <p className="text-white/60 mb-6">
                Can&apos;t find what you&apos;re looking for? Our support team is here to help.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:scale-[1.02]"
                style={{
                  background: "linear-gradient(135deg, #E1258F 0%, #C01F7A 100%)",
                }}
              >
                Contact Support
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}


