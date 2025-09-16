import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import config from '@/config';

const API_BASE_URL = config.api.baseUrl;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = new URLSearchParams(searchParams as any);

    // Resolve auth token from header or cookie
    let authHeader = request.headers.get('authorization') || '';
    if (!authHeader) {
      const cookieStore = await cookies();
      const token = cookieStore.get('token')?.value;
      if (token) authHeader = `Bearer ${token}`;
    }
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resp = await fetch(`${API_BASE_URL}/admin/jobs?${query.toString()}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      cache: 'no-store',
    });

    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      return NextResponse.json({ error: data?.error || 'Failed to fetch jobs' }, { status: resp.status });
    }

    return NextResponse.json(data);
  } catch (e) {
    console.error('Admin jobs API error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

