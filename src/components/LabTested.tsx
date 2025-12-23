"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function LabTested() {
  return (
    <section className="relative bg-[#070707] flex justify-center px-4 py-16 overflow-visible">
      <div 
        className="w-full max-w-[1184px] relative"
        style={{ minHeight: "481px" }} // 579 * 0.83
      >
        {/* Main Card with cutout shape */}
        <div 
          className="relative"
          style={{
            width: "1168px", // 1407 * 0.83
            height: "311px", // 375 * 0.83
          }}
        >
          {/* Card background with SVG clip-path for cutouts */}
          <svg 
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 1168 311"
            fill="none"
            preserveAspectRatio="none"
          >
            <defs>
              <clipPath id="cardClip">
                {/* Main rectangle with bottom-left and bottom-right cutouts */}
                <path d="
                  M0 0 
                  H1168 
                  V311 
                  H907 
                  Q897 311 897 301
                  V258
                  Q897 248 887 248
                  H281
                  Q271 248 271 258
                  V301
                  Q271 311 261 311
                  H0 
                  Z
                " />
              </clipPath>
            </defs>
            
            {/* Background fill */}
            <rect 
              width="1168" 
              height="311" 
              fill="rgba(15, 15, 15, 0.63)"
              clipPath="url(#cardClip)"
            />
            
            {/* Border stroke */}
            <path 
              d="
                M1 1 
                H1167 
                V310 
                H907 
                Q897 310 897 300
                V258
                Q897 248 887 248
                H281
                Q271 248 271 258
                V300
                Q271 310 261 310
                H1 
                Z
              "
              stroke="rgba(220, 3, 135, 1)"
              strokeWidth="1"
              fill="none"
            />
          </svg>

          {/* Content inside card */}
          <div className="relative z-10 flex h-full">
            {/* Left Content */}
            <motion.div
              className="flex flex-col justify-center"
              style={{ 
                padding: "52px 0 52px 73px", // Scaled padding
                width: "394px", // 475 * 0.83
                gap: "26px", // 31 * 0.83
              }}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              {/* Title section */}
              <div className="flex flex-col" style={{ gap: "0" }}>
                <h2 
                  className="text-[42px] font-bold italic leading-[50px]"
                  style={{
                    background: "linear-gradient(180deg, #FFFFFF 0%, #999999 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  EVERY BOTTLE.<br />
                  EVERY BATCH.<br />
                  VERIFIED.
                </h2>
                <p 
                  className="text-[13px] leading-[13px] mt-2"
                  style={{
                    background: "linear-gradient(180deg, #FFFFFF 0%, #999999 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  We don&apos;t ask you to trust us. We show you the proof.
                </p>
              </div>

              {/* Button */}
              <motion.a
                href="#"
                className="flex items-center justify-center text-[15px] text-white font-normal"
                style={{
                  width: "221px", // 266 * 0.83
                  height: "35px", // 42 * 0.83
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
                VIEW LAB REPORTS
              </motion.a>
            </motion.div>

            {/* Right Content - Description */}
            <motion.div
              className="flex items-end"
              style={{
                padding: "0 0 73px 0",
                marginLeft: "auto",
                marginRight: "289px", // Space for the image
                maxWidth: "305px", // 368 * 0.83
              }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <p 
                className="text-[13px] leading-[16px]"
                style={{
                  background: "linear-gradient(180deg, #FFFFFF 0%, #999999 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                In an industry full of mystery blends and unverified claims, we do things differently. 
                Every YUM bottle comes from a batch that&apos;s been independently tested and certified. 
                You get the actual mitragynine percentage, purity verification, and safety screening results. 
                We&apos;re not hiding behind proprietary formulas—we&apos;re proving our quality with real lab documentation.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Lab Tested Image - overlapping right side */}
        <motion.div
          className="absolute"
          style={{
            right: "0",
            bottom: "-85px", // Overlap below the card
            width: "402px", // 484 * 0.83
            height: "395px", // 476 * 0.83
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <Image
            src="/images/lab-tested.png"
            alt="Lab Tested Certified"
            fill
            className="object-contain"
            sizes="402px"
          />
        </motion.div>
      </div>
    </section>
  );
}

