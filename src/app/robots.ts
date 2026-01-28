import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/checkout", "/cart", "/order-confirmation/"],
      },
    ],
    sitemap: "https://www.drinkyum.com/sitemap.xml",
  };
}
