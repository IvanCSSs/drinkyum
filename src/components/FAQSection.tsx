"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    question: "What is kratom?",
    answer:
      "YUM is a premium kratom extract containing 75% mitragynine—the primary alkaloid responsible for energy, focus, and performance enhancement. It's not an energy drink. It's a precision-engineered botanical extract designed for peak human performance.",
  },
  {
    question: "How do I use YUM?",
    answer:
      "Simply shake the bottle and drink! Start with half a bottle if you're new to kratom. Effects typically begin within 15-30 minutes and last 4-8 hours depending on the serving size.",
  },
  {
    question: "Can I take it every day?",
    answer:
      "While YUM is safe for regular use, we recommend cycling your consumption. Use it when you need peak performance, not as a daily habit. Listen to your body and take breaks as needed.",
  },
  {
    question: "I'm new to kratom. Where should I start?",
    answer:
      "Start with our 14ml bottle or half of a 30ml bottle. Wait 45 minutes to assess effects before taking more. Everyone's tolerance is different, so start low and find your optimal dose.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="relative bg-transparent flex justify-center px-4 py-16 overflow-visible">
      {/* Decorative Elements - Left Side */}
      <div 
        className="absolute pointer-events-none"
        style={{ left: "-230px", top: "50px" }}
      >
        {/* Cyan ellipse with blur */}
        <div 
          className="absolute"
          style={{
            width: "434px",
            height: "772px",
            left: "200px",
            top: "0",
            background: "conic-gradient(from 90deg, rgba(0,184,228,1) 24%, rgba(247,220,78,1) 51%, rgba(247,220,78,1) 76%, rgba(0,184,228,1) 100%)",
            borderRadius: "50%",
            filter: "blur(332px)",
            opacity: 0.5,
          }}
        />
        {/* Cyan circle stroke */}
        <div 
          className="absolute"
          style={{
            width: "324px",
            height: "440px",
            left: "0",
            top: "50px",
            border: "19px solid rgba(0,184,228,1)",
            borderRadius: "175px",
          }}
        />
        {/* Gold circle stroke */}
        <div 
          className="absolute"
          style={{
            width: "325px",
            height: "153px",
            left: "0",
            top: "600px",
            border: "19px solid rgba(226,197,48,1)",
            borderRadius: "973px",
          }}
        />
      </div>

      {/* Decorative Elements - Right Side */}
      <div 
        className="absolute pointer-events-none"
        style={{ right: "-400px", top: "0" }}
      >
        {/* Pink ellipse with blur */}
        <div 
          className="absolute"
          style={{
            width: "780px",
            height: "816px",
            right: "0",
            top: "0",
            background: "conic-gradient(from 90deg, rgba(225,37,144,1) 24%, rgba(244,153,193,1) 51%, rgba(197,2,121,1) 76%, rgba(184,0,112,1) 100%)",
            borderRadius: "50%",
            filter: "blur(332px)",
            opacity: 0.4,
          }}
        />
        {/* Pink circle stroke */}
        <div 
          className="absolute"
          style={{
            width: "465px",
            height: "465px",
            right: "100px",
            top: "200px",
            border: "19px solid rgba(225,37,144,1)",
            borderRadius: "50%",
          }}
        />
      </div>

      <div 
        className="w-full max-w-[1119px] flex flex-col items-center relative z-10"
        style={{ gap: "50px" }}
      >
        {/* Header */}
        <motion.div
          className="flex flex-col items-center"
          style={{ gap: "12px" }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* FAQ Label */}
          <span 
            className="text-[11px] font-light"
            style={{ color: "rgba(225, 37, 144, 1)" }}
          >
            FAQ
          </span>

          {/* Title */}
          <h2 
            className="text-[42px] font-bold italic leading-[35px] text-center"
            style={{ 
              letterSpacing: "-0.33px",
            }}
          >
            <span style={{ color: "#F7DC4E" }}>QUESTIONS?</span>{" "}
            <span style={{ color: "#FFFFFF" }}>WE&apos;VE GOT ANSWERS.</span>
          </h2>

          {/* Subtitle */}
          <p 
            className="text-[14px] leading-[19px] text-center"
            style={{
              background: "linear-gradient(180deg, #FFFFFF 0%, #999999 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Everything you need to know before your first power-up.
          </p>
        </motion.div>

        {/* FAQ Items */}
        <motion.div
          className="flex flex-col w-full"
          style={{ maxWidth: "581px", gap: "8px" }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              className="overflow-hidden"
              style={{
                borderRadius: "25px",
                background: "rgba(7, 7, 7, 0.19)",
                border: openIndex === index ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid transparent",
              }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex items-center justify-between text-left transition-colors"
                style={{ padding: "20px 24px" }}
              >
                {/* Left side - Star + Question */}
                <div className="flex items-center" style={{ gap: "16px" }}>
                  {/* Star symbol */}
                  <span 
                    className="text-[13px]"
                    style={{ color: "rgba(255, 255, 255, 1)" }}
                  >
                    ✦
                  </span>

                  {/* Question text */}
                  <span 
                    className="text-[17px] font-semibold"
                    style={{ color: "rgba(255, 255, 255, 1)" }}
                  >
                    {faq.question}
                  </span>
                </div>

                {/* Plus/Minus Icon */}
                <div 
                  className="relative flex items-center justify-center"
                  style={{ width: "16px", height: "16px" }}
                >
                  {/* Horizontal line */}
                  <div 
                    style={{
                      position: "absolute",
                      width: "13px",
                      height: "2px",
                      borderRadius: "10px",
                      background: "rgba(255, 255, 255, 1)",
                    }}
                  />
                  {/* Vertical line (hidden when open) */}
                  <motion.div 
                    style={{
                      position: "absolute",
                      width: "2px",
                      height: "13px",
                      borderRadius: "10px",
                      background: "rgba(255, 255, 255, 1)",
                    }}
                    animate={{ 
                      opacity: openIndex === index ? 0 : 1,
                      rotate: openIndex === index ? 90 : 0,
                    }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
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
                    <div 
                      className="text-[14px] leading-[21px] font-light"
                      style={{ 
                        padding: "0 24px 20px 53px",
                        color: "rgba(255, 255, 255, 0.6)",
                      }}
                    >
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom Section - Contact */}
        <motion.div
          className="flex flex-col items-center text-center"
          style={{ gap: "20px" }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          {/* Text */}
          <div className="flex flex-col items-center" style={{ gap: "8px" }}>
            <h3 
              className="text-[42px] font-bold italic leading-[42px]"
              style={{
                background: "linear-gradient(180deg, #FFFFFF 0%, #999999 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Still have questions?
            </h3>
            <p 
              className="text-[13px] leading-[13px]"
              style={{
                background: "linear-gradient(180deg, #FFFFFF 0%, #999999 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              We are here to help!
            </p>
          </div>

          {/* Contact Button */}
          <motion.a
            href="mailto:support@drinkyum.com"
            className="flex items-center justify-center text-[15px] text-white font-normal"
            style={{
              width: "110px",
              height: "35px",
              borderRadius: "10px",
              border: "1px solid #FFF",
              background: `radial-gradient(30.86% 27.56% at 77.68% 0%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.00) 100%), 
                           radial-gradient(54.33% 42.36% at 29.91% 100%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.00) 100%), 
                           rgba(220, 3, 135, 0.40)`,
              boxShadow: "inset 0 0 4px 0 #FFF",
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Contact Us
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}

