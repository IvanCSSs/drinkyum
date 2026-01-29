import { NextRequest, NextResponse } from 'next/server'

// WordPress API URL for DrinkYUM
const WP_API_URL = process.env.NEXT_PUBLIC_WP_URL || 'https://wordpress-production-7c0a.up.railway.app/drinkyum'

export async function POST(req: NextRequest) {
  try {
    const { labId, email } = await req.json()

    // Validate inputs
    if (!labId || !email) {
      return NextResponse.json(
        { success: false, error: 'Lab ID and email are required' },
        { status: 400 }
      )
    }

    // Normalize Lab ID format (XXXX-XXXX)
    const normalizedLabId = labId.toUpperCase().trim()
    if (!/^[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(normalizedLabId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid Lab ID format. Expected: XXXX-XXXX' },
        { status: 400 }
      )
    }

    // Call WordPress REST API
    const wpResponse = await fetch(
      `${WP_API_URL}/?rest_route=/drinkyum/v1/lab-lookup`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lab_id: normalizedLabId,
          email: email,
        }),
      }
    )

    const data = await wpResponse.json()

    if (!wpResponse.ok) {
      return NextResponse.json(
        { success: false, error: data.error || 'Lab ID not found' },
        { status: wpResponse.status }
      )
    }

    return NextResponse.json({
      success: true,
      message: data.message || 'Lab results sent to your email',
    })

  } catch (error) {
    console.error('Lab lookup error:', error)
    return NextResponse.json(
      { success: false, error: 'An error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
