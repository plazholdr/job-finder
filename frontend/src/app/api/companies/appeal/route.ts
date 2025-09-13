import { NextRequest, NextResponse } from 'next/server';
import config from '@/config';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (!token) return NextResponse.json({ error: 'Token is required' }, { status: 400 });
  const res = await fetch(`${config.api.baseUrl}/companies/appeal/validate?token=${encodeURIComponent(token)}`);
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const res = await fetch(`${config.api.baseUrl}/companies/appeal`, {
      method: 'POST',
      body: formData as any,
    });
    const contentType = res.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    const data = isJson ? await res.json() : await res.text();
    return NextResponse.json(data as any, { status: res.status });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
