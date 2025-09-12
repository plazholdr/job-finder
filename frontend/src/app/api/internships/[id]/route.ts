import { NextRequest, NextResponse } from 'next/server';
import config from '@/config';

const API_BASE_URL = config.api.baseUrl;

// GET single internship by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const internshipId = params.id;

    // Get auth header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Authorization header required' },
        { status: 401 }
      );
    }

    // Call backend API to get specific internship
    console.log('Fetching internship ID:', internshipId);
    console.log('API URL:', `${API_BASE_URL}/internships/${internshipId}`);

    const response = await fetch(`${API_BASE_URL}/internships/${internshipId}`, {
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
      if (response.status === 404) {
        return NextResponse.json(
          {
            success: false,
            error: 'Internship not found'
          },
          { status: 404 }
        );
      }
      return NextResponse.json(
        {
          success: false,
          error: data.error || 'Failed to fetch internship'
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('Error fetching internship:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// PATCH update internship
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const internshipId = params.id;
    const requestData = await request.json();

    // Get auth header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Authorization header required' },
        { status: 401 }
      );
    }

    // Call backend API to update internship
    console.log('Updating internship ID:', internshipId);
    console.log('Update data:', requestData);

    const response = await fetch(`${API_BASE_URL}/internships/${internshipId}`, {
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
      if (response.status === 404) {
        return NextResponse.json(
          {
            success: false,
            error: 'Internship not found'
          },
          { status: 404 }
        );
      }
      return NextResponse.json(
        {
          success: false,
          error: data.error || 'Failed to update internship'
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('Error updating internship:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// DELETE internship
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const internshipId = params.id;

    // Get auth header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Authorization header required' },
        { status: 401 }
      );
    }

    // Call backend API to delete internship
    console.log('Deleting internship ID:', internshipId);

    const response = await fetch(`${API_BASE_URL}/internships/${internshipId}`, {
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
      if (response.status === 404) {
        return NextResponse.json(
          {
            success: false,
            error: 'Internship not found'
          },
          { status: 404 }
        );
      }
      return NextResponse.json(
        {
          success: false,
          error: data.error || 'Failed to delete internship'
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Internship deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting internship:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
