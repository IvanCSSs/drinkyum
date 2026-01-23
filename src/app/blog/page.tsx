import { Suspense } from "react";
import { Metadata } from "next";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileLogo from "@/components/MobileLogo";
import { BlogPostList, BlogSidebar, BlogSearch } from "@/components/blog";
import { getBlogPosts, getBlogCategories, getBlogTags } from "@/lib/wordpress-posts";

export const metadata: Metadata = {
  title: "Blog | YUM",
  description: "Latest news, tips, and insights from YUM. Stay updated on kratom products, wellness tips, and company updates.",
};

interface BlogPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
  }>;
}

async function BlogContent({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const search = params.search || "";

  // Fetch data in parallel
  const [postsResponse, categories, tags] = await Promise.all([
    getBlogPosts({ page, per_page: 9, search }),
    getBlogCategories(),
    getBlogTags(),
  ]);

  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
      {/* Main Content */}
      <div className="flex-1">
        {/* Search - Mobile */}
        <div className="lg:hidden mb-8">
          <Suspense fallback={<div className="h-12 bg-white/5 rounded-xl animate-pulse" />}>
            <BlogSearch />
          </Suspense>
        </div>

        {/* Search Results Info */}
        {search && (
          <div className="mb-6">
            <p className="text-white/60">
              {postsResponse.pagination.total} result{postsResponse.pagination.total !== 1 ? "s" : ""} for{" "}
              <span className="text-white font-medium">&quot;{search}&quot;</span>
            </p>
          </div>
        )}

        <BlogPostList
          posts={postsResponse.posts}
          currentPage={page}
          totalPages={postsResponse.pagination.total_pages}
          basePath={search ? `/blog?search=${encodeURIComponent(search)}` : "/blog"}
        />
      </div>

      {/* Sidebar - Desktop */}
      <div className="hidden lg:block w-[300px] flex-shrink-0">
        <div className="sticky top-32">
          <div className="mb-6">
            <Suspense fallback={<div className="h-12 bg-white/5 rounded-xl animate-pulse" />}>
              <BlogSearch />
            </Suspense>
          </div>
          <BlogSidebar
            categories={categories}
            tags={tags}
            recentPosts={postsResponse.posts.slice(0, 5)}
          />
        </div>
      </div>
    </div>
  );
}

export default async function BlogPage(props: BlogPageProps) {
  return (
    <main className="min-h-screen bg-yum-dark">
      <Navbar />
      <MobileLogo />

      <section className="relative pt-32 lg:pt-44 pb-16 lg:pb-24 px-4">
        <div className="max-w-[1200px] mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
              Our Blog
            </h1>
            <p className="text-white/60 text-lg max-w-xl mx-auto">
              Stay updated with the latest news, tips, and insights from YUM.
            </p>
          </div>

          {/* Content */}
          <Suspense
            fallback={
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="rounded-2xl h-[400px] animate-pulse"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  />
                ))}
              </div>
            }
          >
            <BlogContent searchParams={props.searchParams} />
          </Suspense>
        </div>
      </section>

      <Footer />
    </main>
  );
}
