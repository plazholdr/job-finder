import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import config from '@/config';

const API_BASE_URL = config.api.baseUrl;

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();

    let authHeader = request.headers.get('authorization') || '';
    if (!authHeader) {
      const cookieStore = await cookies();
      const token = cookieStore.get('token')?.value;
      if (token) authHeader = `Bearer ${token}`;
    }
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resp = await fetch(`${API_BASE_URL}/admin/jobs/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify(body),
    });

    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      return NextResponse.json({ error: data?.error || 'Failed to update status' }, { status: resp.status });
    }

    return NextResponse.json(data);
  } catch (e) {
    console.error('Admin job status API error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

