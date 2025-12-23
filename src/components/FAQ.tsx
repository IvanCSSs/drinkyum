"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    question: "What is YUM kratom extract?",
    answer:
      "YUM is a premium kratom extract beverage that combines high-quality kratom with delicious flavors. Unlike traditional kratom products, YUM masks the bitter taste entirely, giving you a genuinely enjoyable experience every time.",
  },
  {
    question: "How should I take YUM?",
    answer:
      "Simply shake the bottle and drink! Our 14ml bottles are perfect for a single serving, while our 30ml bottles can be split into two servings or enjoyed all at once for a stronger experience. Start with a smaller amount if you're new to kratom.",
  },
  {
    question: "What flavors are available?",
    answer:
      "We currently offer two signature flavors: Bubble Gum (a sweet, nostalgic treat) and Tropical Breeze (an exotic fruit blend with hints of citrus and mango). Both are crafted to completely mask any bitter kratom taste.",
  },
  {
    question: "Is YUM legal?",
    answer:
      "Kratom is legal in most US states, but regulations vary. Please check your local laws before purchasing. We do not ship to states where kratom is prohibited.",
  },
  {
    question: "How fast is shipping?",
    answer:
      "We offer fast, discreet shipping across the United States. Most orders ship within 24 hours and arrive in 3-5 business days. Expedited shipping options are available at checkout.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="relative py-24 md:py-32">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left - Header */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-yum-cyan" />
              <span className="text-sm uppercase tracking-[0.2em] text-white/60">
                FAQ
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold italic text-gradient mb-6">
              Got Questions?<br />
              <span className="text-yum-gold">We&apos;ve Got Answers</span>
            </h2>

            <p className="text-white/60 mb-8">
              Everything you need to know about YUM kratom extract beverages.
              Can&apos;t find what you&apos;re looking for? Reach out to our support team.
            </p>

            <a
              href="mailto:support@drinkyum.com"
              className="btn-outline inline-flex items-center gap-2"
            >
              Contact Support
            </a>
          </motion.div>

          {/* Right - FAQ Items */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                className="rounded-xl overflow-hidden glass"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                >
                  <span className="font-semibold text-white pr-4">
                    {faq.question}
                  </span>
                  <span className="flex-shrink-0 w-8 h-8 rounded-full glass flex items-center justify-center">
                    {openIndex === index ? (
                      <Minus size={16} className="text-yum-pink" />
                    ) : (
                      <Plus size={16} className="text-white/60" />
                    )}
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-5 text-white/60 leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

