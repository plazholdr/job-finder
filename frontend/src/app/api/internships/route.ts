import { NextRequest, NextResponse } from 'next/server';
import config from '@/config';

const API_BASE_URL = config.api.baseUrl;

// GET all internships
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

    // Call backend API to get internships
    console.log('Fetching internships with query:', queryParams.toString());
    console.log('API_BASE_URL:', API_BASE_URL);
    console.log('Full URL:', `${API_BASE_URL}/internships?${queryParams.toString()}`);

    const response = await fetch(`${API_BASE_URL}/internships?${queryParams.toString()}`, {
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
          error: data.error || 'Failed to fetch internships'
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('Error fetching internships:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// POST create new internship
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

    // Call backend API to create internship
    console.log('Creating internship with data:', requestData);

    const response = await fetch(`${API_BASE_URL}/internships`, {
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
          error: data.error || 'Failed to create internship'
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      data: data
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating internship:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
