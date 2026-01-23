import { Suspense } from "react";
import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileLogo from "@/components/MobileLogo";
import { BlogPostList, BlogSidebar } from "@/components/blog";
import { getBlogPosts, getBlogCategories, getBlogTags } from "@/lib/wordpress-posts";

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
  searchParams: Promise<{
    page?: string;
  }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const categoryName = decodeURIComponent(category).replace(/-/g, " ");
  const formattedName = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);

  return {
    title: `${formattedName} | YUM Blog`,
    description: `Browse all posts in the ${formattedName} category on the YUM blog.`,
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { category } = await params;
  const resolvedSearchParams = await searchParams;
  const page = Math.max(1, parseInt(resolvedSearchParams.page || "1", 10));
  const categorySlug = decodeURIComponent(category);

  // Fetch data in parallel
  const [postsResponse, categories, tags] = await Promise.all([
    getBlogPosts({ page, per_page: 9, category: categorySlug }),
    getBlogCategories(),
    getBlogTags(),
  ]);

  // Find the category name
  const categoryData = categories.find(
    (c) => c.slug.toLowerCase() === categorySlug.toLowerCase()
  );
  const categoryName = categoryData?.name || categorySlug.replace(/-/g, " ");
  const formattedName = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);

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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yum-pink/20 text-yum-pink text-sm font-medium mb-4">
              Category
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
              {formattedName}
            </h1>
            <p className="text-white/60 text-lg">
              {postsResponse.pagination.total} post{postsResponse.pagination.total !== 1 ? "s" : ""} in this category
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
                basePath={`/blog/category/${categorySlug}`}
              />
            </div>

            {/* Sidebar */}
            <div className="hidden lg:block w-[300px] flex-shrink-0">
              <div className="sticky top-32">
                <BlogSidebar
                  categories={categories}
                  tags={tags}
                  currentCategory={categorySlug}
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
