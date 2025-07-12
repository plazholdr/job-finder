import { NextRequest, NextResponse } from 'next/server';
import { JobOffer } from '@/types/company';

// Mock job offers data (same as in the main route)
let mockOffers: JobOffer[] = [
  {
    id: 'offer-1',
    applicationId: 'app-1',
    jobId: 'job-1',
    jobTitle: 'Software Engineering Intern',
    candidate: {
      id: 'candidate-1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+1 (555) 123-4567'
    },
    salary: {
      amount: 25,
      currency: 'USD',
      period: 'hour'
    },
    startDate: new Date('2024-02-15'),
    endDate: new Date('2024-05-15'),
    benefits: [
      'Health Insurance',
      'Flexible Working Hours',
      'Learning & Development Budget',
      'Free Lunch'
    ],
    terms: 'This internship position is for a duration of 3 months with the possibility of extension based on performance. The intern will work 40 hours per week and report to the Engineering Manager. All company policies and procedures apply.',
    status: 'sent',
    expiresAt: new Date('2024-02-01'),
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-22'),
    sentAt: new Date('2024-01-22'),
    createdBy: {
      id: 'user-1',
      name: 'Mike Chen',
      title: 'Engineering Manager'
    },
    approvedBy: {
      id: 'user-2',
      name: 'Lisa Wang',
      title: 'HR Director'
    },
    notes: 'Excellent candidate with strong technical skills. Recommended by the entire interview panel.'
  }
];

// GET single offer by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const offerId = params.id;
    
    const offer = mockOffers.find(o => o.id === offerId);
    
    if (!offer) {
      return NextResponse.json(
        {
          success: false,
          error: 'Offer not found'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: offer
    });

  } catch (error) {
    console.error('Error fetching offer:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// UPDATE offer (full update)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const offerId = params.id;
    const updatedData = await request.json();

    const offerIndex = mockOffers.findIndex(o => o.id === offerId);
    
    if (offerIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Offer not found'
        },
        { status: 404 }
      );
    }

    const currentOffer = mockOffers[offerIndex];

    // Check if offer can be updated
    if (currentOffer.status === 'accepted' || currentOffer.status === 'declined') {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot update an offer that has been accepted or declined'
        },
        { status: 400 }
      );
    }

    // Validate required fields
    const requiredFields = ['jobTitle', 'salary', 'startDate', 'endDate', 'terms'];
    for (const field of requiredFields) {
      if (updatedData[field] === undefined) {
        return NextResponse.json(
          {
            success: false,
            error: `${field} is required`
          },
          { status: 400 }
        );
      }
    }

    // Update the offer
    mockOffers[offerIndex] = {
      ...currentOffer,
      ...updatedData,
      updatedAt: new Date()
    };

    return NextResponse.json({
      success: true,
      data: mockOffers[offerIndex],
      message: 'Offer updated successfully'
    });

  } catch (error) {
    console.error('Error updating offer:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// PATCH offer (partial update, e.g., status change)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const offerId = params.id;
    const updates = await request.json();

    const offerIndex = mockOffers.findIndex(o => o.id === offerId);
    
    if (offerIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Offer not found'
        },
        { status: 404 }
      );
    }

    const currentOffer = mockOffers[offerIndex];

    // Handle status transitions
    if (updates.status) {
      const validTransitions: Record<string, string[]> = {
        'draft': ['pending_approval', 'withdrawn'],
        'pending_approval': ['approved', 'draft', 'withdrawn'],
        'approved': ['sent', 'withdrawn'],
        'sent': ['accepted', 'declined', 'expired', 'withdrawn'],
        'accepted': [], // Final state
        'declined': [], // Final state
        'expired': ['withdrawn'],
        'withdrawn': []
      };

      if (!validTransitions[currentOffer.status]?.includes(updates.status)) {
        return NextResponse.json(
          {
            success: false,
            error: `Cannot transition from ${currentOffer.status} to ${updates.status}`
          },
          { status: 400 }
        );
      }

      // Set timestamps based on status
      if (updates.status === 'sent' && !currentOffer.sentAt) {
        updates.sentAt = new Date();
      }
      if (updates.status === 'accepted' && !currentOffer.acceptedAt) {
        updates.acceptedAt = new Date();
      }
      if (updates.status === 'declined' && !currentOffer.declinedAt) {
        updates.declinedAt = new Date();
      }
      if (updates.status === 'approved' && !currentOffer.approvedBy) {
        updates.approvedBy = {
          id: 'current-user',
          name: 'Current User',
          title: 'Manager'
        };
        updates.approvedAt = new Date();
      }
    }

    // Apply partial updates
    mockOffers[offerIndex] = {
      ...currentOffer,
      ...updates,
      updatedAt: new Date()
    };

    return NextResponse.json({
      success: true,
      data: mockOffers[offerIndex],
      message: 'Offer updated successfully'
    });

  } catch (error) {
    console.error('Error updating offer:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// DELETE offer
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const offerId = params.id;
    
    const offerIndex = mockOffers.findIndex(o => o.id === offerId);
    
    if (offerIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Offer not found'
        },
        { status: 404 }
      );
    }

    const offer = mockOffers[offerIndex];

    // Check if offer can be deleted
    if (offer.status === 'sent' || offer.status === 'accepted') {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot delete an offer that has been sent or accepted'
        },
        { status: 400 }
      );
    }

    // Remove the offer
    mockOffers.splice(offerIndex, 1);

    return NextResponse.json({
      success: true,
      message: 'Offer deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting offer:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
