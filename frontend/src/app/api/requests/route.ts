import { NextRequest, NextResponse } from 'next/server';
import config from '@/config';

const API_BASE_URL = config.api.baseUrl;

// GET all requests
export async function GET(request: NextRequest) {
  try {
    // Get auth header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Authorization header required' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = new URLSearchParams();
    
    // Forward all query parameters
    searchParams.forEach((value, key) => {
      queryParams.append(key, value);
    });

    // Call backend API to get requests
    console.log('Fetching requests with query:', queryParams.toString());
    console.log('API_BASE_URL:', API_BASE_URL);
    console.log('Full URL:', `${API_BASE_URL}/requests?${queryParams.toString()}`);

    const response = await fetch(`${API_BASE_URL}/requests?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
    });

    console.log('Backend response status:', response.status);
    const data = await response.json();
    console.log('Backend response data:', data);

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: data.error || 'Failed to fetch requests'
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      data: data.data || [],
      total: data.total || 0
    });

  } catch (error) {
    console.error('Requests fetch error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// POST create new request
export async function POST(request: NextRequest) {
  try {
    const requestData = await request.json();

    // Get auth header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Authorization header required' },
        { status: 401 }
      );
    }

    // Call backend API to create request
    console.log('Creating request with data:', requestData);

    const response = await fetch(`${API_BASE_URL}/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify(requestData),
    });

    console.log('Backend response status:', response.status);
    const data = await response.json();
    console.log('Backend response data:', data);

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: data.error || 'Failed to create request'
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      data: data.data,
      message: data.message || 'Request created successfully'
    });

  } catch (error) {
    console.error('Request creation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
