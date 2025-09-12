import { NextRequest, NextResponse } from 'next/server';
import config from '@/config';

const API_BASE_URL = config.api.baseUrl;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '50';
    const skip = searchParams.get('skip') || '0';
    const status = searchParams.get('status');
    const sort = searchParams.get('sort') || 'recent';

    // Build query parameters for backend
    const queryParams = new URLSearchParams();
    queryParams.append('$limit', limit);
    queryParams.append('$skip', skip);

    // Map frontend sort to backend sort
    if (sort === 'recent') {
      queryParams.append('$sort', JSON.stringify({ createdAt: -1 }));
    } else if (sort === 'applications') {
      queryParams.append('$sort', JSON.stringify({ applications: -1 }));
    } else if (sort === 'views') {
      queryParams.append('$sort', JSON.stringify({ views: -1 }));
    }

    if (status) {
      queryParams.append('status', status);
    }

    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 });
    }

    // Call backend API - this will automatically filter by company for company users
    const response = await fetch(`${API_BASE_URL}/jobs?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Failed to fetch company jobs' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Company jobs fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 });
    }

    const body = await request.json();

    const response = await fetch(`${API_BASE_URL}/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || data.error || 'Failed to create job' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Job creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
