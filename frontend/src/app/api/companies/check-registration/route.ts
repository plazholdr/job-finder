import { NextRequest, NextResponse } from 'next/server';
import config from '@/config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { registrationNumber } = body;

    if (!registrationNumber) {
      return NextResponse.json(
        { error: 'Registration number is required' },
        { status: 400 }
      );
    }

    // Prefer a server-only BACKEND_URL when available (staging/prod),
    // otherwise fall back to public config api base URL
    const backendUrl = process.env.BACKEND_URL || config.api.baseUrl;

    // Call backend API to check if registration number exists
    const response = await fetch(`${backendUrl}/companies/check-registration`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        registrationNumber,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Failed to check registration' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Check registration API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
