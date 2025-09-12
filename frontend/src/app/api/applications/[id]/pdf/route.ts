import { NextRequest, NextResponse } from 'next/server';
import { ApplicationPDFGenerator, ApplicationPDFData } from '@/utils/pdfGenerator';

// Mock applications data (should match the main applications route)
let applications: any[] = [
  {
    id: 'app-1',
    userId: 'mock-user-id',
    jobId: '1',
    personalInformation: 'John Doe, Computer Science student at University of Technology',
    internshipDetails: 'Seeking 3-month summer internship in software development',
    courseInformation: 'Currently in 3rd year of Computer Science, GPA: 3.8/4.0',
    assignmentInformation: 'Completed web development projects using React and Node.js',
    status: 'interview_scheduled',
    submittedAt: new Date('2024-01-20T10:00:00Z'),
    createdAt: new Date('2024-01-20T10:00:00Z'),
    updatedAt: new Date('2024-01-25T14:30:00Z'),
  }
];

// Mock jobs data for getting job details
const mockJobs = [
  {
    id: '1',
    title: 'Software Engineering Intern',
    company: { name: 'TechCorp Solutions' }
  }
];

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const applicationId = params.id;
    
    // Find the application
    const application = applications.find(app => app.id === applicationId);
    
    if (!application) {
      return NextResponse.json(
        {
          success: false,
          error: 'Application not found'
        },
        { status: 404 }
      );
    }

    // Get job details
    const job = mockJobs.find(j => j.id === application.jobId);
    
    if (!job) {
      return NextResponse.json(
        {
          success: false,
          error: 'Job not found'
        },
        { status: 404 }
      );
    }

    // Prepare PDF data
    const pdfData: ApplicationPDFData = {
      applicationId: application.id,
      jobTitle: job.title,
      companyName: job.company.name,
      applicantName: 'John Doe', // In real app, get from user data
      applicantEmail: 'john.doe@email.com', // In real app, get from user data
      submittedAt: new Date(application.submittedAt),
      personalInformation: application.personalInformation,
      internshipDetails: application.internshipDetails,
      courseInformation: application.courseInformation,
      assignmentInformation: application.assignmentInformation,
      status: application.status
    };

    // Generate PDF
    const generator = new ApplicationPDFGenerator();
    const pdfBuffer = generator.generateApplicationPDF(pdfData);

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="application_${applicationId}.pdf"`,
        'Content-Length': pdfBuffer.byteLength.toString(),
      },
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate PDF'
      },
      { status: 500 }
    );
  }
}

// POST endpoint for generating PDF with custom data
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const applicationId = params.id;
    const customData = await request.json();
    
    // Find the application
    const application = applications.find(app => app.id === applicationId);
    
    if (!application) {
      return NextResponse.json(
        {
          success: false,
          error: 'Application not found'
        },
        { status: 404 }
      );
    }

    // Merge custom data with application data
    const pdfData: ApplicationPDFData = {
      applicationId: application.id,
      jobTitle: customData.jobTitle || 'Unknown Position',
      companyName: customData.companyName || 'Unknown Company',
      applicantName: customData.applicantName || 'Unknown Applicant',
      applicantEmail: customData.applicantEmail || 'unknown@email.com',
      submittedAt: new Date(application.submittedAt),
      personalInformation: application.personalInformation,
      internshipDetails: application.internshipDetails,
      courseInformation: application.courseInformation,
      assignmentInformation: application.assignmentInformation,
      status: application.status,
      ...customData
    };

    // Generate PDF
    const generator = new ApplicationPDFGenerator();
    const pdfBuffer = generator.generateApplicationPDF(pdfData);

    // Return PDF as base64 for client-side handling
    const base64PDF = Buffer.from(pdfBuffer).toString('base64');

    return NextResponse.json({
      success: true,
      data: {
        pdf: base64PDF,
        filename: `application_${applicationId}.pdf`,
        contentType: 'application/pdf'
      },
      message: 'PDF generated successfully'
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate PDF'
      },
      { status: 500 }
    );
  }
}
