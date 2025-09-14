import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    const url = searchParams.get('url');
    const minutes = searchParams.get('minutes') || '10';

    // Use direct backend URL for server-side requests
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3030';
    const target = new URL(`${backendUrl}/files/image`);
    if (key) target.searchParams.set('key', key);
    if (url) target.searchParams.set('url', url);
    if (minutes) target.searchParams.set('minutes', minutes);

    // Just proxy the redirect response from backend
    const resp = await fetch(target.toString(), { redirect: 'manual' });
    if (resp.status >= 300 && resp.status < 400) {
      const location = resp.headers.get('location');
      if (location) return NextResponse.redirect(location, { status: 302 });
    }

    const blob = await resp.blob();
    return new NextResponse(blob, {
      status: resp.status,
      headers: {
        'Content-Type': resp.headers.get('content-type') || 'application/octet-stream'
      }
    });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to load image' }, { status: 500 });
  }
}
