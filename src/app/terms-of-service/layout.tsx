import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | DrinkYUM",
  description: "DrinkYUM terms of service. Read our terms and conditions for using our website and purchasing our products.",
  alternates: {
    canonical: "/terms-of-service",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsOfServiceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
