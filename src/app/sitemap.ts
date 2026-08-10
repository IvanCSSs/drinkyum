import { MetadataRoute } from "next";
import { getBlogPosts } from "@/lib/wordpress-posts";

const IS_CLOAK = process.env.NEXT_PUBLIC_CLOAK === "true";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // The cloak (.co) is self-contained: its own base URL and its own small set of
  // indexable pages — it does NOT list the .com store/blog. This lets the cloak's
  // PMax URL-expansion discover /what-is-kratom from the cloak's own sitemap.
  if (IS_CLOAK) {
    const baseUrl = "https://drinkyum.co";
    const cloakPages: { path: string; priority: number }[] = [
      { path: "/what-is-kratom", priority: 1 },
    ];
    return cloakPages.map(({ path, priority }) => ({
      url: `${baseUrl}${path}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority,
    }));
  }

  // Money site (.com) — full sitemap.
  const baseUrl = "https://www.drinkyum.com";

  const staticPages = [
    "",
    "/collections",
    "/about",
    "/contact",
    "/faq",
    "/lab-results",
    "/blog",
    "/privacy-policy",
    "/terms-of-service",
    "/shipping-returns",
  ];

  const staticEntries = staticPages.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? ("daily" as const) : ("weekly" as const),
    priority: path === "" ? 1 : path === "/collections" ? 0.9 : 0.7,
  }));

  let blogEntries: MetadataRoute.Sitemap = [];
  try {
    const { posts } = await getBlogPosts({ per_page: 100 });
    blogEntries = posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updated_at ? new Date(post.updated_at) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
  } catch (error) {
    console.error("Error fetching blog posts for sitemap:", error);
  }

  return [...staticEntries, ...blogEntries];
}
