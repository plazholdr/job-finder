import { NextRequest, NextResponse } from 'next/server';
import config from '@/config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      password,
      firstName,
      lastName,
      role,
      // Extended profile data from multi-step form
      icPassport,
      phone,
      photo,
      education,
      certifications,
      interests,
      workExperience,
      eventExperience,
      // Company registration specific
      username,
      requireEmailVerification
    } = body;

    // Validate role
    if (!['student', 'company'].includes(role)) {
      return NextResponse.json(
        { error: 'Role must be either "student" or "company"' },
        { status: 400 }
      );
    }

    // Role-specific validation
    if (role === 'company') {
      const looksLikeEmail = typeof (username || '') === 'string' && /.+@.+\..+/.test(username);
      const derivedEmail = email || (looksLikeEmail ? username : '');
      if (!password || !derivedEmail) {
        return NextResponse.json(
          { error: 'For company registration, provide password and either an email or a username that is an email' },
          { status: 400 }
        );
      }
    } else {
      if (!email || !password || !firstName || !lastName) {
        return NextResponse.json(
          { error: 'Email, password, first name and last name are required' },
          { status: 400 }
        );
      }
    }

    // Build API base to reach the backend reliably in all envs
    // Prefer going through the external /api reverse-proxy (Nginx) when headers are present
    const proto = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
    const apiViaProxy = host ? `${proto}://${host}/api` : null;
    const backendUrl = apiViaProxy || process.env.BACKEND_URL || config.api.baseUrl;

    // Prepare user data for backend
    let userData: any;

    if (role === 'company') {
      const looksLikeEmail = typeof (username || '') === 'string' && /.+@.+\..+/.test(username);
      const derivedEmail = email || (looksLikeEmail ? username : '');
      userData = {
        email: derivedEmail,
        password,
        role,
        username,
        requireEmailVerification: typeof requireEmailVerification === 'boolean' ? requireEmailVerification : true,
      };
    } else {
      userData = {
        email,
        password,
        firstName,
        lastName,
        role,
        // Extended profile data
        icPassport,
        phone,
        photo,
        education,
        certifications,
        interests,
        workExperience,
        eventExperience
      };
    }

    // Call backend API to create user
    const response = await fetch(`${backendUrl}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const raw = await response.text();
    let data: any;
    try {
      data = JSON.parse(raw);
    } catch {
      data = { error: raw };
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || data.message || 'Registration failed' },
        { status: response.status }
      );
    }

    // For company registrations that require email verification, don't auto-login
    if (role === 'company' && (requireEmailVerification ?? true)) {
      return NextResponse.json({ success: true, user: data }, { status: 201 });
    }

    // Auto-login after successful registration (student)
    const loginResponse = await fetch(`${backendUrl}/authentication`, {
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

    const loginRaw = await loginResponse.text();
    let loginData: any;
    try {
      loginData = JSON.parse(loginRaw);
    } catch {
      loginData = { error: loginRaw };
    }

    if (!loginResponse.ok) {
      return NextResponse.json(
        { error: loginData.error || loginData.message || 'Login failed after registration', user: data },
        { status: loginResponse.status }
      );
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
