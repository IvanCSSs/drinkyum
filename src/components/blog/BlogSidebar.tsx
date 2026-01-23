"use client";

import Link from "next/link";
import { Tag, FolderOpen } from "lucide-react";
import { BlogTag, BlogCategory, BlogPost } from "@/lib/wordpress-posts";

interface BlogSidebarProps {
  categories?: BlogCategory[];
  tags?: BlogTag[];
  recentPosts?: BlogPost[];
  currentCategory?: string;
  currentTag?: string;
}

export default function BlogSidebar({
  categories = [],
  tags = [],
  recentPosts = [],
  currentCategory,
  currentTag,
}: BlogSidebarProps) {
  return (
    <aside className="space-y-8">
      {/* Categories */}
      {categories.length > 0 && (
        <div
          className="p-5 lg:p-6 rounded-2xl"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <FolderOpen className="w-5 h-5 text-yum-pink" />
            <h3 className="text-lg font-bold text-white">Categories</h3>
          </div>
          <ul className="space-y-2">
            {categories.map((category) => {
              const isActive =
                currentCategory?.toLowerCase() === category.slug.toLowerCase();
              return (
                <li key={category.id}>
                  <Link
                    href={`/blog/category/${category.slug}`}
                    className={`flex items-center justify-between py-2 px-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-yum-pink/20 text-yum-pink"
                        : "text-white/60 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <span>{category.name}</span>
                    <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full">
                      {category.count}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div
          className="p-5 lg:p-6 rounded-2xl"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Tag className="w-5 h-5 text-yum-cyan" />
            <h3 className="text-lg font-bold text-white">Tags</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => {
              const isActive =
                currentTag?.toLowerCase() === tag.slug.toLowerCase();
              return (
                <Link
                  key={tag.id}
                  href={`/blog/tag/${tag.slug}`}
                  className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
                    isActive
                      ? "bg-yum-cyan/20 text-yum-cyan"
                      : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  #{tag.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Posts */}
      {recentPosts.length > 0 && (
        <div
          className="p-5 lg:p-6 rounded-2xl"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <h3 className="text-lg font-bold text-white mb-4">Recent Posts</h3>
          <ul className="space-y-4">
            {recentPosts.slice(0, 5).map((post) => (
              <li key={post.id}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="block group"
                >
                  <h4 className="text-sm text-white/80 font-medium line-clamp-2 group-hover:text-yum-pink transition-colors">
                    {post.title}
                  </h4>
                  {post.published_at && (
                    <span className="text-xs text-white/40 mt-1 block">
                      {new Date(post.published_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}
