import { NextRequest, NextResponse } from 'next/server';

interface CompanyVerification {
  id: string;
  companyId: string;
  companyName: string;
  submittedAt: Date;
  status: 'pending' | 'document_review' | 'compliance_check' | 'admin_review' | 'approved' | 'rejected';
  
  // Document Verification
  documents: {
    businessLicense: {
      status: 'pending' | 'verified' | 'rejected';
      fileUrl?: string;
      fileName?: string;
      verifiedAt?: Date;
      verifiedBy?: string;
      rejectionReason?: string;
    };
    taxDocument: {
      status: 'pending' | 'verified' | 'rejected';
      fileUrl?: string;
      fileName?: string;
      verifiedAt?: Date;
      verifiedBy?: string;
      rejectionReason?: string;
    };
    incorporationCertificate: {
      status: 'pending' | 'verified' | 'rejected';
      fileUrl?: string;
      fileName?: string;
      verifiedAt?: Date;
      verifiedBy?: string;
      rejectionReason?: string;
    };
    proofOfAddress: {
      status: 'pending' | 'verified' | 'rejected';
      fileUrl?: string;
      fileName?: string;
      verifiedAt?: Date;
      verifiedBy?: string;
      rejectionReason?: string;
    };
  };

  // Compliance Checks
  complianceChecks: {
    businessRegistrationValid: boolean;
    taxIdValid: boolean;
    industryCompliant: boolean;
    addressVerified: boolean;
    legalRequirementsMet: boolean;
    checkedAt?: Date;
    checkedBy?: string;
    notes?: string;
  };

  // Admin Review
  adminReview: {
    status: 'pending' | 'approved' | 'rejected';
    reviewedAt?: Date;
    reviewedBy?: string;
    decision?: 'approve' | 'reject' | 'request_more_info';
    notes?: string;
    rejectionReason?: string;
  };

  // Timeline
  timeline: Array<{
    id: string;
    timestamp: Date;
    action: string;
    description: string;
    performedBy: string;
    status: string;
  }>;

  updatedAt: Date;
}

// Mock verification data
let mockVerifications: CompanyVerification[] = [
  {
    id: 'verification-1',
    companyId: 'company-1',
    companyName: 'TechCorp Solutions',
    submittedAt: new Date('2024-01-20T10:00:00Z'),
    status: 'admin_review',
    documents: {
      businessLicense: {
        status: 'verified',
        fileUrl: '/documents/business-license-1.pdf',
        fileName: 'business_license.pdf',
        verifiedAt: new Date('2024-01-21T14:30:00Z'),
        verifiedBy: 'Admin User'
      },
      taxDocument: {
        status: 'verified',
        fileUrl: '/documents/tax-doc-1.pdf',
        fileName: 'tax_document.pdf',
        verifiedAt: new Date('2024-01-21T15:00:00Z'),
        verifiedBy: 'Admin User'
      },
      incorporationCertificate: {
        status: 'verified',
        fileUrl: '/documents/incorporation-1.pdf',
        fileName: 'incorporation_certificate.pdf',
        verifiedAt: new Date('2024-01-21T15:30:00Z'),
        verifiedBy: 'Admin User'
      },
      proofOfAddress: {
        status: 'verified',
        fileUrl: '/documents/address-proof-1.pdf',
        fileName: 'proof_of_address.pdf',
        verifiedAt: new Date('2024-01-21T16:00:00Z'),
        verifiedBy: 'Admin User'
      }
    },
    complianceChecks: {
      businessRegistrationValid: true,
      taxIdValid: true,
      industryCompliant: true,
      addressVerified: true,
      legalRequirementsMet: true,
      checkedAt: new Date('2024-01-22T10:00:00Z'),
      checkedBy: 'Compliance Officer',
      notes: 'All compliance requirements met'
    },
    adminReview: {
      status: 'pending',
      notes: 'Awaiting final admin approval'
    },
    timeline: [
      {
        id: 'timeline-1',
        timestamp: new Date('2024-01-20T10:00:00Z'),
        action: 'verification_submitted',
        description: 'Company verification submitted',
        performedBy: 'System',
        status: 'pending'
      },
      {
        id: 'timeline-2',
        timestamp: new Date('2024-01-21T14:30:00Z'),
        action: 'documents_verified',
        description: 'All documents verified successfully',
        performedBy: 'Admin User',
        status: 'document_review'
      },
      {
        id: 'timeline-3',
        timestamp: new Date('2024-01-22T10:00:00Z'),
        action: 'compliance_checked',
        description: 'Compliance checks completed',
        performedBy: 'Compliance Officer',
        status: 'compliance_check'
      }
    ],
    updatedAt: new Date('2024-01-22T10:00:00Z')
  }
];

// GET company verifications
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const status = searchParams.get('status');

    let filteredVerifications = [...mockVerifications];

    // Filter by company ID
    if (companyId) {
      filteredVerifications = filteredVerifications.filter(v => v.companyId === companyId);
    }

    // Filter by status
    if (status && status !== 'all') {
      filteredVerifications = filteredVerifications.filter(v => v.status === status);
    }

    // Sort by submission date (newest first)
    filteredVerifications.sort((a, b) => 
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );

    return NextResponse.json({
      success: true,
      data: filteredVerifications
    });

  } catch (error) {
    console.error('Error fetching company verifications:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// POST create new verification
export async function POST(request: NextRequest) {
  try {
    const verificationData = await request.json();

    // Validate required fields
    const requiredFields = ['companyId', 'companyName'];
    for (const field of requiredFields) {
      if (!verificationData[field]) {
        return NextResponse.json(
          {
            success: false,
            error: `${field} is required`
          },
          { status: 400 }
        );
      }
    }

    // Create new verification
    const newVerification: CompanyVerification = {
      id: `verification-${Date.now()}`,
      companyId: verificationData.companyId,
      companyName: verificationData.companyName,
      submittedAt: new Date(),
      status: 'pending',
      documents: {
        businessLicense: { status: 'pending' },
        taxDocument: { status: 'pending' },
        incorporationCertificate: { status: 'pending' },
        proofOfAddress: { status: 'pending' }
      },
      complianceChecks: {
        businessRegistrationValid: false,
        taxIdValid: false,
        industryCompliant: false,
        addressVerified: false,
        legalRequirementsMet: false
      },
      adminReview: {
        status: 'pending'
      },
      timeline: [
        {
          id: `timeline-${Date.now()}`,
          timestamp: new Date(),
          action: 'verification_submitted',
          description: 'Company verification process initiated',
          performedBy: 'System',
          status: 'pending'
        }
      ],
      updatedAt: new Date()
    };

    mockVerifications.push(newVerification);

    return NextResponse.json({
      success: true,
      data: newVerification,
      message: 'Company verification process initiated'
    });

  } catch (error) {
    console.error('Error creating company verification:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
