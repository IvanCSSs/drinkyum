import { MetadataRoute } from "next";

const IS_CLOAK = process.env.NEXT_PUBLIC_CLOAK === "true";

export default function robots(): MetadataRoute.Robots {
  // The cloak (.co) points at its OWN sitemap (self-contained) so crawlers /
  // PMax expansion discover the cloak's own indexable pages (e.g. /what-is-kratom),
  // not the .com money site.
  const sitemap = IS_CLOAK
    ? "https://drinkyum.co/sitemap.xml"
    : "https://www.drinkyum.com/sitemap.xml";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/checkout", "/cart", "/order-confirmation/"],
      },
    ],
    sitemap,
  };
}
