import { NextRequest, NextResponse } from 'next/server';
import config from '@/config';

const API_BASE_URL = config.api.baseUrl;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 });
    }

    const internshipId = params.id;
    console.log('Downloading onboarding materials for internship:', internshipId);

    const response = await fetch(`${API_BASE_URL}/internships/${internshipId}/onboarding-materials/download`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || errorData.error || 'Failed to download onboarding materials' },
        { status: response.status }
      );
    }

    // Get the file blob from backend
    const blob = await response.blob();
    
    // Return the file with appropriate headers
    return new NextResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="onboarding-materials-${internshipId}.pdf"`,
      },
    });

  } catch (error) {
    console.error('Onboarding materials download error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
