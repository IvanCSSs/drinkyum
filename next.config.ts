import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Security Headers
   */
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
  /**
   * CDN Rewrites for Tenant-Scoped Assets
   *
   * The backend returns relative URLs like `/cdn/products/abc123.jpg`.
   * These rewrites redirect to the actual S3 URL with tenant prefix.
   */
  async rewrites() {
    const s3Url = process.env.S3_FILE_URL || 'https://medusa-multistore-assets.s3.us-east-1.amazonaws.com';
    const tenantSlug = process.env.NEXT_PUBLIC_TENANT_SLUG || 'drinkyum';
    const wpSiteId = process.env.WP_SITE_ID || '3';
    const wpBaseUrl = process.env.NEXT_PUBLIC_WP_URL || 'https://wordpress-production-7c0a.up.railway.app/drinkyum';

    return [
      // Image optimization: /img → /_next/image (cleaner URLs)
      {
        source: '/img',
        destination: '/_next/image',
      },
      // WordPress REST API: /wp-json/* → Railway WordPress
      // This allows drinkyum.com/wp-json/wc/v3/products to work
      {
        source: '/wp-json/:path*',
        destination: `${wpBaseUrl}/wp-json/:path*`,
      },
      // WordPress Admin: /wp-admin/* → Railway WordPress
      {
        source: '/wp-admin/:path*',
        destination: `${wpBaseUrl}/wp-admin/:path*`,
      },
      // WordPress login
      {
        source: '/wp-login.php',
        destination: `${wpBaseUrl}/wp-login.php`,
      },
      // WooCommerce OAuth (for Klaviyo, etc.)
      {
        source: '/wc-auth/:path*',
        destination: `${wpBaseUrl}/wc-auth/:path*`,
      },
      // WooCommerce OAuth with subsite prefix (WordPress redirects include /drinkyum/)
      {
        source: '/drinkyum/wc-auth/:path*',
        destination: `${wpBaseUrl}/wc-auth/:path*`,
      },
      // Medusa product images: /cdn/products/abc.jpg → s3://bucket/drinkyum/products/abc.jpg
      {
        source: '/cdn/:path*',
        destination: `${s3Url}/${tenantSlug}/:path*`,
      },
      // WordPress media uploads: /wp-media/2026/01/img.jpg → WordPress uploads
      // Files are stored at: wordpress-server/wp-content/uploads/sites/{siteId}/
      {
        source: '/wp-media/:path*',
        destination: `${wpBaseUrl}/wp-content/uploads/sites/${wpSiteId}/:path*`,
      },
    ];
  },

  /**
   * Allow images from S3 bucket
   */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'medusa-multistore-assets.s3.us-east-1.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '*.s3.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '*.s3.*.amazonaws.com',
      },
      // WordPress on Railway (for product images from WooCommerce)
      {
        protocol: 'https',
        hostname: 'wordpress-production-7c0a.up.railway.app',
      },
    ],
    path: '/img',
  },
};

export default nextConfig;
