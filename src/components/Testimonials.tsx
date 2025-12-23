"use client";

import { motion } from "framer-motion";

/*
  HOW YUM ACTIVATES SUPERHUMAN MODE
  All dimensions scaled to 83% of Figma values
*/

const timelineCards = [
  {
    label: "IGNITION",
    time: "T+15",
    color: "rgba(225, 37, 144, 1)",
    dotColor: "rgba(225, 37, 144, 1)", // pink dot
    features: [
      "→ Neural pathways light up",
      "→ Sensory enhancement begins",
      "→ The world gets sharper",
    ],
    tagline: "You feel it before you think it",
    hasNotch: true,
  },
  {
    label: "PEAK STATE",
    time: "T+60",
    color: "rgba(0, 184, 228, 1)",
    dotColor: "rgba(0, 184, 228, 1)", // cyan dot
    features: [
      "→ Flow state unlocked",
      "→ Reaction time increases",
      "→ Multi-tasking becomes instinct",
    ],
    tagline: "This is what pro-level feels like",
    hasNotch: true,
  },
  {
    label: "SUSTAINED",
    time: "T+6-8H",
    color: "rgba(226, 197, 48, 1)",
    dotColor: "rgba(0, 184, 228, 1)", // cyan dot
    features: [
      "→ Zero crash",
      "→ Smooth decline",
      "→ Natural re-entry",
    ],
    tagline: "No withdrawal. No regrets.",
    hasNotch: true,
  },
];

export default function Testimonials() {
  return (
    <section 
      id="testimonials" 
      className="relative bg-[#070707] flex justify-center px-4 py-12"
    >
      {/* Main Container - 1168x329 (1407x396 * 0.83) */}
      <div className="w-full max-w-[1168px] relative" style={{ minHeight: "329px" }}>
        
        {/* Background bar - full width, behind cards, with gradient border */}
        <div 
          className="absolute left-0 right-0"
          style={{
            top: "54px",
            height: "264px",
            background: "rgba(15, 15, 15, 0.45)",
            borderRadius: "20px",
            zIndex: 0,
          }}
        />
        {/* Gradient border - top with rounded corners, dripping down sides */}
        <div 
          className="absolute left-0 right-0 pointer-events-none"
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

        {/* Content Layout - z-10 to appear above background */}
        <div className="relative flex z-10">
          {/* Left Section - Title & Description */}
          <motion.div
            className="flex flex-col justify-center"
            style={{
              width: "403px",
              padding: "87px 37px 57px 37px",
            }}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Title - Myriad Pro 700 Italic 26px (33 * 0.8), split styling */}
            <h2 className="text-[26px] font-bold italic leading-[26px] mb-4">
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

            {/* Description - Lato 400 13px (16 * 0.83), 50% opacity, width 307px */}
            <p 
              className="text-[13px] leading-[13px]"
              style={{ 
                color: "rgba(255, 255, 255, 0.5)",
                letterSpacing: "-0.13px",
                maxWidth: "307px",
              }}
            >
              This isn&apos;t caffeine jitters or sugar rushes. YUM activates a clean, powerful energy state that builds fast, peaks hard, and sustains longer than anything else you&apos;ve tried. Feel the ignition at 15 minutes. Own the peak for hours. Exit smoothly with zero regret.
            </p>
          </motion.div>

          {/* Right Section - Timeline Cards */}
          <div 
            className="flex"
            style={{ 
              gap: "32px",
              marginLeft: "auto",
              marginRight: "30px",
            }}
          >
            {timelineCards.map((card, index) => (
              <motion.div
                key={card.label}
                className="flex flex-col justify-center relative"
                style={{
                  width: "234px",
                  height: "289px",
                  padding: "56px 20px",
                  background: card.isHighlighted 
                    ? "linear-gradient(180deg, rgba(15, 25, 30, 1) 0%, rgba(15, 15, 15, 1) 100%)"
                    : "rgba(15, 15, 15, 1)",
                  boxShadow: card.isHighlighted 
                    ? "inset 0 0 60px rgba(0, 184, 228, 0.15)"
                    : "none",
                  zIndex: 10,
                  borderRadius: "16px",
                }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
              >
                {/* SVG border with notch shape - gradient from bottom */}
                <svg 
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox="0 0 234 289"
                  fill="none"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id={`border-gradient-${index}`} x1="0" y1="1" x2="0" y2="0">
                      <stop offset="0%" stopColor={card.color} />
                      <stop offset="60%" stopColor="rgba(123,20,78,0)" />
                    </linearGradient>
                  </defs>
                  {/* Path: rounded rect with notch at bottom center */}
                  <path 
                    d="M16 0 H218 Q234 0 234 16 V273 Q234 289 218 289 H182 Q172 289 172 282 V277 Q172 272 162 272 H72 Q62 272 62 277 V282 Q62 289 52 289 H16 Q0 289 0 273 V16 Q0 0 16 0 Z"
                    stroke={`url(#border-gradient-${index})`}
                    strokeWidth="1.5"
                    fill="none"
                  />
                </svg>
                
                {/* Label with colored dot */}
                <div className="flex items-center mb-4" style={{ gap: "5px" }}>
                  <div 
                    className="w-[4px] h-[4px] rounded-full"
                    style={{ background: card.dotColor }}
                  />
                  <span 
                    className="text-[17px] font-light leading-[17px] uppercase"
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

                {/* Time - Myriad Pro 700 Italic 58px (70 * 0.83) */}
                <span 
                  className="text-[41px] font-bold italic leading-[41px] mb-4"
                  style={{ color: card.color }}
                >
                  {card.time}
                </span>

                {/* Features - Lato 300 13px */}
                <div 
                  className="flex flex-col mb-4"
                  style={{ gap: "4px" }}
                >
                  {card.features.map((feature, i) => (
                    <span 
                      key={i}
                      className="text-[13px] font-light leading-[16px]"
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

                {/* Tagline - Lato 300 13px, colored */}
                <span 
                  className="text-[13px] font-light leading-[13px] mt-auto"
                  style={{ color: card.color }}
                >
                  {card.tagline}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
