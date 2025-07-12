import { NextRequest, NextResponse } from 'next/server';

interface NotificationTemplate {
  id: string;
  name: string;
  trigger: string;
  type: 'email' | 'sms' | 'in_app';
  subject: string;
  content: string;
  isActive: boolean;
  variables: string[];
  lastUsed?: Date;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Mock notification templates data
let mockTemplates: NotificationTemplate[] = [
  {
    id: 'template-1',
    name: 'Application Received Confirmation',
    trigger: 'application_submitted',
    type: 'email',
    subject: 'Application Received - {{job_title}} at {{company_name}}',
    content: `Dear {{candidate_name}},

Thank you for your application for the {{job_title}} position at {{company_name}}.

We have received your application submitted on {{application_date}} and our team will review it carefully. We will contact you within 5-7 business days regarding the next steps.

If you have any questions, please don't hesitate to reach out to us.

Best regards,
{{company_name}} Hiring Team`,
    isActive: true,
    variables: ['{{candidate_name}}', '{{job_title}}', '{{company_name}}', '{{application_date}}'],
    lastUsed: new Date('2024-01-22T10:30:00Z'),
    usageCount: 45,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-15T12:00:00Z')
  },
  {
    id: 'template-2',
    name: 'Application Accepted Notification',
    trigger: 'application_accepted',
    type: 'email',
    subject: 'Great News! Your Application Has Been Accepted - {{job_title}}',
    content: `Dear {{candidate_name}},

Congratulations! We are pleased to inform you that your application for the {{job_title}} position at {{company_name}} has been accepted for the next stage of our hiring process.

Our team was impressed with your qualifications and experience. We would like to schedule an interview with you to discuss this opportunity further.

We will contact you within the next 2-3 business days to coordinate interview scheduling.

Thank you for your interest in joining our team!

Best regards,
{{company_name}} Hiring Team`,
    isActive: true,
    variables: ['{{candidate_name}}', '{{job_title}}', '{{company_name}}'],
    lastUsed: new Date('2024-01-21T14:20:00Z'),
    usageCount: 23,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-10T09:00:00Z')
  },
  {
    id: 'template-3',
    name: 'Interview Scheduled Notification',
    trigger: 'interview_scheduled',
    type: 'email',
    subject: 'Interview Scheduled - {{job_title}} at {{company_name}}',
    content: `Dear {{candidate_name}},

We are excited to invite you for an interview for the {{job_title}} position at {{company_name}}.

Interview Details:
- Date: {{interview_date}}
- Time: {{interview_time}}
- Duration: Approximately 1 hour
- Format: Video call (link will be provided separately)

Please confirm your availability by replying to this email. If you need to reschedule, please let us know as soon as possible.

We look forward to speaking with you!

Best regards,
{{company_name}} Hiring Team`,
    isActive: true,
    variables: ['{{candidate_name}}', '{{job_title}}', '{{company_name}}', '{{interview_date}}', '{{interview_time}}'],
    lastUsed: new Date('2024-01-20T16:45:00Z'),
    usageCount: 18,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-12T14:30:00Z')
  },
  {
    id: 'template-4',
    name: 'Job Offer Extended',
    trigger: 'offer_extended',
    type: 'email',
    subject: 'Job Offer - {{job_title}} at {{company_name}}',
    content: `Dear {{candidate_name}},

We are delighted to extend an offer for the {{job_title}} position at {{company_name}}.

After careful consideration of your qualifications and our interview discussions, we believe you would be an excellent addition to our team.

Offer Details:
- Position: {{job_title}}
- Salary: {{offer_amount}}
- Start Date: As discussed
- Benefits: Comprehensive package as outlined in attached document

Please review the attached offer letter for complete details. We would appreciate your response within 7 business days.

If you have any questions about the offer, please don't hesitate to contact us.

We look forward to welcoming you to the team!

Best regards,
{{company_name}} Hiring Team`,
    isActive: true,
    variables: ['{{candidate_name}}', '{{job_title}}', '{{company_name}}', '{{offer_amount}}'],
    lastUsed: new Date('2024-01-19T11:15:00Z'),
    usageCount: 8,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-08T16:20:00Z')
  },
  {
    id: 'template-5',
    name: 'Application Rejected - Thank You',
    trigger: 'application_rejected',
    type: 'email',
    subject: 'Update on Your Application - {{job_title}} at {{company_name}}',
    content: `Dear {{candidate_name}},

Thank you for your interest in the {{job_title}} position at {{company_name}} and for taking the time to apply.

After careful consideration, we have decided to move forward with other candidates whose experience more closely matches our current needs for this specific role.

We were impressed with your background and encourage you to apply for future opportunities that may be a better fit. We will keep your information on file and reach out if a suitable position becomes available.

Thank you again for considering {{company_name}} as a potential employer. We wish you the best of luck in your job search.

Best regards,
{{company_name}} Hiring Team`,
    isActive: true,
    variables: ['{{candidate_name}}', '{{job_title}}', '{{company_name}}'],
    lastUsed: new Date('2024-01-18T09:30:00Z'),
    usageCount: 31,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-05T11:45:00Z')
  }
];

// GET notification templates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const trigger = searchParams.get('trigger');
    const type = searchParams.get('type');
    const isActive = searchParams.get('isActive');

    let filteredTemplates = [...mockTemplates];

    // Apply filters
    if (trigger && trigger !== 'all') {
      filteredTemplates = filteredTemplates.filter(template => template.trigger === trigger);
    }

    if (type && type !== 'all') {
      filteredTemplates = filteredTemplates.filter(template => template.type === type);
    }

    if (isActive !== null) {
      const activeFilter = isActive === 'true';
      filteredTemplates = filteredTemplates.filter(template => template.isActive === activeFilter);
    }

    // Sort by usage count (most used first)
    filteredTemplates.sort((a, b) => b.usageCount - a.usageCount);

    return NextResponse.json({
      success: true,
      data: filteredTemplates
    });

  } catch (error) {
    console.error('Error fetching notification templates:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// POST create new notification template
export async function POST(request: NextRequest) {
  try {
    const templateData = await request.json();

    // Validate required fields
    const requiredFields = ['name', 'trigger', 'type', 'subject', 'content'];
    for (const field of requiredFields) {
      if (!templateData[field]) {
        return NextResponse.json(
          {
            success: false,
            error: `${field} is required`
          },
          { status: 400 }
        );
      }
    }

    // Validate trigger and type values
    const validTriggers = [
      'application_submitted',
      'application_accepted', 
      'application_rejected',
      'interview_scheduled',
      'interview_completed',
      'offer_extended',
      'offer_accepted',
      'offer_declined'
    ];

    const validTypes = ['email', 'sms', 'in_app'];

    if (!validTriggers.includes(templateData.trigger)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid trigger value'
        },
        { status: 400 }
      );
    }

    if (!validTypes.includes(templateData.type)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid type value'
        },
        { status: 400 }
      );
    }

    // Create new template
    const newTemplate: NotificationTemplate = {
      id: `template-${Date.now()}`,
      name: templateData.name,
      trigger: templateData.trigger,
      type: templateData.type,
      subject: templateData.subject,
      content: templateData.content,
      isActive: templateData.isActive ?? true,
      variables: templateData.variables || [],
      usageCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockTemplates.push(newTemplate);

    return NextResponse.json({
      success: true,
      data: newTemplate,
      message: 'Notification template created successfully'
    });

  } catch (error) {
    console.error('Error creating notification template:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
