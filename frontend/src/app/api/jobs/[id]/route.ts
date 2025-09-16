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
    const jobId = params.id;

    // 1) Get job details from backend
    const jobData = await makeBackendRequest(`/jobs/${jobId}`);

    // 2) If there is a companyId, fetch company to enrich with name/logo
    const rawCompanyId = jobData?.companyId || jobData?.company?._id || jobData?.company?.id;
    const companyId = rawCompanyId ? String(rawCompanyId) : '';

    let companyName: string | undefined;
    let companyLogo: string | undefined;

    if (companyId) {
      try {
        // Fetch directly from backend WITHOUT auth header so it works for all viewers
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:3030';
        const resp = await fetch(`${backendUrl}/companies/${companyId}`, {
          headers: { 'Content-Type': 'application/json' },
        });
        if (resp.ok) {
          const company = await resp.json();
          // Extract reasonable fields across possible shapes
          const candidateName =
            company?.company?.name ||
            (company?.firstName || company?.lastName ? `${company?.firstName ?? ''} ${company?.lastName ?? ''}`.trim() : '') ||
            company?.name;
          const candidateLogo =
            company?.company?.logo || company?.company?.logoKey || company?.logo;

          companyName = candidateName || undefined;
          companyLogo = candidateLogo || undefined;
        }
      } catch (e) {
        // ignore enrichment errors
      }
    }

    const enriched = {
      ...jobData,
      ...(companyId && { companyId }),
      ...(companyName && { companyName }),
      ...(companyLogo && { companyLogo }),
      ...(companyId || companyName || companyLogo
        ? { company: { id: companyId, name: companyName || '', logo: companyLogo || '' } }
        : {}),
    };

    return NextResponse.json({
      success: true,
      data: enriched,
      message: 'Job details fetched successfully'
    });
  } catch (error) {
    console.error('Error fetching job details:', error);

    if ((error as any)?.message?.includes('404') || (error as any)?.message?.includes('not found')) {
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
