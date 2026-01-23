"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, Clock, User, ArrowLeft, Tag } from "lucide-react";
import { BlogPost, formatPostDate, calculateReadingTime } from "@/lib/wordpress-posts";

interface BlogPostContentProps {
  post: BlogPost;
}

export default function BlogPostContent({ post }: BlogPostContentProps) {
  const readingTime = post.content ? calculateReadingTime(post.content) : 3;

  return (
    <article className="max-w-[800px] mx-auto">
      {/* Back Link */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Blog</span>
        </Link>
      </motion.div>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        {/* Categories */}
        {post.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.categories.map((category) => (
              <Link
                key={category}
                href={`/blog/category/${encodeURIComponent(category.toLowerCase())}`}
                className="text-xs font-medium px-3 py-1.5 rounded-full bg-yum-pink/20 text-yum-pink hover:bg-yum-pink/30 transition-colors"
              >
                {category}
              </Link>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
          {post.title}
        </h1>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 lg:gap-6 text-sm text-white/50">
          {post.author && (
            <div className="flex items-center gap-2">
              {post.author.avatar ? (
                <Image
                  src={post.author.avatar}
                  alt={post.author.name}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-yum-pink/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-yum-pink" />
                </div>
              )}
              <span className="text-white/70">{post.author.name}</span>
            </div>
          )}
          {post.published_at && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{formatPostDate(post.published_at)}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{readingTime} min read</span>
          </div>
        </div>
      </motion.header>

      {/* Featured Image */}
      {post.featured_image && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-10"
        >
          <Image
            src={post.featured_image}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
        </motion.div>
      )}

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="prose prose-invert prose-lg max-w-none
          prose-headings:text-white prose-headings:font-bold
          prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
          prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
          prose-p:text-white/70 prose-p:leading-relaxed
          prose-a:text-yum-pink prose-a:no-underline hover:prose-a:underline
          prose-strong:text-white
          prose-ul:text-white/70 prose-ol:text-white/70
          prose-li:marker:text-yum-pink
          prose-blockquote:border-l-yum-pink prose-blockquote:text-white/60
          prose-code:text-yum-cyan prose-code:bg-white/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
          prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10
          prose-img:rounded-xl"
        dangerouslySetInnerHTML={{ __html: post.content || "" }}
      />

      {/* Tags */}
      {post.tags.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 pt-8 border-t border-white/10"
        >
          <div className="flex items-center gap-2 mb-4">
            <Tag className="w-4 h-4 text-white/50" />
            <span className="text-white/50 text-sm font-medium">Tags</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                href={`/blog/tag/${encodeURIComponent(tag.toLowerCase())}`}
                className="text-sm px-3 py-1.5 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </article>
  );
}
