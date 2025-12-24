import type { Metadata } from "next";
import { Lato } from "next/font/google";
import "./globals.css";
import AgeVerification from "@/components/AgeVerification";

const lato = Lato({
  subsets: ["latin"],
  weight: ["100", "300", "400", "700", "900"],
  variable: "--font-lato",
});

export const metadata: Metadata = {
  title: "DrinkYUM | Premium Kratom Extract Beverages",
  description: "Experience the perfect blend of taste and wellness. YUM kratom extract mocktails - Love it. Taste it. Feel it.",
  keywords: ["kratom", "mocktail", "beverage", "extract", "wellness", "energy"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={lato.variable}>
      <body className="antialiased">
        <AgeVerification />
        {children}
      </body>
    </html>
  );
}
