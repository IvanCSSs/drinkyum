/**
 * Content/CMS Functions
 *
 * Handles fetching blog posts, pages, FAQs, and banner content
 * from the Medusa content module.
 */

import { medusa } from './medusa-client'

// Types
export type ContentType = 'blog' | 'page' | 'faq' | 'banner'

export type ContentStatus = 'draft' | 'published' | 'scheduled'

export interface ContentEntry {
  id: string
  slug: string
  title: string
  content: string
  excerpt?: string
  featured_image?: string
  seo_title?: string
  seo_description?: string
  status: ContentStatus
  published_at?: string
  author?: {
    id: string
    name: string
    avatar?: string
  }
  tags?: string[]
  metadata?: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface ContentListParams {
  limit?: number
  offset?: number
  status?: ContentStatus
  tag?: string
  order?: string
}

/**
 * Build query string from params
 */
function buildQuery(params?: ContentListParams): string {
  if (!params) return ''

  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      query.set(key, String(value))
    }
  }

  const str = query.toString()
  return str ? `?${str}` : ''
}

/**
 * Get list of content entries by type
 */
export async function getContent(
  type: ContentType,
  params?: ContentListParams
): Promise<{
  entries: ContentEntry[]
  count: number
  offset: number
  limit: number
}> {
  const query = buildQuery(params)
  return medusa.get(`/store/content/${type}${query}`)
}

/**
 * Get single content entry by slug
 */
export async function getContentBySlug(
  type: ContentType,
  slug: string
): Promise<ContentEntry | null> {
  try {
    const response = await medusa.get<{ entry: ContentEntry }>(
      `/store/content/${type}/${encodeURIComponent(slug)}`
    )
    return response.entry
  } catch {
    return null
  }
}

/**
 * Get published blog posts
 */
export async function getBlogPosts(params?: {
  limit?: number
  offset?: number
  tag?: string
}): Promise<{
  posts: ContentEntry[]
  count: number
}> {
  const response = await getContent('blog', {
    ...params,
    status: 'published',
    order: '-published_at',
  })
  return {
    posts: response.entries,
    count: response.count,
  }
}

/**
 * Get single blog post by slug
 */
export async function getBlogPost(slug: string): Promise<ContentEntry | null> {
  return getContentBySlug('blog', slug)
}

/**
 * Get static page by slug
 */
export async function getPage(slug: string): Promise<ContentEntry | null> {
  return getContentBySlug('page', slug)
}

/**
 * Get all published FAQs
 */
export async function getFAQs(): Promise<ContentEntry[]> {
  const response = await getContent('faq', {
    status: 'published',
    limit: 100,
  })
  return response.entries
}

/**
 * Get active banners/promotions
 */
export async function getActiveBanners(): Promise<ContentEntry[]> {
  const response = await getContent('banner', {
    status: 'published',
    limit: 10,
  })

  // Filter by date range if specified in metadata
  const now = new Date()
  return response.entries.filter(banner => {
    const startDate = banner.metadata?.start_date
      ? new Date(banner.metadata.start_date as string)
      : null
    const endDate = banner.metadata?.end_date
      ? new Date(banner.metadata.end_date as string)
      : null

    const afterStart = !startDate || now >= startDate
    const beforeEnd = !endDate || now <= endDate

    return afterStart && beforeEnd
  })
}

/**
 * Get all unique blog tags
 */
export async function getBlogTags(): Promise<string[]> {
  const response = await getContent('blog', {
    status: 'published',
    limit: 1000,
  })

  const tags = new Set<string>()
  response.entries.forEach(entry => {
    entry.tags?.forEach(tag => tags.add(tag))
  })

  return Array.from(tags).sort()
}

/**
 * Search content across types
 */
export async function searchContent(
  query: string,
  types: ContentType[] = ['blog', 'page', 'faq']
): Promise<ContentEntry[]> {
  const results = await Promise.all(
    types.map(async type => {
      try {
        const response = await medusa.get<{ entries: ContentEntry[] }>(
          `/store/content/${type}?q=${encodeURIComponent(query)}&status=published`
        )
        return response.entries.map(e => ({ ...e, type }))
      } catch {
        return []
      }
    })
  )

  return results.flat()
}

/**
 * Format date for display
 */
export function formatContentDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Generate excerpt from content if not provided
 */
export function getExcerpt(entry: ContentEntry, maxLength: number = 160): string {
  if (entry.excerpt) return entry.excerpt

  // Strip HTML and truncate
  const text = entry.content.replace(/<[^>]*>/g, '')
  if (text.length <= maxLength) return text

  return text.substring(0, maxLength).trim() + '...'
}
