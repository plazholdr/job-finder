import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Helper function to get auth token from cookies
async function getAuthToken() {
  const cookieStore = await cookies();
  return cookieStore.get('token')?.value;
}

// Helper function to make authenticated requests to backend
async function makeBackendRequest(endpoint: string, options: RequestInit = {}) {
  // Check if Authorization header is provided in options, otherwise use cookie token
  const authHeader = options.headers?.['Authorization'] as string;
  const token = authHeader || `Bearer ${await getAuthToken()}`;

  console.log('🔐 Making backend request:', { endpoint, hasAuth: !!token });

  const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:3030'}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': token }),
      ...options.headers,
    },
  });

  console.log('📡 Backend response status:', response.status);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    console.error('❌ Backend error:', errorData);
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// GET single job by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params;

    // Call backend API to get job details
    const job = await makeBackendRequest(`/jobs/${jobId}`, {
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
      },
    });

    return NextResponse.json({
      success: true,
      data: job
    });

  } catch (error) {
    console.error('Error fetching job:', error);

    if (error.message.includes('404') || error.message.includes('not found')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Job not found'
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch job details'
      },
      { status: 500 }
    );
  }
}

// UPDATE job (full update)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params;
    const updatedData = await request.json();

    // Call backend API to update job
    const updatedJob = await makeBackendRequest(`/jobs/${jobId}`, {
      method: 'PUT',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
      },
      body: JSON.stringify(updatedData),
    });

    return NextResponse.json({
      success: true,
      data: updatedJob,
      message: 'Job updated successfully'
    });

  } catch (error) {
    console.error('Error updating job:', error);

    if (error.message.includes('404') || error.message.includes('not found')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Job not found'
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to update job'
      },
      { status: 500 }
    );
  }
}

// PATCH job (partial update, e.g., status change)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params;
    const updates = await request.json();

    console.log('🔄 PATCH job request:', { jobId, updates });

    // Call backend API to partially update job
    const updatedJob = await makeBackendRequest(`/jobs/${jobId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
      },
      body: JSON.stringify(updates),
    });

    console.log('✅ Job updated successfully:', updatedJob);

    return NextResponse.json({
      success: true,
      data: updatedJob,
      message: 'Job updated successfully'
    });

  } catch (error) {
    console.error('❌ Error updating job:', error);

    if (error.message.includes('404') || error.message.includes('not found')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Job not found'
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to update job'
      },
      { status: 500 }
    );
  }
}

// DELETE job
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params;

    // Call backend API to delete job
    await makeBackendRequest(`/jobs/${jobId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Job deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting job:', error);

    if (error.message.includes('404') || error.message.includes('not found')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Job not found'
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to delete job'
      },
      { status: 500 }
    );
  }
}
