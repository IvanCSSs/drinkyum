/**
 * WordPress Image URL Transformer
 *
 * Transforms WordPress/WooCommerce S3 image URLs to local proxy paths.
 * This enables:
 * - Next.js automatic image optimization (WebP, resizing)
 * - Edge caching at Vercel's CDN
 * - Consistent URLs under your domain
 * - Hidden S3 bucket structure
 *
 * S3 Structure:
 *   medusa-multistore-assets/wordpress/uploads/sites/{siteId}/2026/01/image.jpg
 *
 * Transformed to:
 *   /wp-media/2026/01/image.jpg
 *
 * The /wp-media/ path is rewritten by next.config.ts to the S3 URL.
 */

/**
 * Transform a WordPress/S3 image URL to local /wp-media/ proxy path
 *
 * @param url - The original image URL (can be S3 URL or already transformed)
 * @param fallback - Fallback image path if url is empty/undefined
 * @returns Transformed URL or fallback
 *
 * @example
 * wpImageUrl('https://medusa-multistore-assets.s3.us-east-1.amazonaws.com/wordpress/uploads/sites/3/2026/01/product.jpg')
 * // Returns: '/wp-media/2026/01/product.jpg'
 *
 * wpImageUrl('/wp-media/2026/01/product.jpg')
 * // Returns: '/wp-media/2026/01/product.jpg' (unchanged)
 *
 * wpImageUrl(undefined)
 * // Returns: '/images/product-placeholder.png'
 */
export function wpImageUrl(
  url: string | undefined | null,
  fallback: string = '/images/product-placeholder.png'
): string {
  if (!url) return fallback;

  // Already a local path - return as-is
  if (url.startsWith('/wp-media/') || url.startsWith('/images/') || url.startsWith('/cdn/')) {
    return url;
  }

  // Transform WordPress Railway URL to local proxy
  // Matches: https://wordpress-production-7c0a.up.railway.app/drinkyum/wp-content/uploads/sites/3/2026/01/image.jpg
  const wpRailwayMatch = url.match(/wordpress-production-[^/]+\.up\.railway\.app\/[^/]+\/wp-content\/uploads\/sites\/\d+\/(.+)$/);
  if (wpRailwayMatch) {
    return `/wp-media/${wpRailwayMatch[1]}`;
  }

  // Transform S3 WordPress uploads URL to local proxy
  // Matches: .../wordpress/uploads/sites/{any-site-id}/path/to/image.jpg
  const wpUploadsMatch = url.match(/wordpress\/uploads\/sites\/\d+\/(.+)$/);
  if (wpUploadsMatch) {
    return `/wp-media/${wpUploadsMatch[1]}`;
  }

  // Return original URL if no transformation needed (external images, etc.)
  return url;
}

/**
 * WooCommerce product image structure
 */
interface WCProductImage {
  id?: number;
  src: string;
  name?: string;
  alt?: string;
}

/**
 * Generic product type with optional image fields
 */
interface ProductWithImages {
  images?: WCProductImage[];
  image?: string | { src: string };
  thumbnail?: string;
}

/**
 * Transform all image URLs in a WooCommerce product response
 *
 * @param product - WooCommerce product object with images array
 * @returns Product with transformed image URLs
 *
 * @example
 * const product = await woocommerce.get('products/123');
 * const transformed = transformProductImages(product);
 * // All image.src values are now /wp-media/... paths
 */
export function transformProductImages<T extends ProductWithImages>(product: T): T {
  return {
    ...product,
    // Transform images array
    images: product.images?.map((img) => ({
      ...img,
      src: wpImageUrl(img.src),
    })),
    // Transform single image field (if string)
    image:
      typeof product.image === 'string'
        ? wpImageUrl(product.image)
        : product.image
          ? { ...product.image, src: wpImageUrl(product.image.src) }
          : product.image,
    // Transform thumbnail
    thumbnail: product.thumbnail ? wpImageUrl(product.thumbnail) : product.thumbnail,
  };
}

/**
 * Transform an array of products
 *
 * @param products - Array of WooCommerce products
 * @returns Products with transformed image URLs
 */
export function transformProductsImages<T extends ProductWithImages>(products: T[]): T[] {
  return products.map(transformProductImages);
}

/**
 * Transform all WordPress/S3 image URLs in HTML content
 *
 * Finds all image URLs in HTML and transforms them to local proxy paths.
 * Works on src attributes, srcset, and inline style background-image.
 *
 * @param html - HTML content with embedded image URLs
 * @returns HTML with transformed image URLs
 *
 * @example
 * transformContentUrls('<img src="https://wordpress-production-7c0a.up.railway.app/drinkyum/wp-content/uploads/sites/3/2026/01/hero.jpg">')
 * // Returns: '<img src="/wp-media/2026/01/hero.jpg">'
 */
export function transformContentUrls(html: string | undefined | null): string {
  if (!html) return '';

  // Patterns to match WordPress/S3 URLs
  const patterns = [
    // WordPress Railway uploads
    /(https?:\/\/wordpress-production-[^"'\s]+\.up\.railway\.app\/[^"'\s]+\/wp-content\/uploads\/sites\/\d+\/)([^"'\s]+)/g,
    // S3 WordPress uploads
    /(https?:\/\/[^"'\s]*\.s3[^"'\s]*\.amazonaws\.com\/wordpress\/uploads\/sites\/\d+\/)([^"'\s]+)/g,
    // S3 direct (medusa-multistore-assets bucket)
    /(https?:\/\/medusa-multistore-assets\.s3[^"'\s]*\.amazonaws\.com\/wordpress\/uploads\/sites\/\d+\/)([^"'\s]+)/g,
  ];

  let transformed = html;

  for (const pattern of patterns) {
    transformed = transformed.replace(pattern, (_match, _prefix, path) => {
      return `/wp-media/${path}`;
    });
  }

  return transformed;
}
