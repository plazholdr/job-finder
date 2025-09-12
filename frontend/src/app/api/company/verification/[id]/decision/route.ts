import { NextRequest, NextResponse } from 'next/server';

interface VerificationDecision {
  decision: 'approve' | 'reject' | 'request_more_info';
  stage: 'document_review' | 'compliance_check' | 'admin_review';
  notes?: string;
  rejectionReason?: string;
  documentsToReject?: string[];
  complianceIssues?: string[];
}

// Mock verification data (same as in route.ts)
let mockVerifications = [
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

// POST verification decision
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const verificationId = params.id;
    const decisionData: VerificationDecision = await request.json();

    // Validate required fields
    if (!decisionData.decision || !decisionData.stage) {
      return NextResponse.json(
        {
          success: false,
          error: 'Decision and stage are required'
        },
        { status: 400 }
      );
    }

    // Find verification
    const verificationIndex = mockVerifications.findIndex(v => v.id === verificationId);
    if (verificationIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Verification not found'
        },
        { status: 404 }
      );
    }

    const verification = mockVerifications[verificationIndex];
    const currentTime = new Date();
    const reviewerName = 'Current User'; // In real app, get from auth

    // Process decision based on stage
    switch (decisionData.stage) {
      case 'document_review':
        if (decisionData.decision === 'approve') {
          // Mark all documents as verified
          Object.keys(verification.documents).forEach(docKey => {
            verification.documents[docKey as keyof typeof verification.documents].status = 'verified';
            verification.documents[docKey as keyof typeof verification.documents].verifiedAt = currentTime;
            verification.documents[docKey as keyof typeof verification.documents].verifiedBy = reviewerName;
          });
          verification.status = 'compliance_check';
        } else if (decisionData.decision === 'reject') {
          // Mark specified documents as rejected
          if (decisionData.documentsToReject) {
            decisionData.documentsToReject.forEach(docKey => {
              if (verification.documents[docKey as keyof typeof verification.documents]) {
                verification.documents[docKey as keyof typeof verification.documents].status = 'rejected';
                verification.documents[docKey as keyof typeof verification.documents].rejectionReason = decisionData.rejectionReason;
              }
            });
          }
          verification.status = 'rejected';
        }
        break;

      case 'compliance_check':
        if (decisionData.decision === 'approve') {
          verification.complianceChecks = {
            ...verification.complianceChecks,
            businessRegistrationValid: true,
            taxIdValid: true,
            industryCompliant: true,
            addressVerified: true,
            legalRequirementsMet: true,
            checkedAt: currentTime,
            checkedBy: reviewerName,
            notes: decisionData.notes || 'All compliance requirements met'
          };
          verification.status = 'admin_review';
        } else if (decisionData.decision === 'reject') {
          verification.complianceChecks = {
            ...verification.complianceChecks,
            checkedAt: currentTime,
            checkedBy: reviewerName,
            notes: decisionData.rejectionReason || 'Compliance requirements not met'
          };
          verification.status = 'rejected';
        }
        break;

      case 'admin_review':
        verification.adminReview = {
          status: decisionData.decision === 'approve' ? 'approved' : 'rejected',
          reviewedAt: currentTime,
          reviewedBy: reviewerName,
          decision: decisionData.decision,
          notes: decisionData.notes,
          rejectionReason: decisionData.decision === 'reject' ? decisionData.rejectionReason : undefined
        };
        
        if (decisionData.decision === 'approve') {
          verification.status = 'approved';
        } else if (decisionData.decision === 'reject') {
          verification.status = 'rejected';
        }
        break;
    }

    // Add timeline entry
    const timelineEntry = {
      id: `timeline-${Date.now()}`,
      timestamp: currentTime,
      action: `${decisionData.stage}_${decisionData.decision}`,
      description: getTimelineDescription(decisionData.stage, decisionData.decision),
      performedBy: reviewerName,
      status: verification.status
    };

    verification.timeline.push(timelineEntry);
    verification.updatedAt = currentTime;

    // Update verification
    mockVerifications[verificationIndex] = verification;

    // In a real application, you would:
    // 1. Send notification email to company
    // 2. Update company status in database
    // 3. Log the decision for audit purposes
    // 4. Trigger next workflow step if approved

    return NextResponse.json({
      success: true,
      data: verification,
      message: `Verification ${decisionData.decision} processed successfully`
    });

  } catch (error) {
    console.error('Error processing verification decision:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

function getTimelineDescription(stage: string, decision: string): string {
  const descriptions: Record<string, Record<string, string>> = {
    document_review: {
      approve: 'Documents verified and approved',
      reject: 'Documents rejected - resubmission required',
      request_more_info: 'Additional documentation requested'
    },
    compliance_check: {
      approve: 'Compliance checks passed',
      reject: 'Compliance requirements not met',
      request_more_info: 'Additional compliance information required'
    },
    admin_review: {
      approve: 'Company verification approved by admin',
      reject: 'Company verification rejected by admin',
      request_more_info: 'Admin requested additional information'
    }
  };

  return descriptions[stage]?.[decision] || `${stage} ${decision}`;
}

// GET verification details
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const verificationId = params.id;
    
    const verification = mockVerifications.find(v => v.id === verificationId);
    
    if (!verification) {
      return NextResponse.json(
        {
          success: false,
          error: 'Verification not found'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: verification
    });

  } catch (error) {
    console.error('Error fetching verification details:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
