"use client";

import { motion } from "framer-motion";
import Image from "next/image";

/*
  FIGMA SPECS (from node 134-822):
  ================================
  Hero Frame: 1348 × 949px
  - Layout: VERTICAL, gap=50, center alignment
  - Padding: top=50, right=25, bottom=100, left=25
  - Border: 1px solid rgba(220,3,135,1) 
  - Border Radius: 30px

  Product: 539×1074 at x=481, y=85
  - Pink blur ellipse: 885×885 at x=278, y=-115, rgba(220,3,135,0.35), blur=250
  - Bottle image: 519×1054 at x=491, y=95

  Nav bar: 1298×65 at x=25, y=50
  - Background: rgba(1,6,25,0.05), blur=20
  - Border radius: 16px

  Headline: 530×210 at x=60, y=265
  - Font: Myriad Pro 700 70px
  - Fill: gradient white to #999

  Buttons: at y=492
  - Order Now: 106×42, rgba(220,3,135,0.40), radius=12
  - Subscribe: 170×42, rgba(0,162,200,0.20), radius=12

  15K box: 366×179 at x=932, y=632
  - Background: rgba(7,7,7,0.35)
  - Border radius: 39px
*/

export default function Hero() {
  return (
    <section className="relative min-h-screen bg-[#070707] flex items-center justify-center px-4 pt-0 pb-8">
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

      {/* Hero Container - 83% of Figma's 951px = 789px */}
      <div 
        className="relative w-full max-w-[1348px] h-[789px] rounded-[30px] overflow-hidden"
        style={{
          border: "1px solid rgba(220, 3, 135, 1)",
        }}
      >

        {/* Pink blur behind product - 885×885, blur=250, positioned center-top */}
        <div
          className="absolute left-1/2 -translate-x-1/2 w-[885px] h-[885px] rounded-full pointer-events-none"
          style={{
            top: "-115px",
            background: "rgba(220, 3, 135, 0.35)",
            filter: "blur(250px)",
          }}
        />

        {/* Product Bottle - 1000px wide, shifted slightly right */}
        <motion.div
          className="absolute left-1/2 z-10"
          style={{ top: "95px" }}
          initial={{ opacity: 0, scale: 0.95, x: "-41%", y: "-7%" }}
          animate={{ opacity: 1, scale: 1, x: "-41%", y: "-7%" }}
          transition={{ duration: 0.8 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/hero-product.png"
            alt="YUM Kratom Extract Bottle"
            style={{ 
              width: "1150px", 
              height: "auto", 
              maxWidth: "none",
            }}
            className="drop-shadow-2xl"
          />
        </motion.div>

        {/* Nav Bar - 1298×65 at x=25, y=50 */}
        {/* Note: Navbar is a separate component, positioned here for reference */}

        {/* Content Container - padding: 50px top, 100px bottom = 799px content area */}
        <div 
          className="relative z-20 flex flex-col h-full"
          style={{
            padding: "50px 25px 100px 25px",
            gap: "50px",
          }}
        >
          {/* Spacer for nav bar area */}
          <div className="h-[65px]" />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col justify-between">
            
            {/* Headline with buttons - at y=265 from top (accounting for nav) */}
            <motion.div
              className="mt-[100px]"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {/* Headline - 530×210, Myriad Pro 700 70px */}
              <h1 
                className="text-[70px] font-bold italic leading-[1] mb-[17px]"
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

              {/* Buttons - gap=17 */}
              <div className="flex gap-[17px]">
                {/* Order Now - 106×42, rgba(220,3,135,0.40), radius=12 */}
                <a 
                  href="/shop" 
                  className="flex items-center justify-center text-white text-[18px] font-normal transition-all hover:brightness-110"
                  style={{
                    width: "106px",
                    height: "42px",
                    background: "rgba(220, 3, 135, 0.40)",
                    borderRadius: "12px",
                    boxShadow: "inset 0 0 4px rgba(255,255,255,0.3)",
                  }}
                >
                  Order Now
                </a>
                
                {/* Subscribe and Save - 170×42, rgba(0,162,200,0.20), radius=12 */}
                <a 
                  href="/subscribe" 
                  className="flex items-center justify-center text-white text-[18px] font-normal transition-all hover:brightness-110"
                  style={{
                    width: "170px",
                    height: "42px",
                    background: "rgba(0, 162, 200, 0.20)",
                    borderRadius: "12px",
                    boxShadow: "inset 0 0 4px rgba(255,255,255,0.3)",
                  }}
                >
                  Subscribe and Save
                </a>
              </div>
            </motion.div>

            {/* Bottom Section - body text and 15K subs */}
            <div 
              className="flex justify-between items-end mt-auto"
              style={{ padding: "0 25px" }}
            >
              {/* Left - Description with decorative arc (509x255 container) */}
              <motion.div
                className="relative w-[509px] h-[255px]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                {/* Decorative arc container - 255x255, positioned at left */}
                <div className="absolute left-0 top-0 w-[255px] h-[255px] flex items-center justify-center">
                  {/* SVG arc with gradient fill and stroke */}
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
                  {/* Inner dark circle - 88x88, centered */}
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

                {/* Body text - 396×80, 60% opacity gradient white→gray, overlaps arc */}
                <p 
                  className="absolute text-[16px] leading-[16px] tracking-[-0.16px] w-[396px]"
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
                className="flex flex-col justify-center items-center"
                style={{
                  width: "341px",
                  padding: "47px 1px",
                  gap: "10px",
                  borderRadius: "39px",
                  border: "1px solid #00A2C8",
                  background: "rgba(8, 8, 8, 0.35)",
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                {/* 15K active subs - Myriad Pro 600 Italic 40px */}
                <h3 
                  className="font-semibold italic"
                  style={{
                    fontSize: "40px",
                    lineHeight: "100%",
                    background: "linear-gradient(103.87deg, #FFFFFF 0%, rgba(220, 3, 135, 0.4) 70.8%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  15K active subs
                </h3>
                
                {/* Subtitle - Lato 400 16px, 70% white */}
                <p 
                  style={{ 
                    width: "280px",
                    fontSize: "16px",
                    lineHeight: "100%",
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
