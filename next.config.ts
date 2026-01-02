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

    return [
      {
        source: '/cdn/:path*',
        destination: `${s3Url}/${tenantSlug}/:path*`,
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
    ],
  },
};

export default nextConfig;
