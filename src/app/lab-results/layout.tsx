import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lab Results | DrinkYUM",
  description: "View third-party lab testing results for DrinkYUM kratom products. Transparency and quality you can trust - every batch tested for purity and potency.",
  alternates: {
    canonical: "/lab-results",
  },
  openGraph: {
    title: "Lab Testing Results | DrinkYUM",
    description: "Third-party lab testing results for all DrinkYUM kratom products. Quality and purity verified.",
    type: "website",
  },
};

export default function LabResultsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
