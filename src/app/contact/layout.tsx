import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | DrinkYUM",
  description: "Get in touch with DrinkYUM. We're here to help with questions about our premium kratom extract beverages, orders, and more.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact DrinkYUM",
    description: "Get in touch with us. We're here to help with questions about our premium kratom beverages.",
    type: "website",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
