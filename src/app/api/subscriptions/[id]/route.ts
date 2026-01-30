import { buildWpApiUrl } from "@/lib/wp-api-url"
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const authHeader = request.headers.get('Authorization')

    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 })
    }

    const response = await fetch(
      buildWpApiUrl(`/store/v1/subscriptions/${id}`),
      {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Subscription not found' }))
      return NextResponse.json(
        { error: errorData.message || 'Subscription not found' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('[Subscriptions API] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch subscription' }, { status: 500 })
  }
}
