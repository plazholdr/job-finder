import { NextRequest, NextResponse } from 'next/server';
import config from '@/config';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const token = formData.get('token') as string;
    const companyName = formData.get('companyName') as string;
    const companyRegistrationNumber = formData.get('companyRegistrationNumber') as string;
    const companyContactNumber = formData.get('companyContactNumber') as string;
    const superform = formData.get('superform') as File;

    if (!token || !companyName || !companyRegistrationNumber || !companyContactNumber) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (!superform) {
      return NextResponse.json(
        { error: 'Superform document is required' },
        { status: 400 }
      );
    }

    // Prefer a server-only BACKEND_URL when available (staging/prod),
    // otherwise fall back to public config api base URL
    const backendUrl = process.env.BACKEND_URL || config.api.baseUrl;

    // Prepare form data for backend
    const backendFormData = new FormData();
    backendFormData.append('token', token);
    backendFormData.append('companyName', companyName);
    backendFormData.append('companyRegistrationNumber', companyRegistrationNumber);
    backendFormData.append('companyContactNumber', companyContactNumber);
    backendFormData.append('superform', superform);

    // Call backend API to complete company setup
    const response = await fetch(`${backendUrl}/companies/setup`, {
      method: 'POST',
      body: backendFormData,
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Failed to setup company' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Company setup API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
