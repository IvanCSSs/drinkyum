/**
 * WordPress Blog Posts API Client
 *
 * Fetches blog posts from the WordPress headless API.
 * Uses the custom /wp-json/headless/v1/posts endpoint.
 */

import { wpImageUrl, transformContentUrls } from './wordpress-images'

const WP_URL = process.env.NEXT_PUBLIC_WP_URL || 'https://wordpress-production-7c0a.up.railway.app/drinkyum'

/**
 * Decode HTML entities like &#8217; → '
 * WordPress returns titles/excerpts with encoded entities
 */
function decodeHtmlEntities(text: string): string {
  const entities: Record<string, string> = {
    '&#8217;': "'",
    '&#8216;': "'",
    '&#8220;': '"',
    '&#8221;': '"',
    '&#8211;': '–',
    '&#8212;': '—',
    '&#8230;': '…',
    '&#038;': '&',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&apos;': "'",
    '&nbsp;': ' ',
  }
  
  let decoded = text
  for (const [entity, char] of Object.entries(entities)) {
    decoded = decoded.replace(new RegExp(entity, 'g'), char)
  }
  
  // Handle numeric entities like &#39; &#34; etc.
  decoded = decoded.replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num, 10)))
  decoded = decoded.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
  
  return decoded
}

// Types

export interface BlogAuthor {
  id: string
  name: string
  avatar: string | null
}

export interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  content?: string
  featured_image: string | null
  status: 'published' | 'draft'
  published_at: string | null
  updated_at: string | null
  author: BlogAuthor | null
  tags: string[]
  categories: string[]
}

export interface BlogTag {
  id: string
  name: string
  slug: string
  count: number
}

export interface BlogCategory {
  id: string
  name: string
  slug: string
  count: number
  description: string
  parent_id: string | null
}

export interface Pagination {
  page: number
  per_page: number
  total: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
}

export interface PostsResponse {
  posts: BlogPost[]
  pagination: Pagination
}

export interface SinglePostResponse {
  post: BlogPost
  related: BlogPost[]
}

export interface TagsResponse {
  tags: BlogTag[]
}

export interface CategoriesResponse {
  categories: BlogCategory[]
}

export interface GetPostsParams {
  page?: number
  per_page?: number
  search?: string
  tag?: string
  category?: string
  order?: 'asc' | 'desc'
  orderby?: 'date' | 'title' | 'modified'
}

/**
 * WordPress REST API client (using standard WP REST API)
 * 
 * Note: Using ?rest_route= query parameter format because WordPress
 * permalinks aren't configured for pretty /wp-json/ URLs.
 */
class WordPressPostsClient {
  private wpUrl: string

  constructor() {
    this.wpUrl = WP_URL
  }

  /**
   * Make a GET request to the WP REST API using rest_route query param
   */
  private async get<T>(restRoute: string, params?: Record<string, string | number | undefined>): Promise<T> {
    const url = new URL(this.wpUrl)
    url.searchParams.set('rest_route', restRoute)

    // Add query params
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          url.searchParams.set(key, String(value))
        }
      })
    }

    // Add cache buster to bypass any server-side caching
    url.searchParams.set('_', String(Date.now()))

    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Use Next.js revalidation for caching
      next: { revalidate: 60 }, // Revalidate every 60 seconds
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Request failed' }))
      throw new Error(error.message || `HTTP ${res.status}`)
    }

    return res.json()
  }

  /**
   * Get list of blog posts with pagination and filters
   * Uses standard WP REST API /wp/v2/posts
   */
  async getPosts(params?: GetPostsParams): Promise<PostsResponse> {
    // Fetch posts from standard WP REST API
    const wpPosts = await this.get<WPPost[]>('/wp/v2/posts', {
      page: params?.page,
      per_page: params?.per_page,
      search: params?.search,
      order: params?.order,
      orderby: params?.orderby,
    })

    // Transform WP posts to our format
    const posts: BlogPost[] = wpPosts.map(this.transformWPPost)

    // WP REST API returns total in headers, but we'll estimate for now
    const total = wpPosts.length
    const perPage = params?.per_page || 10
    const page = params?.page || 1

    return {
      posts,
      pagination: {
        page,
        per_page: perPage,
        total,
        total_pages: Math.ceil(total / perPage),
        has_next: wpPosts.length === perPage,
        has_prev: page > 1,
      },
    }
  }

  /**
   * Get a single post by slug
   */
  async getPost(slug: string): Promise<SinglePostResponse> {
    const wpPosts = await this.get<WPPost[]>('/wp/v2/posts', {
      slug: slug,
    })

    if (!wpPosts.length) {
      throw new Error('Post not found')
    }

    const post = this.transformWPPost(wpPosts[0])

    return {
      post,
      related: [], // TODO: Fetch related posts if needed
    }
  }

  /**
   * Transform WP REST API post to our BlogPost format
   */
  private transformWPPost(wp: WPPost): BlogPost {
    // Strip HTML and decode entities for excerpt
    const rawExcerpt = wp.excerpt.rendered.replace(/<[^>]*>/g, '').trim()
    
    return {
      id: String(wp.id),
      slug: wp.slug,
      title: decodeHtmlEntities(wp.title.rendered),
      excerpt: decodeHtmlEntities(rawExcerpt),
      content: wp.content.rendered,
      featured_image: wp.featured_media ? null : null, // TODO: Fetch featured image if needed
      status: wp.status === 'publish' ? 'published' : 'draft',
      published_at: wp.date,
      updated_at: wp.modified,
      author: null, // TODO: Fetch author if needed
      tags: [],
      categories: [],
    }
  }

  /**
   * Get all tags
   */
  async getTags(): Promise<TagsResponse> {
    const wpTags = await this.get<WPTag[]>('/wp/v2/tags', { per_page: 100 })
    return {
      tags: wpTags.map(t => ({
        id: String(t.id),
        name: t.name,
        slug: t.slug,
        count: t.count,
      })),
    }
  }

  /**
   * Get all categories
   */
  async getCategories(): Promise<CategoriesResponse> {
    const wpCats = await this.get<WPCategory[]>('/wp/v2/categories', { per_page: 100 })
    return {
      categories: wpCats.map(c => ({
        id: String(c.id),
        name: c.name,
        slug: c.slug,
        count: c.count,
        description: c.description,
        parent_id: c.parent ? String(c.parent) : null,
      })),
    }
  }

  /**
   * Get base URL for debugging
   */
  getBaseUrl(): string {
    return this.wpUrl
  }
}

// WordPress REST API types
interface WPPost {
  id: number
  slug: string
  title: { rendered: string }
  content: { rendered: string }
  excerpt: { rendered: string }
  date: string
  modified: string
  status: string
  featured_media: number
  author: number
}

interface WPTag {
  id: number
  name: string
  slug: string
  count: number
}

interface WPCategory {
  id: number
  name: string
  slug: string
  count: number
  description: string
  parent: number
}

// Singleton instance
export const wordpressPosts = new WordPressPostsClient()

/**
 * Transform all image URLs in a blog post to local proxy paths
 */
function transformPostUrls(post: BlogPost): BlogPost {
  return {
    ...post,
    featured_image: post.featured_image ? wpImageUrl(post.featured_image) : null,
    content: post.content ? transformContentUrls(post.content) : undefined,
  }
}

/**
 * Helper functions with error handling
 */

export async function getBlogPosts(params?: GetPostsParams): Promise<PostsResponse> {
  try {
    const response = await wordpressPosts.getPosts(params)
    return {
      ...response,
      posts: response.posts.map(transformPostUrls),
    }
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    // Return empty response on error
    return {
      posts: [],
      pagination: {
        page: params?.page || 1,
        per_page: params?.per_page || 10,
        total: 0,
        total_pages: 0,
        has_next: false,
        has_prev: false,
      },
    }
  }
}

export async function getBlogPost(slug: string): Promise<SinglePostResponse | null> {
  try {
    const response = await wordpressPosts.getPost(slug)
    return {
      post: transformPostUrls(response.post),
      related: response.related.map(transformPostUrls),
    }
  } catch (error) {
    console.error(`Error fetching blog post ${slug}:`, error)
    return null
  }
}

export async function getBlogTags(): Promise<BlogTag[]> {
  try {
    const response = await wordpressPosts.getTags()
    return response.tags
  } catch (error) {
    console.error('Error fetching blog tags:', error)
    return []
  }
}

export async function getBlogCategories(): Promise<BlogCategory[]> {
  try {
    const response = await wordpressPosts.getCategories()
    return response.categories
  } catch (error) {
    console.error('Error fetching blog categories:', error)
    return []
  }
}

/**
 * Format date for display
 */
export function formatPostDate(dateString: string | null): string {
  if (!dateString) return ''

  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Calculate reading time from content
 */
export function calculateReadingTime(content: string): number {
  // Strip HTML tags and count words
  const text = content.replace(/<[^>]*>/g, '')
  const wordCount = text.split(/\s+/).filter(Boolean).length

  // Average reading speed: 200 words per minute
  const minutes = Math.ceil(wordCount / 200)
  return Math.max(1, minutes)
}
