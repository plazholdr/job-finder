import { NextRequest, NextResponse } from 'next/server';
import config from '@/config';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Build query parameters
    const params = new URLSearchParams();
    
    // Add limit parameter if provided
    const limit = searchParams.get('limit');
    if (limit) {
      params.append('limit', limit);
    }

    // Call backend API
    const response = await fetch(`${config.api.baseUrl}/users/suggestions?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Failed to get suggestions' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('User suggestions API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
