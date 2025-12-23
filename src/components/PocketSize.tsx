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
      <div 
        className="w-full max-w-[1119px] flex flex-col"
        style={{ gap: "14px" }} // 17 * 0.83
      >
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-[42px] font-bold italic leading-[49px] uppercase">
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

        {/* Content Grid */}
        <div 
          className="flex gap-[8px]"
          style={{ minHeight: "450px" }}
        >
          {/* Left Column - Features + Small Image */}
          <div 
            className="flex flex-col"
            style={{ width: "448px", gap: "33px" }} // 540 * 0.83, 40 * 0.83
          >
            {/* Features Grid 2x2 */}
            <div 
              className="grid grid-cols-2"
              style={{ gap: "17px 60px", paddingTop: "40px" }} // row gap, col gap + top padding
            >
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className="flex flex-col"
                  style={{ gap: "3px" }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <h3 
                    className="text-[20px] font-semibold leading-[23px]"
                    style={{ color: "rgba(220, 3, 135, 1)" }}
                  >
                    {feature.title}
                  </h3>
                  <p 
                    className="text-[13px] leading-[22px]"
                    style={{ color: "rgba(255, 255, 255, 0.6)" }}
                  >
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Small Image */}
            <motion.div
              className="relative overflow-hidden"
              style={{ 
                width: "437px", // 526 * 0.83
                height: "245px", // 295 * 0.83
                borderRadius: "33px", // 40 * 0.83
              }}
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
                sizes="437px"
              />
            </motion.div>
          </div>

          {/* Right Column - Large Image + Description + Button */}
          <div 
            className="flex flex-col"
            style={{ width: "619px", gap: "22px" }} // 746 * 0.83, 26 * 0.83
          >
            {/* Large Image */}
            <motion.div
              className="relative overflow-hidden"
              style={{ 
                width: "619px", // 746 * 0.83
                height: "358px", // 432 * 0.83
                borderRadius: "25px", // 30 * 0.83
              }}
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
                sizes="619px"
              />
            </motion.div>

            {/* Bottom Row - Description + Button */}
            <div 
              className="flex items-center justify-between"
              style={{ gap: "90px" }} // 109 * 0.83
            >
              {/* Description */}
              <motion.p
                className="text-[13px] leading-[16px]"
                style={{ 
                  color: "rgba(255, 255, 255, 0.6)",
                  maxWidth: "356px", // 429 * 0.83
                }}
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
                className="flex items-center justify-center text-[15px] text-white font-normal"
                style={{
                  width: "173px", // 208 * 0.83
                  height: "50px", // 60 * 0.83
                  borderRadius: "10px", // 12 * 0.83
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
                whileHover={{ scale: 1.02, brightness: 1.1 }}
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

