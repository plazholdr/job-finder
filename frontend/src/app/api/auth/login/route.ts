import { NextRequest, NextResponse } from 'next/server';
import config from '@/config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Prefer a server-only BACKEND_URL when available (staging/prod),
    // otherwise fall back to public config api base URL
    const backendUrl = process.env.BACKEND_URL || config.api.baseUrl;

    // Call backend API
    const response = await fetch(`${backendUrl}/authentication`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        strategy: 'local',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Authentication failed' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
