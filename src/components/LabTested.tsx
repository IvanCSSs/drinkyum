"use client";

import Image from "next/image";

export default function LabTested() {
  return (
    <section className="relative bg-[#070707] flex justify-center px-4 overflow-visible z-10 py-8 lg:py-0" style={{ minHeight: "400px" }}>
      <div className="w-full max-w-[1184px] relative overflow-visible">
        {/* Main Card - simplified for mobile */}
        <div 
          className="relative w-full lg:w-[1168px] rounded-[20px] lg:rounded-none"
          style={{
            background: "rgba(15, 15, 15, 0.63)",
            border: "1px solid rgba(217, 217, 217, 0.3)",
            minHeight: "280px",
          }}
        >
          {/* Content inside card */}
          <div className="relative z-10 flex flex-col lg:flex-row h-full p-6 lg:p-0">
            {/* Left Content */}
            <div
              className="flex flex-col justify-center lg:justify-end lg:w-[394px] gap-4 lg:gap-[26px] lg:p-[0_0_37px_60px]"
            >
              {/* Title section */}
              <div className="flex flex-col gap-2 lg:gap-[8px]">
                <h2 
                  className="text-[28px] sm:text-[36px] lg:text-[42px] font-bold italic leading-[1.1]"
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
                  className="text-[13px] leading-[1.3]"
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
                className="flex items-center justify-center text-[14px] lg:text-[15px] text-white font-normal hover:brightness-110 transition-all w-full sm:w-[200px] lg:w-[221px] h-[40px] lg:h-[35px] rounded-[10px]"
                style={{
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

            {/* Right Content - Description - hidden on small mobile */}
            <div
              className="hidden sm:flex items-start mt-6 lg:mt-0 lg:ml-auto lg:p-[48px_60px_0_0] lg:w-[349px]"
            >
              <p 
                className="text-[13px] lg:text-[14px] leading-[1.4] font-light"
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

        {/* Lab Tested Image - responsive sizing */}
        <div
          className="absolute left-1/2 -translate-x-1/2 overflow-visible hidden lg:block"
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

        {/* Mobile Lab Tested Image */}
        <div className="flex lg:hidden justify-center mt-6">
          <div className="relative w-[200px] h-[200px]">
            <Image
              src="/images/lab-tested.png"
              alt="Lab Tested Certified"
              fill
              className="object-contain"
              style={{ filter: "drop-shadow(0 10px 30px rgba(225, 37, 144, 0.40))" }}
              sizes="200px"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
