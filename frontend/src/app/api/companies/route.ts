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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Build query parameters for backend
    const queryParams = new URLSearchParams();

    // Pass through search parameters
    const search = searchParams.get('search');
    const industry = searchParams.get('nature'); // Map 'nature' to 'industry'
    const size = searchParams.get('size');
    const limit = searchParams.get('limit') || '50';
    const skip = searchParams.get('skip') || '0';

    if (search) queryParams.append('search', search);
    if (industry) queryParams.append('industry', industry);
    if (size) queryParams.append('size', size);
    queryParams.append('$limit', limit);
    queryParams.append('$skip', skip);

    // Call backend API to get companies
    const backendResponse = await makeBackendRequest(`/companies?${queryParams.toString()}`);

    // Transform backend data to match frontend expectations
    const transformedCompanies = (backendResponse.data || []).map((company: any) => ({
      id: company._id,
      name: company.company?.name || `${company.firstName} ${company.lastName}`,
      description: company.company?.description || 'Company description not available',
      nature: company.company?.industry || 'Technology',
      logo: company.company?.logo || '/api/placeholder/64/64',
      email: company.email,
      address: company.company?.headquarters || 'Address not available',
      phoneNumber: company.company?.phone || 'Phone not available',
      website: company.company?.website || '',
      activeJobsCount: company.activeJobsCount || 0,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt
    }));

    return NextResponse.json({
      success: true,
      data: transformedCompanies,
      total: backendResponse.total || 0,
      message: 'Companies fetched successfully'
    });

  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch companies'
      },
      { status: 500 }
    );
  }
}
