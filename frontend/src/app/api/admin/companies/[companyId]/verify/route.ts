import { NextRequest, NextResponse } from 'next/server';
import config from '@/config';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ companyId: string }> }
) {
  try {
    const { companyId } = await context.params;
    const { status, notes } = await request.json();

    // Validate required fields
    if (!status) {
      return NextResponse.json(
        {
          success: false,
          error: 'Status is required'
        },
        { status: 400 }
      );
    }

    // Validate status values
  if (!['verified', 'rejected', 'pending', 'suspended', 'approved'].includes(status)) {
      return NextResponse.json(
        {
          success: false,
      error: 'Invalid status. Must be "verified", "rejected", "pending", or "suspended"'
        },
        { status: 400 }
      );
    }

    // Forward to backend API
    const auth = request.headers.get('authorization') || '';
    const res = await fetch(`${config.api.baseUrl}/admin/companies/${companyId}/verify`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(auth ? { Authorization: auth } : {}),
      },
      body: JSON.stringify({ status, notes }),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Error updating company verification:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update company verification status'
      },
      { status: 500 }
    );
  }
}
