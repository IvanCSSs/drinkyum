import { NextRequest, NextResponse } from 'next/server'

// Firebase Realtime Database URL (from LunaYum project)
const FIREBASE_DB_URL = 'https://luna-134a2-default-rtdb.firebaseio.com'

// Email config - using environment variables
const SMTP_HOST = process.env.SMTP_HOST || 'email-smtp.us-east-2.amazonaws.com'
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587')
const SMTP_USER = process.env.SMTP_USER || process.env.AWS_SES_SMTP_USER
const SMTP_PASS = process.env.SMTP_PASS || process.env.AWS_SES_SMTP_PASS
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@drinkyum.com'

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

    // Query Firebase for lab result
    const firebaseResponse = await fetch(
      `${FIREBASE_DB_URL}/labs/${normalizedLabId}.json`
    )
    
    if (!firebaseResponse.ok) {
      console.error('Firebase error:', firebaseResponse.status)
      return NextResponse.json(
        { success: false, error: 'Error checking lab results' },
        { status: 500 }
      )
    }

    const labData = await firebaseResponse.json()
    
    if (!labData) {
      return NextResponse.json(
        { success: false, error: 'Lab ID not found. Please check your ID and try again.' },
        { status: 404 }
      )
    }

    // Send email with PDF attachment
    const pdfUrl = labData.file
    const fileName = labData.fileName || `YUM_Lab_Results_${normalizedLabId}.pdf`

    // Use nodemailer to send email
    const nodemailer = await import('nodemailer')
    
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    })

    await transporter.sendMail({
      from: `"DrinkYUM Lab Results" <${FROM_EMAIL}>`,
      to: email,
      subject: 'Your YUM Kratom Lab Test Results',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #E1258F;">Your Lab Results Are Ready</h2>
          <p>Thank you for your interest in the quality and safety of YUM Kratom products.</p>
          <p>At DrinkYUM, we're committed to transparency and quality. Every batch is rigorously tested 
          by independent third-party laboratories to ensure you're getting a safe, consistent product.</p>
          <p>Attached you'll find the detailed test results for <strong>Lab ID: ${normalizedLabId}</strong>.</p>
          <p>These results include:</p>
          <ul>
            <li>Alkaloid content (Mitragynine & 7-OH levels)</li>
            <li>Heavy metal screening</li>
            <li>Microbial testing</li>
            <li>Contaminant analysis</li>
          </ul>
          <p>If you have any questions about these results, please don't hesitate to reach out.</p>
          <br/>
          <p>Stay unstoppable,</p>
          <p><strong>The DrinkYUM Team</strong></p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="color: #888; font-size: 12px;">
            DrinkYUM | Premium Kratom Extract<br/>
            <a href="https://drinkyum.com" style="color: #E1258F;">drinkyum.com</a>
          </p>
        </div>
      `,
      attachments: [
        {
          filename: fileName,
          path: pdfUrl,
        },
      ],
    })

    return NextResponse.json({
      success: true,
      message: 'Lab results sent to your email',
    })

  } catch (error) {
    console.error('Lab lookup error:', error)
    return NextResponse.json(
      { success: false, error: 'An error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
