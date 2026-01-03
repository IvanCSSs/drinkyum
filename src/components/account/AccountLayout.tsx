"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileLogo from "@/components/MobileLogo";
import AccountSidebar from "./AccountSidebar";

interface AccountLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

export default function AccountLayout({
  children,
  title,
  description,
}: AccountLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/login?returnUrl=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, isLoading, router, pathname]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <main className="min-h-screen bg-yum-dark flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-yum-pink/30 border-t-yum-pink rounded-full animate-spin" />
      </main>
    );
  }

  // Don't render content if not authenticated (will redirect)
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-yum-dark flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-yum-pink/30 border-t-yum-pink rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-yum-dark">
      <Navbar />
      <MobileLogo />

      <section className="relative pt-32 lg:pt-44 pb-16 lg:pb-24 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">{title}</h1>
            {description && (
              <p className="text-white/60 mt-2">{description}</p>
            )}
          </div>

          {/* Layout with Sidebar */}
          <div className="flex flex-col lg:flex-row gap-8">
            <AccountSidebar />
            <div className="flex-1 min-w-0">{children}</div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
