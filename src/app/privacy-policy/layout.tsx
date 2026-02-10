import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | DrinkYUM",
  description: "DrinkYUM privacy policy. Learn how we collect, use, and protect your personal information.",
  alternates: {
    canonical: "/privacy-policy",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
