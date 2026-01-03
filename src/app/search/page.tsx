"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search as SearchIcon, X, Package, ShoppingCart } from "lucide-react";
import { getProducts, formatPrice, Product } from "@/lib/products";
import { useCart } from "@/contexts/CartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileLogo from "@/components/MobileLogo";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addToCart, isLoading: cartLoading } = useCart();

  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setProducts([]);
      setHasSearched(false);
      setTotalCount(0);
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      const { products: results, count } = await getProducts({
        q: searchQuery.trim(),
        limit: 24,
      });
      setProducts(results);
      setTotalCount(count);
    } catch (error) {
      console.error("Search failed:", error);
      setProducts([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Search on initial load if query param exists
  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery, performSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Update URL with search query
    router.push(`/search?q=${encodeURIComponent(query)}`);
    performSearch(query);
  };

  const clearSearch = () => {
    setQuery("");
    setProducts([]);
    setHasSearched(false);
    setTotalCount(0);
    router.push("/search");
  };

  const getProductPrice = (product: Product) => {
    const variant = product.variants[0];
    if (!variant) return null;
    const price = variant.prices.find((p) => p.currency_code === "usd");
    return price ? formatPrice(price.amount) : null;
  };

  const handleAddToCart = async (product: Product) => {
    const variant = product.variants[0];
    if (!variant) return;
    await addToCart(variant.id, 1);
  };

  return (
    <>
      {/* Search Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto mb-10"
      >
        <form onSubmit={handleSearch} className="relative">
          <SearchIcon
            size={22}
            className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            autoFocus
            className="w-full pl-14 pr-12 py-4 rounded-2xl bg-white/5 border border-white/10 text-white text-lg placeholder:text-white/30 focus:outline-none focus:border-yum-pink transition-colors"
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </form>
      </motion.div>

      {/* Results Count */}
      {hasSearched && !isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6"
        >
          <p className="text-white/60">
            {totalCount > 0
              ? `Found ${totalCount} result${totalCount !== 1 ? "s" : ""} for "${initialQuery || query}"`
              : `No results found for "${initialQuery || query}"`}
          </p>
        </motion.div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-white/5 rounded-2xl mb-3" />
              <div className="h-4 bg-white/10 rounded w-3/4 mb-2" />
              <div className="h-4 bg-white/10 rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Results Grid */}
      {!isLoading && products.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          {products.map((product, idx) => {
            const price = getProductPrice(product);
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group"
              >
                <Link href={`/product/${product.handle}`}>
                  <div
                    className="aspect-square rounded-2xl overflow-hidden mb-3 relative"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    {product.thumbnail ? (
                      <img
                        src={product.thumbnail}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={48} className="text-white/20" />
                      </div>
                    )}
                  </div>
                </Link>

                <div className="space-y-2">
                  <Link href={`/product/${product.handle}`}>
                    <h3 className="font-medium text-white line-clamp-2 hover:text-yum-pink transition-colors">
                      {product.title}
                    </h3>
                  </Link>

                  <div className="flex items-center justify-between gap-2">
                    {price && (
                      <p className="font-semibold text-yum-pink">{price}</p>
                    )}
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={cartLoading}
                      className="p-2 rounded-lg bg-white/5 text-white/60 hover:bg-yum-pink/20 hover:text-yum-pink transition-colors disabled:opacity-50"
                    >
                      <ShoppingCart size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* No Results */}
      {!isLoading && hasSearched && products.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <SearchIcon size={48} className="text-white/20 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            No Products Found
          </h3>
          <p className="text-white/50 mb-6 max-w-sm mx-auto">
            Try adjusting your search terms or browse our collections.
          </p>
          <Link
            href="/collections/all"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium text-white"
            style={{
              background: "linear-gradient(135deg, #E1258F 0%, #C01F7A 100%)",
            }}
          >
            Browse All Products
          </Link>
        </motion.div>
      )}

      {/* Initial State */}
      {!isLoading && !hasSearched && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <SearchIcon size={48} className="text-white/20 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            Search Our Products
          </h3>
          <p className="text-white/50 max-w-sm mx-auto">
            Enter a search term above to find your favorite YUM products.
          </p>
        </motion.div>
      )}
    </>
  );
}

export default function SearchPage() {
  return (
    <main className="min-h-screen bg-yum-dark">
      <Navbar />
      <MobileLogo />

      <section className="relative pt-32 lg:pt-44 pb-16 lg:pb-24 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              Search
            </h1>
          </motion.div>

          <Suspense
            fallback={
              <div className="max-w-2xl mx-auto mb-10">
                <div className="h-14 bg-white/5 rounded-2xl animate-pulse" />
              </div>
            }
          >
            <SearchContent />
          </Suspense>
        </div>
      </section>

      <Footer />
    </main>
  );
}
