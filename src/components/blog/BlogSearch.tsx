"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

interface BlogSearchProps {
  placeholder?: string;
}

export default function BlogSearch({
  placeholder = "Search posts...",
}: BlogSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("search") || "");
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setQuery(value);

      // Clear existing timeout
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      // Debounced search - wait 300ms after user stops typing
      debounceRef.current = setTimeout(() => {
        const params = new URLSearchParams(searchParams.toString());

        if (value) {
          params.set("search", value);
          params.delete("page"); // Reset to page 1 on new search
        } else {
          params.delete("search");
        }

        router.push(`/blog?${params.toString()}`);
      }, 300);
    },
    [router, searchParams]
  );

  const handleClear = useCallback(() => {
    setQuery("");
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    params.delete("page");
    router.push(`/blog?${params.toString()}`);
  }, [router, searchParams]);

  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full h-12 pl-12 pr-12 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-yum-pink/50 focus:ring-1 focus:ring-yum-pink/50 transition-all"
      />
      {query && (
        <button
          onClick={handleClear}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
          aria-label="Clear search"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
