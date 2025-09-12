import { NextRequest, NextResponse } from 'next/server';
import config from '@/config';

const API_BASE_URL = config.api.baseUrl;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ hasApplied: false });
    }

    const { id } = params;

    const response = await fetch(`${API_BASE_URL}/jobs/${id}/applied`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ hasApplied: false });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Check applied status error:', error);
    return NextResponse.json({ hasApplied: false });
  }
}
