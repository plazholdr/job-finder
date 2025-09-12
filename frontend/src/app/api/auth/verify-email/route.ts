import { NextRequest, NextResponse } from 'next/server';
import config from '@/config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

  // Prefer a server-only BACKEND_URL when available (staging/prod),
  // otherwise fall back to public config api base URL
  const isProd = process.env.NODE_ENV === 'production';
  // In production, default to the local backend port unless BACKEND_URL is provided.
  // Using the frontend domain here can cause 404s if not reverse-proxied to the backend.
  const backendUrl = process.env.BACKEND_URL || (isProd ? 'http://localhost:3030' : config.api.baseUrl);

  // Call backend API to verify email
  const response = await fetch(`${backendUrl}/email-verification/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

  const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Email verification failed' },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: data.message || 'Email verified successfully',
      role: data.role,
      needsCompanySetup: data.needsCompanySetup
    });
  } catch (error) {
    console.error('Email verification API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
