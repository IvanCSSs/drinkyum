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
import { isBot } from "@/lib/is-bot";
import Script from "next/script";

const lato = Lato({
  subsets: ["latin"],
  weight: ["100", "300", "400", "700", "900"],
  variable: "--font-lato",
});

// Cloak (.co) gets a sanitized SEO/metadata payload — no flagged
// keywords in title, description, OG tags, twitter card, or anywhere
// crawlers read. The moneypage (.com) keeps its real keyword-heavy SEO.
const IS_CLOAK_META = process.env.NEXT_PUBLIC_CLOAK === "true";

const moneypageMetadata: Metadata = {
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

const cloakMetadata: Metadata = {
  metadataBase: new URL("https://drinkyum.co"),
  title: {
    default: "YUM | Botanical Extract Shot",
    template: "%s | YUM",
  },
  description: "A botanical extract shot powered by ancient plants. First bottle on us — you just cover shipping.",
  keywords: ["wellness", "botanical", "natural", "plant-based"],
  authors: [{ name: "YUM" }],
  creator: "YUM",
  publisher: "YUM",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://drinkyum.co",
    siteName: "YUM",
    title: "YUM | Botanical Extract Shot",
    description: "A botanical extract shot powered by ancient plants. First bottle on us — you just cover shipping.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "YUM",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "YUM | Botanical Extract Shot",
    description: "A botanical extract shot powered by ancient plants. First bottle on us.",
    images: ["/og-image.png"],
  },
  robots: {
    // Don't let search engines index the cloak — it's only for paid traffic.
    index: false,
    follow: false,
  },
};

export const metadata: Metadata = IS_CLOAK_META
  ? cloakMetadata
  : moneypageMetadata;

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Skip age verification for search engine bots (SEO fix).
  // Also skip on the .co cloak — /need-to-know already gates 21+ before
  // any cart hands off to .com, so the cloak shouldn't show the modal.
  const isCloak = process.env.NEXT_PUBLIC_CLOAK === "true";
  const skipAgeGate = isCloak || (await isBot());
  
  return (
    <html lang="en" className={lato.variable}>
      <head>
        {/* JSON-LD structured data — moneypage SEO only. The cloak
            shouldn't be indexed and its JSON-LD would leak flagged
            keywords to anything crawling the page. */}
        {!isCloak && (
          <>
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
            />
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
            />
          </>
        )}
      </head>
      <body className="antialiased">
        <ConsoleFilter />
        <GoogleAds />
        <MetaPixel />
        {/* Klaviyo popups are .com-only — the cloak shouldn't push the
            free-sample popup over its own landing page. */}
        {!isCloak && <Klaviyo />}
        <Script
          src="https://api.goaffpro.com/loader.js?shop=yaSrxzhUuxMx"
          strategy="afterInteractive"
        />
        <Providers>
          <TrackingProvider>
            {!skipAgeGate && <AgeVerification />}
            {children}
          </TrackingProvider>
        </Providers>
      </body>
    </html>
  );
}
