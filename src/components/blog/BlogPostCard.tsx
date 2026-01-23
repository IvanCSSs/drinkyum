"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, Clock, User } from "lucide-react";
import { BlogPost, formatPostDate, calculateReadingTime } from "@/lib/wordpress-posts";

interface BlogPostCardProps {
  post: BlogPost;
  index?: number;
}

export default function BlogPostCard({ post, index = 0 }: BlogPostCardProps) {
  const readingTime = post.content ? calculateReadingTime(post.content) : 3;

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group"
    >
      <Link href={`/blog/${post.slug}`}>
        <div
          className="rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02]"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {/* Featured Image */}
          <div className="relative aspect-[16/10] overflow-hidden">
            {post.featured_image ? (
              <Image
                src={post.featured_image}
                alt={post.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-yum-pink/20 to-yum-cyan/20 flex items-center justify-center">
                <span className="text-white/30 text-4xl font-bold">YUM</span>
              </div>
            )}
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>

          {/* Content */}
          <div className="p-5 lg:p-6">
            {/* Categories */}
            {post.categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {post.categories.slice(0, 2).map((category) => (
                  <span
                    key={category}
                    className="text-xs font-medium px-2.5 py-1 rounded-full bg-yum-pink/20 text-yum-pink"
                  >
                    {category}
                  </span>
                ))}
              </div>
            )}

            {/* Title */}
            <h3 className="text-lg lg:text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-yum-pink transition-colors">
              {post.title}
            </h3>

            {/* Excerpt */}
            <p className="text-white/60 text-sm line-clamp-2 mb-4">
              {post.excerpt}
            </p>

            {/* Meta */}
            <div className="flex items-center gap-4 text-xs text-white/40">
              {post.author && (
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>{post.author.name}</span>
                </div>
              )}
              {post.published_at && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formatPostDate(post.published_at)}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>{readingTime} min read</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
