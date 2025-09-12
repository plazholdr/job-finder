import { NextRequest, NextResponse } from 'next/server';
import config from '@/config';

const API_BASE_URL = config.api.baseUrl;

// GET single request
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get auth header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Authorization header required' },
        { status: 401 }
      );
    }

    // Call backend API to get request
    console.log('Fetching request with ID:', params.id);

    const response = await fetch(`${API_BASE_URL}/requests/${params.id}`, {
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
          error: data.error || 'Failed to fetch request'
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      data: data.data
    });

  } catch (error) {
    console.error('Request fetch error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// PATCH update request
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Call backend API to update request
    console.log('Updating request:', params.id, 'with data:', requestData);

    const response = await fetch(`${API_BASE_URL}/requests/${params.id}`, {
      method: 'PATCH',
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
          error: data.error || 'Failed to update request'
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      data: data.data,
      message: data.message || 'Request updated successfully'
    });

  } catch (error) {
    console.error('Request update error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// DELETE request
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get auth header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Authorization header required' },
        { status: 401 }
      );
    }

    // Call backend API to delete request
    console.log('Deleting request:', params.id);

    const response = await fetch(`${API_BASE_URL}/requests/${params.id}`, {
      method: 'DELETE',
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
          error: data.error || 'Failed to delete request'
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: data.message || 'Request deleted successfully'
    });

  } catch (error) {
    console.error('Request delete error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
