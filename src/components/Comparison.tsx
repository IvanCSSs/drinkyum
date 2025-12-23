"use client";

import { motion } from "framer-motion";

const yumFeatures = [
  { label: "Activation Time", value: "15 minutes" },
  { label: "Duration", value: "6-8 hours" },
  { label: "Crash", value: "Zero" },
  { label: "Taste", value: "Exceptional" },
  { label: "Purity", value: "75% mitragynine" },
  { label: "Lab Testing", value: "Every batch" },
  { label: "Portability", value: "Pocket-sized" },
  { label: "Price per Dose", value: "Premium but worth it" },
];

const competitorFeatures = [
  { label: "Activation Time", value: "30-45 minutes" },
  { label: "Duration", value: "2-3 hours" },
  { label: "Crash", value: "Severe" },
  { label: "Taste", value: "Artificial" },
  { label: "Purity", value: "Caffeine + sugar" },
  { label: "Lab Testing", value: "Never" },
  { label: "Portability", value: "Bulky cans" },
  { label: "Price per Dose", value: "Cheap and ineffective" },
];

const GradientArrow = () => (
  <span
    className="text-[13px]"
    style={{
      background: "linear-gradient(135deg, rgba(0,184,228,1) 0%, rgba(225,37,144,1) 50%, rgba(226,197,48,1) 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
    }}
  >
    ➤
  </span>
);

export default function Comparison() {
  return (
    <section className="relative bg-[#070707] flex justify-center px-4 py-16 lg:pt-32 lg:pb-32 overflow-hidden">
      {/* Background decorative text - hidden on mobile */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img 
        src="/images/love-it-taste-it-feel-it.svg" 
        alt=""
        className="hidden lg:block absolute pointer-events-none select-none"
        style={{
          width: "1400px",
          height: "auto",
          top: "80px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 0,
        }}
      />

      {/* Background pink glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full lg:w-[978px] h-[200px] lg:h-[360px]"
        style={{
          borderRadius: "978px",
          background: "rgba(220, 3, 135, 0.11)",
          filter: "blur(80px)",
        }}
      />

      <div className="w-full max-w-[1119px] flex flex-col items-center relative z-10 gap-8 lg:gap-[41px]">
        {/* Header */}
        <motion.div
          className="flex flex-col items-center text-center gap-3 lg:gap-[14px]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-[24px] sm:text-[32px] lg:text-[42px] font-bold italic leading-[1.1]">
            <span
              style={{
                background: "linear-gradient(180deg, #FFFFFF 0%, #999999 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              WHY{" "}
            </span>
            <span style={{ color: "rgb(225, 37, 144)" }}>YUM</span>
            <span
              style={{
                background: "linear-gradient(180deg, #FFFFFF 0%, #999999 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {" "}DESTROYS THE COMPETITION
            </span>
          </h2>
          <p 
            className="text-[13px] leading-[1.4] max-w-[300px] lg:max-w-none"
            style={{
              background: "linear-gradient(180deg, #FFFFFF 0%, #999999 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Not all energy solutions are created equal. Here&apos;s why YUM isn&apos;t even playing the same game.
          </p>
        </motion.div>

        {/* Comparison Cards - stack on mobile */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-[22px] w-full lg:w-auto">
          {/* YUM Card */}
          <motion.div
            className="flex flex-col relative overflow-hidden w-full lg:w-[326px] p-4 lg:p-[21px] rounded-[20px] lg:rounded-[23px] gap-4 lg:gap-[17px]"
            style={{
              border: "1px solid rgba(225, 37, 144, 1)",
              background: "rgba(0, 0, 0, 0.25)",
              boxShadow: "0 0 39px rgba(0, 0, 0, 0.3)",
            }}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Radial gradient overlay */}
            <div 
              className="absolute inset-0 pointer-events-none rounded-[20px] lg:rounded-[23px]"
              style={{
                background: "radial-gradient(ellipse at top left, rgba(225,37,144,0.15) 0%, rgba(0,184,228,0.08) 46%, rgba(226,197,48,0.05) 100%)",
              }}
            />

            {/* Header */}
            <div className="flex items-center relative z-10 gap-3">
              <div 
                className="relative overflow-hidden w-10 h-10 lg:w-[49px] lg:h-[49px] rounded-[10px] lg:rounded-[13px]"
                style={{ boxShadow: "0 0 44px rgba(225, 37, 144, 0.4)" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src="/images/yum-icon.svg" 
                  alt="YUM" 
                  style={{
                    width: "100%",
                    height: "100%",
                    transform: "scale(2.8) translate(0%, 10%)",
                    transformOrigin: "center center",
                  }}
                />
              </div>
              <span 
                className="text-[20px] lg:text-[23px] font-bold italic"
                style={{ color: "rgba(225, 37, 144, 1)" }}
              >
                YUM
              </span>
            </div>

            {/* Features List */}
            <div 
              className="flex flex-col relative z-10 p-3 lg:p-[13px] rounded-[7px] gap-2 lg:gap-[9px]"
              style={{
                background: "rgba(0, 0, 0, 0.5)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
              }}
            >
              {yumFeatures.map((feature, index) => (
                <div key={feature.label}>
                  <div className="flex items-start gap-[5px]">
                    <GradientArrow />
                    <span className="text-[12px] lg:text-[13px]">
                      <span style={{ color: "rgba(255, 255, 255, 0.6)" }}>
                        {feature.label}:{" "}
                      </span>
                      <span style={{ color: "#00B8E4" }}>
                        {feature.value}
                      </span>
                    </span>
                  </div>
                  {index < yumFeatures.length - 1 && (
                    <div className="mt-2 lg:mt-[9px] h-px" style={{ background: "rgba(255, 255, 255, 0.2)" }} />
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Energy Drinks Card */}
          <motion.div
            className="flex flex-col relative overflow-hidden w-full lg:w-[337px] p-4 lg:p-[21px] rounded-[20px] lg:rounded-[23px] gap-4 lg:gap-[17px]"
            style={{
              border: "1px solid rgba(255, 255, 255, 0.2)",
              background: "rgba(0, 0, 0, 0.25)",
              boxShadow: "0 0 39px rgba(0, 0, 0, 0.3)",
            }}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {/* Radial gradient overlay */}
            <div 
              className="absolute inset-0 pointer-events-none rounded-[20px] lg:rounded-[23px]"
              style={{
                background: "radial-gradient(ellipse at top left, rgba(225,37,144,0.08) 0%, rgba(0,184,228,0.05) 46%, rgba(226,197,48,0.03) 100%)",
              }}
            />

            {/* Header */}
            <div className="flex items-center relative z-10 gap-3">
              <div 
                className="relative overflow-hidden w-10 h-10 lg:w-[49px] lg:h-[49px] rounded-[10px] lg:rounded-[13px]"
                style={{ boxShadow: "0 0 44px rgba(255, 255, 255, 0.2)" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src="/images/energy-drink-icon.svg" 
                  alt="Energy Drinks" 
                  style={{
                    width: "100%",
                    height: "100%",
                    transform: "scale(2.8) translate(0%, 10%)",
                    transformOrigin: "center center",
                  }}
                />
              </div>
              <span 
                className="text-[20px] lg:text-[23px] font-bold italic"
                style={{
                  background: "linear-gradient(180deg, #FFFFFF 0%, #999999 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Energy Drinks
              </span>
            </div>

            {/* Features List */}
            <div 
              className="flex flex-col relative z-10 p-3 lg:p-[13px] rounded-[7px] gap-2 lg:gap-[9px]"
              style={{
                background: "rgba(0, 0, 0, 0.5)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
              }}
            >
              {competitorFeatures.map((feature, index) => (
                <div key={feature.label}>
                  <div className="flex items-start gap-[5px]">
                    <GradientArrow />
                    <span className="text-[12px] lg:text-[13px]" style={{ color: "rgba(255, 255, 255, 0.6)" }}>
                      {feature.label}: {feature.value}
                    </span>
                  </div>
                  {index < competitorFeatures.length - 1 && (
                    <div className="mt-2 lg:mt-[9px] h-px" style={{ background: "rgba(255, 255, 255, 0.2)" }} />
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
