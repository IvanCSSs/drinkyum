import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
      // Medusa product images: /cdn/products/abc.jpg → s3://bucket/drinkyum/products/abc.jpg
      {
        source: '/cdn/:path*',
        destination: `${s3Url}/${tenantSlug}/:path*`,
      },
      // WordPress media uploads: /wp-media/2026/01/img.jpg → WordPress uploads
      // Currently proxies to Railway; will switch to S3 after S3-Uploads migration
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
  },
};

export default nextConfig;
