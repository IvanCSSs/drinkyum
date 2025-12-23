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
      className="relative bg-[#070707] flex justify-center px-4 py-16"
    >
      {/* Main Container - 1348x561, VERTICAL layout, spacing 51px */}
      <div 
        className="w-full max-w-[1348px] flex flex-col"
        style={{ gap: "51px" }}
      >
        {/* Top Section - 1348x257, VERTICAL layout, spacing 17px */}
        <motion.div 
          className="flex flex-col"
          style={{ gap: "17px" }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Label row - right aligned */}
          <div className="flex items-center justify-end" style={{ gap: "6px" }}>
            {/* Cyan dot - 5x5 */}
            <div 
              className="w-[5px] h-[5px] rounded-full"
              style={{ background: "rgba(0, 184, 228, 1)" }}
            />
            {/* Label text - Myriad Pro 300 20px, gradient, uppercase */}
            <span 
              className="text-[20px] font-light leading-[20px] uppercase"
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

          {/* Main paragraph container - padding 10px */}
          <div className="flex justify-end" style={{ padding: "10px" }}>
            {/* Main text - 1020px wide, Myriad Pro Light 40px, gradient */}
            <p 
              className="text-[40px] font-light leading-[40px] w-[1020px] text-right"
              style={{
                letterSpacing: "0",
              }}
            >
              {/* "YUM" in Bold Italic Pink */}
              <span 
                className="font-bold italic"
                style={{ color: "rgba(225, 37, 144, 1)" }}
              >
                YUM
              </span>
              {/* Rest of text in gradient */}
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

        {/* Bottom Section - 759x253, positioned right */}
        <motion.div 
          className="flex justify-end"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Stats row - 3 boxes, each 253x253 */}
          <div className="flex">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="w-[253px] h-[253px] flex items-center justify-center"
                style={{
                  borderLeft: "1px solid rgba(255, 255, 255, 0.1)",
                }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                {/* Inner content - vertical layout, spacing 52px */}
                <div 
                  className="flex flex-col"
                  style={{ 
                    gap: "52px",
                    width: "199px",
                  }}
                >
                  {/* Label with cyan dot */}
                  <div className="flex items-center" style={{ gap: "6px" }}>
                    {/* Cyan dot - 5x5 */}
                    <div 
                      className="w-[5px] h-[5px] rounded-full flex-shrink-0"
                      style={{ background: "rgba(0, 184, 228, 1)" }}
                    />
                    {/* Label - Myriad Pro 300 20px, gradient, uppercase */}
                    <span 
                      className="text-[20px] font-light leading-[20px] uppercase"
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

                  {/* Big number - Myriad Pro 600 Italic 70px, pink */}
                  <span 
                    className="text-[70px] font-semibold italic leading-[70px]"
                    style={{ color: "rgba(225, 37, 144, 1)" }}
                  >
                    {stat.value}
                  </span>

                  {/* Description - Myriad Pro 300 16px, gradient */}
                  <p 
                    className="text-[16px] font-light leading-[16px]"
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
