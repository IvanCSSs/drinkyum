"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative min-h-screen bg-[#070707] flex items-center justify-center px-4 pt-20 md:pt-0 pb-8">
      {/* Mobile/Tablet: Logo at top of page (scrolls with content) */}
      <div className="lg:hidden absolute top-10 left-1/2 -translate-x-1/2 z-40">
        <a href="/">
          <img
            src="/images/logo.svg"
            alt="YUM - DrinkYUM"
            className="h-[30px] w-auto"
          />
        </a>
      </div>

      {/* Background Image - Full width, behind everything */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero-bg.png"
          alt=""
          fill
          className="object-cover object-center"
          priority
        />
        {/* Gradient overlays */}
        <div 
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(7,7,7,0.4) 40%, rgba(7,7,7,0.7) 70%, rgba(7,7,7,1) 100%),
              linear-gradient(to right, rgba(7,7,7,0.6) 0%, rgba(7,7,7,0) 40%, rgba(7,7,7,0) 60%, rgba(7,7,7,0.6) 100%)
            `,
          }}
        />
      </div>

      {/* Hero Container */}
      <div 
        className="relative w-full max-w-[1348px] min-h-[600px] md:h-[789px] rounded-[20px] md:rounded-[30px] overflow-hidden"
        style={{
          border: "1px solid rgba(220, 3, 135, 1)",
        }}
      >

        {/* Pink blur behind product */}
        <div
          className="absolute left-1/2 -translate-x-1/2 w-[400px] md:w-[885px] h-[400px] md:h-[885px] rounded-full pointer-events-none"
          style={{
            top: "-50px",
            background: "rgba(220, 3, 135, 0.35)",
            filter: "blur(150px)",
          }}
        />

        {/* Product Bottle - responsive sizing */}
        <motion.div
          className="absolute left-1/2 z-10"
          style={{ top: "60px" }}
          initial={{ opacity: 0, scale: 0.95, x: "-50%", y: "0" }}
          animate={{ opacity: 1, scale: 1, x: "-50%", y: "0" }}
          transition={{ duration: 0.8 }}
        >
          {/* Mobile bottle */}
          <img
            src="/images/hero-product.png"
            alt="YUM Kratom Extract Bottle"
            className="block md:hidden drop-shadow-2xl"
            style={{ 
              width: "350px", 
              height: "auto", 
              maxWidth: "none",
            }}
          />
          {/* Tablet bottle */}
          <img
            src="/images/hero-product.png"
            alt="YUM Kratom Extract Bottle"
            className="hidden md:block lg:hidden drop-shadow-2xl"
            style={{ 
              width: "600px", 
              height: "auto", 
              maxWidth: "none",
            }}
          />
          {/* Desktop bottle */}
          <img
            src="/images/hero-product.png"
            alt="YUM Kratom Extract Bottle"
            className="hidden lg:block drop-shadow-2xl"
            style={{ 
              width: "1150px", 
              height: "auto", 
              maxWidth: "none",
              transform: "translateX(9%)",
            }}
          />
        </motion.div>

        {/* Content Container */}
        <div 
          className="relative z-20 flex flex-col h-full px-4 py-8 md:px-[25px] md:py-[50px]"
        >
          {/* Spacer for nav bar area */}
          <div className="h-[40px] md:h-[65px]" />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col justify-between">
            
            {/* Headline with buttons */}
            <motion.div
              className="mt-[280px] md:mt-[100px] px-0 md:px-[75px] lg:px-[100px]"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {/* Headline - responsive font size */}
              <h1 
                className="text-[32px] sm:text-[42px] md:text-[50px] lg:text-[58px] font-bold italic leading-[1] mb-[14px]"
                style={{
                  background: "linear-gradient(180deg, #FFFFFF 0%, #999999 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  maxWidth: "530px",
                }}
              >
                YOUR
                <br />
                UNSTOPPABLE
                <br />
                MOMENT
              </h1>

              {/* Buttons - wrap on mobile */}
              <div className="flex flex-wrap gap-3 md:gap-[17px]">
                <a 
                  href="/shop" 
                  className="flex items-center justify-center text-white text-[14px] md:text-[18px] font-normal transition-all hover:brightness-110"
                  style={{
                    width: "106px",
                    height: "38px",
                    background: "rgba(220, 3, 135, 0.40)",
                    borderRadius: "10px",
                    boxShadow: "inset 0 0 4px rgba(255,255,255,0.3)",
                  }}
                >
                  Order Now
                </a>
                
                <a 
                  href="/subscribe" 
                  className="flex items-center justify-center text-white text-[14px] md:text-[18px] font-normal transition-all hover:brightness-110"
                  style={{
                    width: "160px",
                    height: "38px",
                    background: "rgba(0, 162, 200, 0.20)",
                    borderRadius: "10px",
                    boxShadow: "inset 0 0 4px rgba(255,255,255,0.3)",
                  }}
                >
                  Subscribe & Save
                </a>
              </div>
            </motion.div>

            {/* Bottom Section - stack on mobile */}
            <div 
              className="flex flex-col lg:flex-row justify-between items-start lg:items-end mt-8 lg:mt-auto gap-6 lg:gap-0 px-0 md:px-[25px]"
            >
              {/* Left - Description with decorative arc */}
              <motion.div
                className="relative w-full lg:w-[509px] min-h-[120px] lg:h-[255px]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                {/* Decorative arc container - hidden on mobile */}
                <div className="hidden lg:flex absolute left-0 top-0 w-[255px] h-[255px] items-center justify-center">
                  <svg width="173" height="173" viewBox="0 0 173 173" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle 
                      cx="86.3854" 
                      cy="86.3852" 
                      r="85.8697" 
                      transform="rotate(29.0982 86.3854 86.3852)" 
                      fill="url(#paint0_linear_134_269)" 
                      fillOpacity="0.45" 
                      stroke="url(#paint1_linear_134_269)"
                    />
                    <defs>
                      <linearGradient id="paint0_linear_134_269" x1="0.0156555" y1="86.3852" x2="114.219" y2="88.1828" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#00A2C8"/>
                        <stop offset="1" stopOpacity="0"/>
                      </linearGradient>
                      <linearGradient id="paint1_linear_134_269" x1="10.7056" y1="140.555" x2="66.2209" y2="85.052" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#E6D52B"/>
                        <stop offset="1" stopColor="#760248" stopOpacity="0"/>
                      </linearGradient>
                    </defs>
                  </svg>
                  <svg 
                    className="absolute" 
                    width="88" 
                    height="88" 
                    viewBox="0 0 88 88" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="44" cy="44" r="44" fill="#080808"/>
                  </svg>
                </div>

                {/* Body text - responsive positioning */}
                <p 
                  className="text-[14px] lg:text-[16px] leading-[1.4] lg:leading-[16px] tracking-[-0.16px] max-w-full lg:max-w-[396px] lg:absolute"
                  style={{ 
                    left: "113px", 
                    top: "88px",
                    background: "linear-gradient(180deg, rgba(255,255,255,0.6) 0%, rgba(153,153,153,0.6) 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Crafted with only the finest ingredients, our extract promises 
                  unparalleled taste and efficacy. We guarantee quality with third-party 
                  testing, showcasing a premium 7.5% mitragyna extract. Experience the 
                  difference with YUM, where quality meets unbeatable flavor.
                </p>
              </motion.div>

              {/* Right - 15K Stats box */}
              <motion.div
                className="flex flex-col justify-center items-center w-full sm:w-auto"
                style={{
                  width: "100%",
                  maxWidth: "341px",
                  padding: "30px 20px",
                  gap: "10px",
                  borderRadius: "24px",
                  border: "1px solid #00A2C8",
                  background: "rgba(8, 8, 8, 0.35)",
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                <h3 
                  className="font-semibold italic text-[28px] sm:text-[36px] md:text-[40px]"
                  style={{
                    lineHeight: "100%",
                    background: "linear-gradient(103.87deg, #FFFFFF 0%, rgba(220, 3, 135, 0.4) 70.8%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  15K active subs
                </h3>
                
                <p 
                  className="text-center lg:text-left text-[14px] md:text-[16px]"
                  style={{ 
                    maxWidth: "280px",
                    lineHeight: "120%",
                    letterSpacing: "-0.01em",
                    color: "rgba(255, 255, 255, 0.7)",
                  }}
                >
                  15,000 of you are now a part of YUM&apos;s universe.{" "}
                  <span 
                    className="font-extrabold italic"
                    style={{ color: "rgba(220, 3, 135, 1)" }}
                  >
                    Welcome to God mode.
                  </span>
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
