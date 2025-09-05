import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Helper function to get auth token from cookies
async function getAuthToken() {
  const cookieStore = await cookies();
  return cookieStore.get('token')?.value;
}

// Helper function to make authenticated requests to backend
async function makeBackendRequest(endpoint: string, options: RequestInit = {}) {
  const token = await getAuthToken();

  const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:3030'}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const companyId = params.id;
    const { searchParams } = new URL(request.url);

    // Build query parameters for backend
    const queryParams = new URLSearchParams();
    queryParams.append('companyId', companyId);
    queryParams.append('$sort', JSON.stringify({ createdAt: -1 }));

    // Add any additional filters from search params
    const limit = searchParams.get('limit') || '50';
    const skip = searchParams.get('skip') || '0';
    queryParams.append('$limit', limit);
    queryParams.append('$skip', skip);

    // Call backend API to get jobs for specific company
    const backendResponse = await makeBackendRequest(`/jobs?${queryParams.toString()}`);

    return NextResponse.json({
      success: true,
      data: backendResponse.data || [],
      total: backendResponse.total || 0,
      message: 'Company jobs fetched successfully'
    });
  } catch (error) {
    console.error('Error fetching company jobs:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch company jobs'
      },
      { status: 500 }
    );
  }
}
