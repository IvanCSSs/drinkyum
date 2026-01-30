import { buildWpApiUrl } from "@/lib/wp-api-url"
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const authHeader = request.headers.get('Authorization')

    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 })
    }

    const body = await request.json()

    const response = await fetch(
      buildWpApiUrl(`/store/v1/subscriptions/${id}/frequency`),
      {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to change frequency' }))
      return NextResponse.json(
        { error: errorData.message || 'Failed to change frequency' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('[Subscriptions API] Error:', error)
    return NextResponse.json({ error: 'Failed to change frequency' }, { status: 500 })
  }
}
