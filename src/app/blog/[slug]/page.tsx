import { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileLogo from "@/components/MobileLogo";
import { BlogPostContent } from "@/components/blog";
import BlogPostCard from "@/components/blog/BlogPostCard";
import { getBlogPost } from "@/lib/wordpress-posts";

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getBlogPost(slug);

  if (!data) {
    return {
      title: "Post Not Found | YUM",
    };
  }

  return {
    title: `${data.post.title} | YUM Blog`,
    description: data.post.excerpt || `Read ${data.post.title} on the YUM blog.`,
    openGraph: {
      title: data.post.title,
      description: data.post.excerpt,
      type: "article",
      publishedTime: data.post.published_at || undefined,
      authors: data.post.author ? [data.post.author.name] : undefined,
      images: data.post.featured_image ? [data.post.featured_image] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const data = await getBlogPost(slug);

  if (!data) {
    notFound();
  }

  const { post, related } = data;

  return (
    <main className="min-h-screen bg-yum-dark">
      <Navbar />
      <MobileLogo />

      <section className="relative pt-32 lg:pt-44 pb-16 lg:pb-24 px-4">
        <div className="max-w-[1200px] mx-auto">
          {/* Post Content */}
          <BlogPostContent post={post} />

          {/* Related Posts */}
          {related.length > 0 && (
            <div className="mt-16 pt-12 border-t border-white/10">
              <h2 className="text-2xl font-bold text-white mb-8 text-center">
                Related Posts
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[900px] mx-auto">
                {related.map((relatedPost, index) => (
                  <BlogPostCard
                    key={relatedPost.id}
                    post={relatedPost}
                    index={index}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
