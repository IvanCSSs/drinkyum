"use client";

import { motion } from "framer-motion";

const timelineCards = [
  {
    label: "IGNITION",
    time: "T+15",
    color: "rgba(225, 37, 144, 1)",
    dotColor: "rgba(225, 37, 144, 1)",
    features: [
      "→ Neural pathways light up",
      "→ Sensory enhancement begins",
      "→ The world gets sharper",
    ],
    tagline: "You feel it before you think it",
  },
  {
    label: "PEAK STATE",
    time: "T+60",
    color: "rgba(0, 184, 228, 1)",
    dotColor: "rgba(0, 184, 228, 1)",
    features: [
      "→ Flow state unlocked",
      "→ Reaction time increases",
      "→ Multi-tasking becomes instinct",
    ],
    tagline: "This is what pro-level feels like",
  },
  {
    label: "SUSTAINED",
    time: "T+6-8H",
    color: "rgba(226, 197, 48, 1)",
    dotColor: "rgba(0, 184, 228, 1)",
    features: [
      "→ Zero crash",
      "→ Smooth decline",
      "→ Natural re-entry",
    ],
    tagline: "No withdrawal. No regrets.",
  },
];

export default function Testimonials() {
  return (
    <section 
      id="testimonials" 
      className="relative bg-[#070707] flex justify-center px-4 py-12"
    >
      <div className="w-full max-w-[1168px] relative">
        
        {/* Background bar - hidden on mobile */}
        <div 
          className="hidden lg:block absolute left-0 right-0"
          style={{
            top: "54px",
            height: "264px",
            background: "rgba(15, 15, 15, 0.45)",
            borderRadius: "20px",
            zIndex: 0,
          }}
        />
        {/* Gradient border */}
        <div 
          className="hidden lg:block absolute left-0 right-0 pointer-events-none"
          style={{
            top: "54px",
            height: "264px",
            borderRadius: "20px",
            padding: "1px",
            background: "linear-gradient(180deg, rgba(217,217,217,0.6) 0%, rgba(118,1,72,0) 50%)",
            WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
            zIndex: 5,
          }}
        />

        {/* Content Layout - stack on mobile */}
        <div className="relative flex flex-col lg:flex-row z-10">
          {/* Left Section - Title & Description */}
          <motion.div
            className="flex flex-col justify-center mb-8 lg:mb-0 px-0 lg:px-[37px] lg:py-[57px] lg:w-[403px]"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-[22px] sm:text-[24px] lg:text-[26px] font-bold italic leading-[1.2] mb-4">
              <span
                style={{
                  background: "linear-gradient(135deg, #FFFFFF 0%, #999999 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                HOW YUM ACTIVATES{" "}
              </span>
              <span style={{ color: "rgba(225, 37, 144, 1)" }}>
                SUPERHUMAN MODE
              </span>
            </h2>

            <p 
              className="text-[13px] leading-[1.4] max-w-[307px]"
              style={{ 
                color: "rgba(255, 255, 255, 0.5)",
                letterSpacing: "-0.13px",
              }}
            >
              This isn&apos;t caffeine jitters or sugar rushes. YUM activates a clean, powerful energy state that builds fast, peaks hard, and sustains longer than anything else you&apos;ve tried.
            </p>
          </motion.div>

          {/* Right Section - Timeline Cards - horizontal scroll on mobile */}
          <div 
            className="flex overflow-x-auto lg:overflow-visible gap-4 lg:gap-8 pb-4 lg:pb-0 -mx-4 px-4 lg:mx-0 lg:px-0 lg:ml-auto lg:mr-[30px] scrollbar-hide"
          >
            {timelineCards.map((card, index) => (
              <motion.div
                key={card.label}
                className="flex flex-col justify-center relative flex-shrink-0"
                style={{
                  width: "200px",
                  minWidth: "200px",
                  height: "260px",
                  padding: "40px 16px",
                  background: "rgba(15, 15, 15, 1)",
                  zIndex: 10,
                  borderRadius: "16px",
                }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
              >
                {/* SVG border with notch shape */}
                <svg 
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox="0 0 200 260"
                  fill="none"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id={`border-gradient-${index}`} x1="0" y1="1" x2="0" y2="0">
                      <stop offset="0%" stopColor={card.color} />
                      <stop offset="60%" stopColor="rgba(123,20,78,0)" />
                    </linearGradient>
                  </defs>
                  <path 
                    d="M16 0 H184 Q200 0 200 16 V244 Q200 260 184 260 H156 Q146 260 146 253 V248 Q146 243 136 243 H64 Q54 243 54 248 V253 Q54 260 44 260 H16 Q0 260 0 244 V16 Q0 0 16 0 Z"
                    stroke={`url(#border-gradient-${index})`}
                    strokeWidth="1.5"
                    fill="none"
                  />
                </svg>
                
                {/* Label with colored dot */}
                <div className="flex items-center mb-3 gap-[5px]">
                  <div 
                    className="w-[4px] h-[4px] rounded-full"
                    style={{ background: card.dotColor }}
                  />
                  <span 
                    className="text-[14px] lg:text-[17px] font-light leading-[17px] uppercase"
                    style={{
                      background: "linear-gradient(180deg, #FFFFFF 0%, #999999 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {card.label}
                  </span>
                </div>

                {/* Time */}
                <span 
                  className="text-[32px] lg:text-[41px] font-bold italic leading-[1] mb-3"
                  style={{ color: card.color }}
                >
                  {card.time}
                </span>

                {/* Features */}
                <div className="flex flex-col gap-1 mb-3">
                  {card.features.map((feature, i) => (
                    <span 
                      key={i}
                      className="text-[12px] lg:text-[13px] font-light leading-[1.3]"
                      style={{
                        background: "linear-gradient(180deg, #FFFFFF 0%, #999999 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                {/* Tagline */}
                <span 
                  className="text-[12px] lg:text-[13px] font-light leading-[13px] mt-auto"
                  style={{ color: card.color }}
                >
                  {card.tagline}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}
