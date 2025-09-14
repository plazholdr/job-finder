import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import config from '@/config';
import { CompanyProfile } from '@/types/company';

// Helper to get bearer token from header or cookie
async function getAuthHeader(request: NextRequest) {
  console.log('=== HEADER DEBUG ===');
  console.log('All headers:', Object.fromEntries(request.headers.entries()));

  const header = request.headers.get('authorization') || request.headers.get('Authorization');
  console.log('Authorization header from request:', header);

  if (header) return header;

  const cookieStore = await cookies();
  const token =
    cookieStore.get('authToken')?.value ||
    cookieStore.get('token')?.value ||
    cookieStore.get('companyToken')?.value; // fallback for company login
  console.log('Token from cookies:', token ? 'Present' : 'Missing');

  return token ? `Bearer ${token}` : null;
}

function resolveBackendUrl() {
  // For production, always use the configured API URL
  return config.api.baseUrl;
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = await getAuthHeader(request);
    console.log('=== DEBUG INFO ===');
    console.log('Auth header received:', authHeader ? 'Present' : 'Missing');
    console.log('Auth header value:', authHeader);

    if (!authHeader) {
      console.log('No auth header found, returning 401');
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const backendUrl = resolveBackendUrl();
    console.log('Backend URL:', backendUrl);
    console.log('Making request to:', `${backendUrl}/users/profile`);

    const resp = await fetch(`${backendUrl}/users/profile`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      cache: 'no-store',
    });

    const user = await resp.json();
    console.log('Backend response status:', resp.status);
    console.log('Backend response body:', user);
    console.log('=== END DEBUG INFO ===');

    if (!resp.ok) {
      return NextResponse.json({ success: false, error: user?.message || 'Failed to fetch profile' }, { status: resp.status });
    }

    const company = user?.company || {};
    const profile: CompanyProfile = {
      id: user?._id || company?.id || 'unknown',
      name: company?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Company',
      description: company?.description || user?.profile?.bio || '',
      industry: company?.industry || 'Technology',
      size: ['startup', 'small', 'medium', 'large', 'enterprise'].includes(company?.size) ? company.size : 'small',
      founded: Number(company?.founded) || new Date(user?.createdAt || Date.now()).getFullYear(),
      headquarters: company?.headquarters || user?.profile?.location || '',
      website: company?.website || user?.profile?.website || '',
      logo: company?.logo || user?.profile?.avatar,
      coverImage: company?.coverImage,
      email: user?.email || company?.email || '',
      phone: company?.phone || user?.profile?.phone || '',
      address: {
        street: company?.address?.street || '',
        city: company?.address?.city || '',
        state: company?.address?.state || '',
        country: company?.address?.country || '',
        zipCode: company?.address?.zipCode || '',
      },
      mission: company?.mission || '',
      vision: company?.vision || '',
      values: company?.values || [],
      culture: company?.culture || '',
      benefits: company?.benefits || [],
      primaryContact: {
        name: company?.primaryContact?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
        title: company?.primaryContact?.title || 'Company Admin',
        email: company?.primaryContact?.email || user?.email || '',
        phone: company?.primaryContact?.phone || user?.profile?.phone || '',
      },
      socialMedia: company?.socialMedia,
      isVerified: Boolean(company?.isVerified),
      status: company?.status || 'active',
      createdAt: new Date(user?.createdAt || Date.now()),
      updatedAt: new Date(user?.updatedAt || Date.now()),
    };

    return NextResponse.json({ success: true, data: profile });
  } catch (error) {
    console.error('Error fetching company profile:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = await getAuthHeader(request);
    if (!authHeader) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body: Partial<CompanyProfile> = await request.json();

    const updatePayload: any = {
      company: {
        name: body.name,
        description: body.description,
        industry: body.industry,
        size: body.size,
        founded: body.founded,
        headquarters: body.headquarters,
        website: body.website,
        logo: body.logo,
        phone: body.phone,
        address: body.address,
        mission: body.mission,
        vision: body.vision,
        values: body.values,
        culture: body.culture,
        benefits: body.benefits,
        socialMedia: body.socialMedia,
        primaryContact: body.primaryContact,
      },
      profile: {
        phone: body.phone,
        website: body.website,
        location: body.headquarters,
      }
    };

    const backendUrl = resolveBackendUrl();
    const resp = await fetch(`${backendUrl}/users/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify(updatePayload),
    });

    const updatedUser = await resp.json();
    if (!resp.ok) {
      return NextResponse.json({ success: false, error: updatedUser?.message || 'Failed to update profile' }, { status: resp.status });
    }

    const company = updatedUser?.company || {};
    const normalized: CompanyProfile = {
      id: updatedUser?._id || company?.id || 'unknown',
      name: company?.name || `${updatedUser?.firstName || ''} ${updatedUser?.lastName || ''}`.trim() || 'Company',
      description: company?.description || updatedUser?.profile?.bio || '',
      industry: company?.industry || 'Technology',
      size: ['startup', 'small', 'medium', 'large', 'enterprise'].includes(company?.size) ? company.size : 'small',
      founded: Number(company?.founded) || new Date(updatedUser?.createdAt || Date.now()).getFullYear(),
      headquarters: company?.headquarters || updatedUser?.profile?.location || '',
      website: company?.website || updatedUser?.profile?.website || '',
      logo: company?.logo || updatedUser?.profile?.avatar,
      coverImage: company?.coverImage,
      email: updatedUser?.email || company?.email || '',
      phone: company?.phone || updatedUser?.profile?.phone || '',
      address: {
        street: company?.address?.street || '',
        city: company?.address?.city || '',
        state: company?.address?.state || '',
        country: company?.address?.country || '',
        zipCode: company?.address?.zipCode || '',
      },
      mission: company?.mission || '',
      vision: company?.vision || '',
      values: company?.values || [],
      culture: company?.culture || '',
      benefits: company?.benefits || [],
      primaryContact: {
        name: company?.primaryContact?.name || `${updatedUser?.firstName || ''} ${updatedUser?.lastName || ''}`.trim(),
        title: company?.primaryContact?.title || 'Company Admin',
        email: company?.primaryContact?.email || updatedUser?.email || '',
        phone: company?.primaryContact?.phone || updatedUser?.profile?.phone || '',
      },
      socialMedia: company?.socialMedia,
      isVerified: Boolean(company?.isVerified),
      status: company?.status || 'active',
      createdAt: new Date(updatedUser?.createdAt || Date.now()),
      updatedAt: new Date(updatedUser?.updatedAt || Date.now()),
    };

    return NextResponse.json({ success: true, data: normalized, message: 'Company profile updated successfully' });
  } catch (error) {
    console.error('Error updating company profile:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

