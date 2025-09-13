import { NextRequest, NextResponse } from 'next/server';
import config from '@/config';

export async function GET(request: NextRequest) {
  try {
    const auth = request.headers.get('authorization') || '';
    const res = await fetch(`${config.api.baseUrl}/admin/companies/pending`, {
      headers: auth ? { Authorization: auth } : undefined,
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Error fetching pending companies:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch pending companies'
      },
      { status: 500 }
    );
  }
}
