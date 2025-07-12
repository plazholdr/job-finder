import { NextRequest, NextResponse } from 'next/server';

interface Invitation {
  id: string;
  companyId: string;
  candidateId: string;
  universityId: string;
  programId: string;
  position: string;
  message: string;
  status: 'sent' | 'viewed' | 'accepted' | 'declined' | 'expired';
  sentAt: Date;
  expiresAt: Date;
  viewedAt?: Date;
  respondedAt?: Date;
  internshipDetails: {
    startDate: Date;
    endDate: Date;
    duration: number;
    location: string;
    workType: 'remote' | 'on-site' | 'hybrid';
    stipend: number;
    currency: string;
  };
  requirements: string[];
  benefits: string[];
  contactPerson: {
    name: string;
    email: string;
    phone: string;
    title: string;
  };
}

// Mock storage for invitations
let mockInvitations: Invitation[] = [
  {
    id: 'inv-1',
    companyId: 'company-1',
    candidateId: 'candidate-1',
    universityId: 'univ-1',
    programId: 'prog-1',
    position: 'Software Engineering Intern',
    message: 'We are impressed with your profile and would like to invite you for an internship opportunity.',
    status: 'sent',
    sentAt: new Date('2024-01-15T10:00:00Z'),
    expiresAt: new Date('2024-02-15T23:59:59Z'),
    internshipDetails: {
      startDate: new Date('2024-06-01'),
      endDate: new Date('2024-08-31'),
      duration: 3,
      location: 'San Francisco, CA',
      workType: 'hybrid',
      stipend: 6000,
      currency: 'USD'
    },
    requirements: [
      'Strong programming skills in Python/JavaScript',
      'Experience with web development frameworks',
      'Good communication skills'
    ],
    benefits: [
      'Mentorship from senior engineers',
      'Access to cutting-edge technology',
      'Networking opportunities',
      'Potential for full-time offer'
    ],
    contactPerson: {
      name: 'Sarah Wilson',
      email: 'sarah.wilson@techcorp.com',
      phone: '+1 (555) 123-4567',
      title: 'HR Manager'
    }
  }
];

// POST - Send invitation to candidate
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      candidateId,
      universityId,
      programId,
      position,
      message,
      internshipDetails,
      requirements,
      benefits,
      contactPerson
    } = body;

    // Validate required fields
    if (!candidateId || !universityId || !programId || !position || !message || !internshipDetails) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields'
        },
        { status: 400 }
      );
    }

    // Create new invitation
    const newInvitation: Invitation = {
      id: `inv-${Date.now()}`,
      companyId: 'company-1', // In real app, get from authentication
      candidateId,
      universityId,
      programId,
      position,
      message,
      status: 'sent',
      sentAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      internshipDetails,
      requirements: requirements || [],
      benefits: benefits || [],
      contactPerson
    };

    // Add to mock storage
    mockInvitations.push(newInvitation);

    // In a real application, you would:
    // 1. Save to database
    // 2. Send email notification to candidate
    // 3. Create notification in the system
    // 4. Log the activity

    return NextResponse.json({
      success: true,
      data: newInvitation,
      message: 'Invitation sent successfully'
    });

  } catch (error) {
    console.error('Error sending invitation:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to send invitation'
      },
      { status: 500 }
    );
  }
}

// GET - Get company's sent invitations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const candidateId = searchParams.get('candidateId');
    const universityId = searchParams.get('universityId');
    const programId = searchParams.get('programId');

    // In real app, get companyId from authentication
    const companyId = 'company-1';

    let filteredInvitations = mockInvitations.filter(
      invitation => invitation.companyId === companyId
    );

    // Apply filters
    if (status && status !== 'all') {
      filteredInvitations = filteredInvitations.filter(
        invitation => invitation.status === status
      );
    }

    if (candidateId) {
      filteredInvitations = filteredInvitations.filter(
        invitation => invitation.candidateId === candidateId
      );
    }

    if (universityId) {
      filteredInvitations = filteredInvitations.filter(
        invitation => invitation.universityId === universityId
      );
    }

    if (programId) {
      filteredInvitations = filteredInvitations.filter(
        invitation => invitation.programId === programId
      );
    }

    // Sort by sent date (most recent first)
    filteredInvitations.sort((a, b) => 
      new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
    );

    return NextResponse.json({
      success: true,
      data: filteredInvitations,
      total: filteredInvitations.length
    });

  } catch (error) {
    console.error('Error fetching invitations:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch invitations'
      },
      { status: 500 }
    );
  }
}

// PUT - Update invitation status (for bulk operations)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { invitationIds, status } = body;

    if (!invitationIds || !Array.isArray(invitationIds) || !status) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data'
        },
        { status: 400 }
      );
    }

    // Update invitations
    const updatedInvitations = mockInvitations.map(invitation => {
      if (invitationIds.includes(invitation.id)) {
        return {
          ...invitation,
          status,
          ...(status === 'viewed' && !invitation.viewedAt && { viewedAt: new Date() }),
          ...((['accepted', 'declined'].includes(status)) && !invitation.respondedAt && { respondedAt: new Date() })
        };
      }
      return invitation;
    });

    // Update mock storage
    mockInvitations = updatedInvitations;

    return NextResponse.json({
      success: true,
      message: `${invitationIds.length} invitation(s) updated successfully`
    });

  } catch (error) {
    console.error('Error updating invitations:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update invitations'
      },
      { status: 500 }
    );
  }
}
