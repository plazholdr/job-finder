import { NextRequest, NextResponse } from 'next/server';
import config from '@/config';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const formData = await req.formData();

    const backendUrl = `${config.api.baseUrl}/companies/essentials`;
    const res = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        // Do not set Content-Type; browser will set boundary for multipart
      } as any,
      body: formData as any,
    });

    const contentType = res.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    const data = isJson ? await res.json() : await res.text();

    if (!res.ok) {
      return NextResponse.json({ error: (data as any)?.error || 'Failed to submit company essentials' }, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}
