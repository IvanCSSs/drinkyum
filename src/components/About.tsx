"use client";

import { motion } from "framer-motion";

const stats = [
  {
    label: "PURITY",
    value: "75%",
    description: "Pharmaceutical-grade precision. Every bottle.",
  },
  {
    label: "TESTED",
    value: "100%",
    description: "Third-party tested for potency, purity, and safety.",
  },
  {
    label: "Bitter Aftertaste",
    value: "0",
    description: "Pure flavor, no compromise",
  },
];

export default function About() {
  return (
    <section 
      id="about" 
      className="relative bg-[#070707] flex justify-center px-4 py-12 md:py-16"
    >
      {/* Main Container */}
      <div 
        className="w-full max-w-[1348px] flex flex-col gap-8 md:gap-[51px]"
      >
        {/* Top Section */}
        <motion.div 
          className="flex flex-col gap-4 md:gap-[17px]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Label row - right aligned on desktop, left on mobile */}
          <div className="flex items-center justify-start md:justify-end gap-[6px]">
            <div 
              className="w-[5px] h-[5px] rounded-full"
              style={{ background: "rgba(0, 184, 228, 1)" }}
            />
            <span 
              className="text-[16px] md:text-[20px] font-light leading-[20px] uppercase"
              style={{
                background: "linear-gradient(180deg, #FFFFFF 0%, #999999 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              about us
            </span>
          </div>

          {/* Main paragraph container */}
          <div className="flex justify-start md:justify-end p-0 md:p-[10px]">
            <p 
              className="text-[24px] sm:text-[28px] md:text-[36px] lg:text-[40px] font-light leading-[1.1] md:leading-[40px] w-full md:w-[1020px] text-left md:text-right"
            >
              <span 
                className="font-bold italic"
                style={{ color: "rgba(225, 37, 144, 1)" }}
              >
                YUM
              </span>
              <span
                style={{
                  background: "linear-gradient(135deg, #FFFFFF 0%, #999999 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {" "}is the result of relentless experimentation in pursuit of the perfect kratom extract. We&apos;ve achieved what others said was impossible: 75% mitragynine purity, zero bitterness, lab-verified consistency, and flavors so exceptional they&apos;ve become the benchmark for what premium extraction should deliver.
              </span>
            </p>
          </div>
        </motion.div>

        {/* Bottom Section - Stats */}
        <motion.div 
          className="flex justify-start md:justify-end"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Stats row - horizontal on desktop, vertical on mobile */}
          <div className="flex flex-col sm:flex-row w-full sm:w-auto">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="w-full sm:w-[200px] md:w-[253px] py-8 sm:py-0 sm:h-[253px] flex items-center justify-center sm:justify-start"
                style={{
                  borderLeft: index > 0 ? undefined : undefined,
                  borderTop: index > 0 ? "1px solid rgba(255, 255, 255, 0.1)" : undefined,
                }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                {/* Desktop border (left) - hidden on mobile */}
                <div 
                  className="hidden sm:block absolute left-0 top-0 bottom-0 w-px"
                  style={{ background: "rgba(255, 255, 255, 0.1)" }}
                />
                
                {/* Inner content */}
                <div 
                  className="flex flex-col gap-6 sm:gap-[52px] w-full sm:w-[199px] pl-4 sm:pl-6"
                  style={{
                    borderLeft: "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                >
                  {/* Label with cyan dot */}
                  <div className="flex items-center gap-[6px]">
                    <div 
                      className="w-[5px] h-[5px] rounded-full flex-shrink-0"
                      style={{ background: "rgba(0, 184, 228, 1)" }}
                    />
                    <span 
                      className="text-[16px] md:text-[20px] font-light leading-[20px] uppercase"
                      style={{
                        background: "linear-gradient(180deg, #FFFFFF 0%, #999999 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                    >
                      {stat.label}
                    </span>
                  </div>

                  {/* Big number */}
                  <span 
                    className="text-[48px] sm:text-[56px] md:text-[70px] font-semibold italic leading-[1]"
                    style={{ color: "rgba(225, 37, 144, 1)" }}
                  >
                    {stat.value}
                  </span>

                  {/* Description */}
                  <p 
                    className="text-[14px] md:text-[16px] font-light leading-[1.2] md:leading-[16px]"
                    style={{
                      background: "linear-gradient(180deg, #FFFFFF 0%, #999999 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {stat.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
