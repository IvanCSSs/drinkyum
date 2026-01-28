import { MetadataRoute } from "next";
import { getBlogPosts } from "@/lib/wordpress-posts";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.drinkyum.com";

  // Static pages
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
    changeFrequency: path === "" ? "daily" as const : "weekly" as const,
    priority: path === "" ? 1 : path === "/collections" ? 0.9 : 0.7,
  }));

  // Blog posts
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
