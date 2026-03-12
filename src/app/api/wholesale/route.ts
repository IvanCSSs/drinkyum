import { NextRequest, NextResponse } from 'next/server';
import { buildWpApiUrl } from "@/lib/wp-api-url";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const response = await fetch(buildWpApiUrl('/store/v1/wholesale'), {
      method: 'POST',
      body: formData,
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('[Wholesale API] Error:', error);
    return NextResponse.json({ error: 'Submission failed' }, { status: 500 });
  }
}
