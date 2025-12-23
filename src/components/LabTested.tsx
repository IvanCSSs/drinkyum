"use client";

import Image from "next/image";

export default function LabTested() {
  return (
    <section className="relative bg-[#070707] flex justify-center px-4 overflow-visible z-10" style={{ height: "481px" }}>
      <div 
        className="w-full max-w-[1184px] relative overflow-visible"
        style={{ minHeight: "481px" }}
      >
        {/* Main Card - rectangle with gradient border */}
        <div 
          className="relative"
          style={{
            width: "1168px",
            height: "311px",
            borderRadius: "25px",
            background: "rgba(15, 15, 15, 0.63)",
            position: "relative",
          }}
        >
          {/* Gradient border - gray gradient from bottom (solid) to top (15% opacity) */}
          <div
            className="absolute inset-0 rounded-[25px] pointer-events-none"
            style={{
              padding: "1px",
              background: "linear-gradient(to bottom, rgba(217,217,217,1) 0%, rgba(217,217,217,0.15) 100%)",
              mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              maskComposite: "exclude",
              WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "xor",
            }}
          />
          {/* Content inside card */}
          <div className="relative z-10 flex h-full">
            {/* Left Content */}
            <div
              className="flex flex-col justify-end"
              style={{ 
                padding: "0 0 37px 60px",
                width: "394px",
                gap: "26px",
              }}
            >
              {/* Title section */}
              <div className="flex flex-col" style={{ gap: "8px" }}>
                <h2 
                  className="text-[42px] font-bold italic leading-[42px]"
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
                  className="text-[13px] leading-[13px]"
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
              <a
                href="#"
                className="flex items-center justify-center text-[15px] text-white font-normal hover:brightness-110 transition-all"
                style={{
                  width: "221px",
                  height: "35px",
                  borderRadius: "10px",
                  border: "1px solid #FFF",
                  background: `radial-gradient(30.86% 27.56% at 77.68% 0%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.00) 100%), 
                               radial-gradient(54.33% 42.36% at 29.91% 100%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.00) 100%), 
                               rgba(220, 3, 135, 0.40)`,
                  boxShadow: "inset 0 0 4px 0 #FFF",
                }}
              >
                VIEW LAB REPORTS
              </a>
            </div>

            {/* Right Content - Description */}
            <div
              className="flex items-start"
              style={{
                padding: "48px 60px 0 0",
                marginLeft: "auto",
                width: "349px",
              }}
            >
              <p 
                className="text-[14px] leading-[14px] font-light"
                style={{
                  fontFamily: "Lato, sans-serif",
                  fontWeight: 300,
                  background: "linear-gradient(180deg, rgba(255, 255, 255, 0.60) 0%, rgba(153, 153, 153, 0.60) 100%)",
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
            </div>
          </div>
        </div>

        {/* Lab Tested Image - centered horizontally, overlapping below */}
        <div
          className="absolute left-1/2 -translate-x-1/2 overflow-visible"
          style={{
            bottom: "20px",
            width: "402px",
            height: "395px",
            zIndex: 20,
          }}
        >
          <Image
            src="/images/lab-tested.png"
            alt="Lab Tested Certified"
            fill
            className="object-contain"
            style={{ filter: "drop-shadow(0 15px 50px rgba(225, 37, 144, 0.40))" }}
            sizes="402px"
          />
        </div>
      </div>
    </section>
  );
}
