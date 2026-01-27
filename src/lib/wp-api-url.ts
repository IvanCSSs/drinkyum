/**
 * WordPress API URL Builder
 * 
 * Uses ?rest_route= query parameter format because WordPress multisite
 * subdirectory permalinks aren't configured for pretty /wp-json/ URLs.
 */

const WP_URL = process.env.NEXT_PUBLIC_WP_URL || 'https://wordpress-production-7c0a.up.railway.app/drinkyum'

/**
 * Build a WordPress REST API URL using the rest_route query parameter.
 * This bypasses permalink issues with WordPress multisite subdirectories.
 * 
 * @param restPath - The REST API path (e.g., '/wc/v3/products', '/wp/v2/posts')
 * @param params - Optional query parameters to append
 * @returns Full URL with rest_route parameter
 * 
 * @example
 * buildWpApiUrl('/wc/v3/products')
 * // => 'https://...?rest_route=%2Fwc%2Fv3%2Fproducts'
 * 
 * buildWpApiUrl('/auth/v1/login', { redirect: '/account' })
 * // => 'https://...?rest_route=%2Fauth%2Fv1%2Flogin&redirect=%2Faccount'
 */
export function buildWpApiUrl(restPath: string, params?: Record<string, string | number | boolean | undefined>): string {
  const url = new URL(WP_URL)
  url.searchParams.set('rest_route', restPath)
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, String(value))
      }
    })
  }
  
  return url.toString()
}

/**
 * Get the base WordPress URL (without /wp-json)
 */
export function getWpBaseUrl(): string {
  return WP_URL
}
