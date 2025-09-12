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

    const applicationId = params.id;
    console.log('Downloading offer letter for application:', applicationId);

    const response = await fetch(`${API_BASE_URL}/applications/${applicationId}/offer-letter/download`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || errorData.error || 'Failed to download offer letter' },
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
        'Content-Disposition': `attachment; filename="offer-letter-${applicationId}.pdf"`,
      },
    });

  } catch (error) {
    console.error('Offer letter download error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
