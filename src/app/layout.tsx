import type { Metadata } from "next";
import { Lato } from "next/font/google";
import "./globals.css";
import AgeVerification from "@/components/AgeVerification";
import { ConsoleFilter } from "@/components/ConsoleFilter";
import { Providers } from "@/contexts/Providers";
import TrackingProvider from "@/components/TrackingProvider";
import GoogleAds from "@/components/GoogleAds";
import MetaPixel from "@/components/MetaPixel";
import Klaviyo from "@/components/Klaviyo";

const lato = Lato({
  subsets: ["latin"],
  weight: ["100", "300", "400", "700", "900"],
  variable: "--font-lato",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.drinkyum.com"),
  title: {
    default: "DrinkYUM | Premium Kratom Extract Beverages",
    template: "%s | DrinkYUM",
  },
  description: "Experience the perfect blend of taste and wellness with YUM kratom extract mocktails. Premium quality, lab-tested kratom beverages. Love it. Taste it. Feel it.",
  keywords: ["kratom", "mocktail", "beverage", "extract", "wellness", "energy", "kratom shots", "kratom drinks"],
  authors: [{ name: "DrinkYUM" }],
  creator: "DrinkYUM",
  publisher: "DrinkYUM",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.drinkyum.com",
    siteName: "DrinkYUM",
    title: "DrinkYUM | Premium Kratom Extract Beverages",
    description: "Experience the perfect blend of taste and wellness with YUM kratom extract mocktails. Premium quality, lab-tested kratom beverages.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "DrinkYUM - Premium Kratom Extract Beverages",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DrinkYUM | Premium Kratom Extract Beverages",
    description: "Experience the perfect blend of taste and wellness with YUM kratom extract mocktails.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

// Organization structured data
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "DrinkYUM",
  url: "https://www.drinkyum.com",
  logo: "https://www.drinkyum.com/logo.png",
  description: "Premium kratom extract beverages and mocktails. Lab-tested, high-quality kratom shots.",
  sameAs: ["https://www.instagram.com/drink.yum"],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    email: "support@drinkyum.com",
  },
};

// WebSite structured data with search
const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "DrinkYUM",
  url: "https://www.drinkyum.com",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://www.drinkyum.com/search?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={lato.variable}>
      <head>
        {/* Awin verification */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className="antialiased">
        <ConsoleFilter />
        <GoogleAds />
        <MetaPixel />
        <Klaviyo />
        <Providers>
          <TrackingProvider>
            <AgeVerification />
            {children}
          </TrackingProvider>
        </Providers>
      </body>
    </html>
  );
}
