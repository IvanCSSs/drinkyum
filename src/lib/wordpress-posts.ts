/**
 * WordPress Blog Posts API Client
 *
 * Fetches blog posts from the WordPress headless API.
 * Uses the custom /wp-json/headless/v1/posts endpoint.
 */

const WP_URL = process.env.NEXT_PUBLIC_WP_URL || 'https://wordpress-production-7c0a.up.railway.app/drinkyum'

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
 * WordPress Headless API client
 */
class WordPressPostsClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = `${WP_URL}/wp-json/headless/v1`
  }

  /**
   * Make a GET request to the headless API
   */
  private async get<T>(path: string, params?: Record<string, string | number | undefined>): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`)

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
   */
  async getPosts(params?: GetPostsParams): Promise<PostsResponse> {
    return this.get<PostsResponse>('/posts', {
      page: params?.page,
      per_page: params?.per_page,
      search: params?.search,
      tag: params?.tag,
      category: params?.category,
      order: params?.order,
      orderby: params?.orderby,
    })
  }

  /**
   * Get a single post by slug
   */
  async getPost(slug: string): Promise<SinglePostResponse> {
    return this.get<SinglePostResponse>(`/posts/${encodeURIComponent(slug)}`)
  }

  /**
   * Get all tags
   */
  async getTags(): Promise<TagsResponse> {
    return this.get<TagsResponse>('/tags')
  }

  /**
   * Get all categories
   */
  async getCategories(): Promise<CategoriesResponse> {
    return this.get<CategoriesResponse>('/categories')
  }

  /**
   * Get base URL for debugging
   */
  getBaseUrl(): string {
    return this.baseUrl
  }
}

// Singleton instance
export const wordpressPosts = new WordPressPostsClient()

/**
 * Helper functions with error handling
 */

export async function getBlogPosts(params?: GetPostsParams): Promise<PostsResponse> {
  try {
    return await wordpressPosts.getPosts(params)
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
    return await wordpressPosts.getPost(slug)
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
