import CloakHomeClient from "@/components/CloakHomeClient";

// /free-sample now renders the SAME UI as the drinkyum.co cloak homepage
// (CloakHomeClient), so the two are visually identical and stay in sync.
export const revalidate = 3600;

// Same free-sample SKU(s) the cloak homepage uses (pinned, no WP roundtrip).
const SAMPLE_OPTIONS = [
  {
    id: "bg" as const,
    variantId: "1674",
    productHandle: "yum-bubble-gum-14ml-free-sample",
    couponCode: "FREESAMPLEBG14",
    flavor: "Bubble Gum",
    image: "/images/sample-bg-14ml.jpg",
    tasteNote: "Smooth · Signature",
    accent: "#E1258F",
    description:
      "Smooth, slightly sweet, and easy to drink. The one most customers come back for.",
  },
];

export default function FreeSamplePage() {
  return <CloakHomeClient sampleOptions={SAMPLE_OPTIONS} />;
}
