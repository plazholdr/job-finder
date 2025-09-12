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

    // Call backend API to get company details
    const company = await makeBackendRequest(`/companies/${companyId}`);

    // Transform backend data to match frontend expectations
    const transformedCompany = {
      id: company._id,
      name: company.company?.name || `${company.firstName} ${company.lastName}`,
      description: company.company?.description || 'Company description not available',
      nature: company.company?.industry || 'Technology',
      logo: company.company?.logo || '/api/placeholder/64/64',
      email: company.email,
      address: company.company?.headquarters || 'Address not available',
      phoneNumber: company.company?.phone || 'Phone not available',
      website: company.company?.website || '',
      briefDescription: company.company?.description || 'Company description not available',
      industry: company.company?.industry || 'Technology',
      size: company.company?.size || 'Unknown',
      founded: company.company?.founded || 'Unknown',
      headquarters: company.company?.headquarters || 'Address not available',
      mission: 'Company mission not available',
      values: [],
      benefits: [],
      culture: 'Company culture information not available',
      rating: 4.0,
      reviewCount: 0,
      activeJobsCount: company.activeJobsCount || 0,
      activeJobs: company.activeJobs || [],
      createdAt: company.createdAt,
      updatedAt: company.updatedAt
    };

    return NextResponse.json({
      success: true,
      data: transformedCompany,
      message: 'Company details fetched successfully'
    });
  } catch (error) {
    console.error('Error fetching company details:', error);

    if (error.message.includes('404') || error.message.includes('not found')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Company not found'
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch company details'
      },
      { status: 500 }
    );
  }
}
