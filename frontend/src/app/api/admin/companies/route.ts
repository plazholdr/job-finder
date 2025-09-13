import { NextRequest, NextResponse } from 'next/server';
import config from '@/config';

export async function GET(request: NextRequest) {
  try {
  const auth = request.headers.get('authorization') || '';
  const { search } = new URL(request.url);
  const url = `${config.api.baseUrl}/admin/companies${search || ''}`;
  const res = await fetch(url, {
      headers: auth ? { Authorization: auth } : undefined,
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch companies'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = request.headers.get('authorization') || '';
    const body = await request.json();
    const res = await fetch(`${config.api.baseUrl}/admin/companies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(auth ? { Authorization: auth } : {}),
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Error creating company:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create company'
      },
      { status: 500 }
    );
  }
}
