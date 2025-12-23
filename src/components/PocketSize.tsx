"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const features = [
  {
    title: "TSA-Friendly",
    description: "Take it everywhere legally",
  },
  {
    title: "Same 75% Extract",
    description: "No compromise on quality",
  },
  {
    title: "Throw Anywhere",
    description: "Gym bag, jacket, car, desk drawer",
  },
  {
    title: "Pocket-Sized Power",
    description: "Smaller than a car key fob",
  },
];

export default function PocketSize() {
  return (
    <section 
      id="pocket-size" 
      className="relative bg-[#070707] flex justify-center px-4 py-12"
    >
      <div className="w-full max-w-[1119px] flex flex-col gap-4 lg:gap-[14px]">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-[28px] sm:text-[36px] lg:text-[42px] font-bold italic leading-[1.15] uppercase">
            <span
              style={{
                background: "linear-gradient(180deg, #FFFFFF 0%, #999999 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Power that fits anywhere.{" "}
            </span>
            <span style={{ color: "rgb(225, 37, 144)" }}>
              14ml.
            </span>
          </h2>
        </motion.div>

        {/* Content Grid - stack on mobile */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-[8px]">
          {/* Left Column - Features + Small Image */}
          <div className="flex flex-col gap-6 lg:gap-[33px] w-full lg:w-[448px]">
            {/* Features Grid 2x2 */}
            <div className="grid grid-cols-2 gap-4 lg:gap-x-[60px] lg:gap-y-[17px] pt-4 lg:pt-[40px]">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className="flex flex-col gap-1"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <h3 
                    className="text-[16px] lg:text-[20px] font-semibold leading-[1.2]"
                    style={{ color: "rgba(220, 3, 135, 1)" }}
                  >
                    {feature.title}
                  </h3>
                  <p 
                    className="text-[12px] lg:text-[13px] leading-[1.5]"
                    style={{ color: "rgba(255, 255, 255, 0.6)" }}
                  >
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Small Image - full width on mobile */}
            <motion.div
              className="relative overflow-hidden w-full lg:w-[437px] h-[200px] sm:h-[245px] rounded-[20px] lg:rounded-[33px]"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Image
                src="/images/pocket-size-1.jpg"
                alt="14ml YUM bottle - compact size"
                fill
                className="object-cover scale-110"
                sizes="(max-width: 1024px) 100vw, 437px"
              />
            </motion.div>
          </div>

          {/* Right Column - Large Image + Description + Button */}
          <div className="flex flex-col gap-4 lg:gap-[22px] w-full lg:w-[619px]">
            {/* Large Image */}
            <motion.div
              className="relative overflow-hidden w-full h-[220px] sm:h-[280px] lg:h-[358px] rounded-[20px] lg:rounded-[25px]"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Image
                src="/images/pocket-size-2.jpg"
                alt="14ml YUM bottle lifestyle"
                fill
                className="object-cover scale-110"
                sizes="(max-width: 1024px) 100vw, 619px"
              />
            </motion.div>

            {/* Bottom Row - stack on mobile */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 lg:gap-[90px]">
              {/* Description */}
              <motion.p
                className="text-[13px] leading-[1.4] max-w-full lg:max-w-[356px]"
                style={{ color: "rgba(255, 255, 255, 0.6)" }}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                All the power of our 30ml bottles, optimized for shorter missions. 
                The 14ml is your rapid deployment option—pocket-sized dominance for 
                when you need a quick power-up without committing to the full 6-8 hour window.
              </motion.p>

              {/* CTA Button */}
              <motion.button
                className="flex items-center justify-center text-[14px] lg:text-[15px] text-white font-normal w-full sm:w-auto"
                style={{
                  minWidth: "160px",
                  height: "45px",
                  borderRadius: "10px",
                  border: "1px solid #FFF",
                  background: `radial-gradient(30.86% 27.56% at 77.68% 0%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.00) 100%), 
                               radial-gradient(54.33% 42.36% at 29.91% 100%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.00) 100%), 
                               rgba(220, 3, 135, 0.40)`,
                  boxShadow: "inset 0 0 4px 0 #FFF",
                }}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Grab the new size
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
