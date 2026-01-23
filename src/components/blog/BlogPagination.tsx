"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface BlogPaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
}

export default function BlogPagination({
  currentPage,
  totalPages,
  basePath,
}: BlogPaginationProps) {
  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const showEllipsis = totalPages > 7;

    if (!showEllipsis) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push("ellipsis");
      }

      // Show pages around current
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("ellipsis");
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  const buildPageUrl = (page: number) => {
    if (page === 1) return basePath;
    return `${basePath}?page=${page}`;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav className="flex items-center justify-center gap-2" aria-label="Pagination">
      {/* Previous Button */}
      {currentPage > 1 ? (
        <Link
          href={buildPageUrl(currentPage - 1)}
          className="flex items-center justify-center w-10 h-10 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
      ) : (
        <span className="flex items-center justify-center w-10 h-10 rounded-xl text-white/20 cursor-not-allowed">
          <ChevronLeft className="w-5 h-5" />
        </span>
      )}

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {pageNumbers.map((page, index) =>
          page === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
              className="w-10 h-10 flex items-center justify-center text-white/40"
            >
              ...
            </span>
          ) : (
            <Link
              key={page}
              href={buildPageUrl(page)}
              className={`flex items-center justify-center w-10 h-10 rounded-xl font-medium transition-all ${
                page === currentPage
                  ? "bg-yum-pink text-white"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              }`}
              aria-current={page === currentPage ? "page" : undefined}
            >
              {page}
            </Link>
          )
        )}
      </div>

      {/* Next Button */}
      {currentPage < totalPages ? (
        <Link
          href={buildPageUrl(currentPage + 1)}
          className="flex items-center justify-center w-10 h-10 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all"
          aria-label="Next page"
        >
          <ChevronRight className="w-5 h-5" />
        </Link>
      ) : (
        <span className="flex items-center justify-center w-10 h-10 rounded-xl text-white/20 cursor-not-allowed">
          <ChevronRight className="w-5 h-5" />
        </span>
      )}
    </nav>
  );
}
