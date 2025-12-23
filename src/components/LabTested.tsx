"use client";

import Image from "next/image";

export default function LabTested() {
  const r = 12; // corner radius
  const ar = 2; // angle corner radius
  const cardWidth = 1168;
  const cardHeight = 311;
  
  // Bottom-right notch:
  const brNotchLeftX = 819; // where horizontal meets diagonal
  const brNotchTopY = 211; // height of horizontal line
  const brDiagonalX = 592; // where diagonal meets bottom edge

  // Top-left notch (mirrored):
  // Horizontal line should be 83% of 45px = 37px above title top
  const tlDiagonalX = 654; // where diagonal meets top edge (end point)
  const tlNotchRightX = 554; // where diagonal meets horizontal line (start point)
  const tlNotchBottomY = 20; // moved up to be above title

  // SVG path with rounded corners
  const shapePath = `
    M ${tlDiagonalX + r} 0
    L ${cardWidth - r} 0
    Q ${cardWidth} 0 ${cardWidth} ${r}
    L ${cardWidth} ${brNotchTopY - r}
    Q ${cardWidth} ${brNotchTopY} ${cardWidth - r} ${brNotchTopY}
    L ${brNotchLeftX + ar} ${brNotchTopY}
    Q ${brNotchLeftX} ${brNotchTopY} ${brNotchLeftX - 1} ${brNotchTopY + 1}
    L ${brDiagonalX + 1} ${cardHeight - 1}
    Q ${brDiagonalX} ${cardHeight} ${brDiagonalX - r} ${cardHeight}
    L ${r} ${cardHeight}
    Q 0 ${cardHeight} 0 ${cardHeight - r}
    L 0 ${tlNotchBottomY + r}
    Q 0 ${tlNotchBottomY} ${r} ${tlNotchBottomY}
    L ${tlNotchRightX - ar} ${tlNotchBottomY}
    Q ${tlNotchRightX} ${tlNotchBottomY} ${tlNotchRightX + 1} ${tlNotchBottomY - 1}
    L ${tlDiagonalX - 1} 1
    Q ${tlDiagonalX} 0 ${tlDiagonalX + r} 0
    Z
  `;

  const clipPathUrl = `path('${shapePath.replace(/\s+/g, ' ').trim()}')`;

  return (
    <section className="relative bg-[#070707] flex justify-center px-4 overflow-visible z-10" style={{ height: "481px" }}>
      <div 
        className="w-full max-w-[1184px] relative overflow-visible"
        style={{ minHeight: "481px" }}
      >
        {/* Main Card with angled corners */}
        <div 
          className="relative"
          style={{
            width: "1168px",
            height: "311px",
          }}
        >
          {/* Background with clip-path */}
          <div
            className="absolute inset-0"
            style={{
              background: "rgba(15, 15, 15, 0.63)",
              clipPath: clipPathUrl,
            }}
          />
          
          {/* SVG border */}
          <svg 
            className="absolute inset-0 pointer-events-none" 
            width="1168" 
            height="311"
            viewBox="0 0 1168 311"
            fill="none"
          >
            <defs>
              <linearGradient id="borderGradientLab" x1="0" y1="0" x2="0" y2="311" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="rgba(217,217,217,1)" />
                <stop offset="100%" stopColor="rgba(217,217,217,0.15)" />
              </linearGradient>
            </defs>
            <path 
              d={shapePath}
              fill="none"
              stroke="url(#borderGradientLab)"
              strokeWidth="1"
            />
          </svg>

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
