import { Suspense } from "react";
import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileLogo from "@/components/MobileLogo";
import { BlogPostList, BlogSidebar } from "@/components/blog";
import { getBlogPosts, getBlogCategories, getBlogTags } from "@/lib/wordpress-posts";

interface TagPageProps {
  params: Promise<{
    tag: string;
  }>;
  searchParams: Promise<{
    page?: string;
  }>;
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { tag } = await params;
  const tagName = decodeURIComponent(tag).replace(/-/g, " ");

  return {
    title: `#${tagName} | YUM Blog`,
    description: `Browse all posts tagged with #${tagName} on the YUM blog.`,
    alternates: {
      canonical: `/blog/tag/${tag}`,
    },
  };
}

export default async function TagPage({ params, searchParams }: TagPageProps) {
  const { tag } = await params;
  const resolvedSearchParams = await searchParams;
  const page = Math.max(1, parseInt(resolvedSearchParams.page || "1", 10));
  const tagSlug = decodeURIComponent(tag);

  // Fetch data in parallel
  const [postsResponse, categories, tags] = await Promise.all([
    getBlogPosts({ page, per_page: 9, tag: tagSlug }),
    getBlogCategories(),
    getBlogTags(),
  ]);

  // Find the tag name
  const tagData = tags.find((t) => t.slug.toLowerCase() === tagSlug.toLowerCase());
  const tagName = tagData?.name || tagSlug.replace(/-/g, " ");

  return (
    <main className="min-h-screen bg-yum-dark">
      <Navbar />
      <MobileLogo />

      <section className="relative pt-32 lg:pt-44 pb-16 lg:pb-24 px-4">
        <div className="max-w-[1200px] mx-auto">
          {/* Back Link */}
          <div className="mb-8">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Blog</span>
            </Link>
          </div>

          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yum-cyan/20 text-yum-cyan text-sm font-medium mb-4">
              Tag
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
              #{tagName}
            </h1>
            <p className="text-white/60 text-lg">
              {postsResponse.pagination.total} post{postsResponse.pagination.total !== 1 ? "s" : ""} with this tag
            </p>
          </div>

          {/* Content */}
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Main Content */}
            <div className="flex-1">
              <BlogPostList
                posts={postsResponse.posts}
                currentPage={page}
                totalPages={postsResponse.pagination.total_pages}
                basePath={`/blog/tag/${tagSlug}`}
              />
            </div>

            {/* Sidebar */}
            <div className="hidden lg:block w-[300px] flex-shrink-0">
              <div className="sticky top-32">
                <BlogSidebar
                  categories={categories}
                  tags={tags}
                  currentTag={tagSlug}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
