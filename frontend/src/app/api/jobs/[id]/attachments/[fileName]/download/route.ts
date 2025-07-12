import { NextRequest, NextResponse } from 'next/server';
import config from '@/config';

const API_BASE_URL = config.api.baseUrl;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; fileName: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 });
    }

    const { id, fileName } = await params;
    const decodedFileName = decodeURIComponent(fileName);
    console.log('Download request - fileName:', fileName, 'decoded:', decodedFileName);

    const response = await fetch(`${API_BASE_URL}/jobs/${id}/attachments/${decodedFileName}/download`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Backend download error:', data);
      return NextResponse.json(
        { error: data.error || 'Failed to get download URL' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Download URL generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
