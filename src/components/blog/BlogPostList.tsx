"use client";

import { BlogPost } from "@/lib/wordpress-posts";
import BlogPostCard from "./BlogPostCard";
import BlogPagination from "./BlogPagination";

interface BlogPostListProps {
  posts: BlogPost[];
  currentPage: number;
  totalPages: number;
  basePath?: string;
}

export default function BlogPostList({
  posts,
  currentPage,
  totalPages,
  basePath = "/blog",
}: BlogPostListProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-white/60 text-lg">No posts found.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {posts.map((post, index) => (
          <BlogPostCard key={post.id} post={post} index={index} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-12">
          <BlogPagination
            currentPage={currentPage}
            totalPages={totalPages}
            basePath={basePath}
          />
        </div>
      )}
    </div>
  );
}
