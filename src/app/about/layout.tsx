import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | DrinkYUM",
  description: "Learn about DrinkYUM - our mission to create premium kratom extract beverages with the highest quality standards. Lab-tested, customer-first approach.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About DrinkYUM",
    description: "Our mission to create premium kratom extract beverages with the highest quality standards.",
    type: "website",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
