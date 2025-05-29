import { NextRequest, NextResponse } from 'next/server';
import config from '@/config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName, role = 'student' } = body;

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Email, password, first name, and last name are required' },
        { status: 400 }
      );
    }

    // Call backend API to create user
    const response = await fetch(`${config.api.baseUrl}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        firstName,
        lastName,
        role,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Registration failed' },
        { status: response.status }
      );
    }

    // Auto-login after successful registration
    const loginResponse = await fetch(`${config.api.baseUrl}/authentication`, {
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

    const loginData = await loginResponse.json();

    if (!loginResponse.ok) {
      // Registration succeeded but login failed
      return NextResponse.json({
        user: data,
        message: 'Registration successful. Please login manually.',
      });
    }

    return NextResponse.json(loginData);
  } catch (error) {
    console.error('Registration API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
