// Company-specific type definitions

export interface CompanyProfile {
  id: string;
  name: string;
  description: string;
  industry: string;
  size: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  founded: number;
  headquarters: string;
  website: string;
  logo?: string;
  coverImage?: string;

  // Contact Information
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };

  // Company Details
  mission?: string;
  vision?: string;
  values: string[];
  culture: string;
  benefits: string[];

  // Point of Contact
  primaryContact: {
    name: string;
    title: string;
    email: string;
    phone: string;
  };

  // Social Media
  socialMedia?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };

  // Verification and Status
  isVerified: boolean;
  status: 'active' | 'pending' | 'suspended' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface CompanyRegistration {
  // Basic Information
  companyName: string;
  industry: string;
  companySize: CompanyProfile['size'];
  foundedYear: number;
  website: string;
  description: string;

  // Contact Information
  businessEmail: string;
  businessPhone: string;
  headquarters: string;

  // Primary Contact Person
  contactPerson: {
    firstName: string;
    lastName: string;
    title: string;
    email: string;
    phone: string;
  };

  // Business Details
  registrationNumber?: string;
  taxId?: string;

  // Document Verification
  documents?: {
    businessLicense?: {
      fileUrl: string;
      fileName: string;
      uploadedAt: Date;
      status: 'pending' | 'verified' | 'rejected';
      rejectionReason?: string;
    };
    taxDocument?: {
      fileUrl: string;
      fileName: string;
      uploadedAt: Date;
      status: 'pending' | 'verified' | 'rejected';
      rejectionReason?: string;
    };
    incorporationCertificate?: {
      fileUrl: string;
      fileName: string;
      uploadedAt: Date;
      status: 'pending' | 'verified' | 'rejected';
      rejectionReason?: string;
    };
    proofOfAddress?: {
      fileUrl: string;
      fileName: string;
      uploadedAt: Date;
      status: 'pending' | 'verified' | 'rejected';
      rejectionReason?: string;
    };
  };

  // Verification Status
  verificationStatus?: {
    overall: 'pending' | 'in_review' | 'approved' | 'rejected';
    documentsVerified: boolean;
    complianceChecked: boolean;
    adminApproved: boolean;
    emailVerified: boolean;
  };

  // Agreement
  termsAccepted: boolean;
  privacyPolicyAccepted: boolean;
}

export interface JobPosting {
  id: string;
  companyId: string;
  title: string;
  description: string;
  requirements: string[];
  responsibilities: string[];

  // Job Details
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  level: 'entry' | 'junior' | 'mid' | 'senior' | 'lead';
  department: string;
  location: {
    type: 'remote' | 'on-site' | 'hybrid';
    city?: string;
    state?: string;
    country: string;
  };

  // Compensation
  salary: {
    min: number;
    max: number;
    currency: string;
    period: 'hour' | 'month' | 'year';
  };

  // Timeline
  startDate?: Date;
  endDate?: Date;
  applicationDeadline: Date;

  // Skills and Qualifications
  requiredSkills: string[];
  preferredSkills: string[];
  education: {
    level: 'high-school' | 'associate' | 'bachelor' | 'master' | 'phd';
    field?: string;
  };
  experience: {
    min: number;
    max?: number;
    unit: 'months' | 'years';
  };

  // Application Process
  applicationProcess: {
    steps: string[];
    documentsRequired: string[];
    interviewProcess?: string;
  };

  // Status and Metrics
  status: 'draft' | 'published' | 'paused' | 'closed' | 'expired';
  applicationsCount: number;
  viewsCount: number;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export interface CandidateApplication {
  id: string;
  jobId: string;
  candidateId: string;

  // Application Data
  coverLetter?: string;
  resume: string; // URL or file path
  additionalDocuments?: string[];

  // Candidate Information (denormalized for quick access)
  candidate: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    location?: string;
    education?: string;
    experience?: string;
    skills?: string[];
  };

  // Application Status
  status: 'submitted' | 'reviewing' | 'shortlisted' | 'interview_scheduled' |
          'interview_completed' | 'reference_check' | 'offer_extended' |
          'offer_accepted' | 'offer_declined' | 'rejected' | 'withdrawn';

  // Review Process
  reviewStage: 'initial' | 'technical' | 'hr' | 'final' | 'completed';
  reviewers: {
    userId: string;
    name: string;
    role: string;
    status: 'pending' | 'reviewed' | 'approved' | 'rejected';
    feedback?: string;
    rating?: number; // 1-5 scale
    reviewedAt?: Date;
  }[];

  // Interview Information
  interviews?: {
    id: string;
    type: 'phone' | 'video' | 'in-person' | 'technical';
    scheduledAt: Date;
    duration: number; // minutes
    interviewer: {
      id: string;
      name: string;
      title: string;
    };
    status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
    feedback?: string;
    rating?: number;
    notes?: string;
  }[];

  // Communication
  messages?: {
    id: string;
    from: string;
    to: string;
    subject: string;
    content: string;
    sentAt: Date;
    read: boolean;
  }[];

  // Timestamps
  submittedAt: Date;
  lastUpdated: Date;
  reviewedAt?: Date;
}

export interface CompanyUser {
  id: string;
  companyId: string;
  email: string;
  firstName: string;
  lastName: string;
  title: string;
  department?: string;

  // Role and Permissions
  role: 'admin' | 'hr' | 'hiring_manager' | 'interviewer' | 'recruiter';
  permissions: {
    canCreateJobs: boolean;
    canReviewApplications: boolean;
    canScheduleInterviews: boolean;
    canMakeOffers: boolean;
    canManageUsers: boolean;
    canViewAnalytics: boolean;
  };

  // Status
  status: 'active' | 'inactive' | 'pending_invitation';
  lastLogin?: Date;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface CompanyAnalytics {
  companyId: string;
  period: {
    start: Date;
    end: Date;
  };

  // Job Posting Metrics
  jobPostings: {
    total: number;
    active: number;
    draft: number;
    closed: number;
    views: number;
    applications: number;
  };

  // Application Metrics
  applications: {
    total: number;
    new: number;
    inReview: number;
    interviewed: number;
    hired: number;
    rejected: number;
    averageTimeToHire: number; // days
  };

  // Candidate Metrics
  candidates: {
    totalApplicants: number;
    qualifiedCandidates: number;
    interviewedCandidates: number;
    hiredCandidates: number;
    conversionRate: number; // percentage
  };

  // Popular Metrics
  topSkills: { skill: string; count: number; }[];
  topLocations: { location: string; count: number; }[];
  applicationSources: { source: string; count: number; }[];
}

// API Response Types
export interface CompanyApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedCompanyResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: string;
  message?: string;
}

// Filter Types
export interface ApplicationFilters {
  status?: CandidateApplication['status'][];
  reviewStage?: CandidateApplication['reviewStage'][];
  jobId?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  skills?: string[];
  experience?: {
    min?: number;
    max?: number;
  };
  education?: string[];
  location?: string[];
  rating?: {
    min?: number;
    max?: number;
  };
}

export interface JobFilters {
  status?: JobPosting['status'][];
  department?: string[];
  type?: JobPosting['type'][];
  level?: JobPosting['level'][];
  location?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// Form Types
export interface JobPostingForm extends Omit<JobPosting, 'id' | 'companyId' | 'applicationsCount' | 'viewsCount' | 'createdAt' | 'updatedAt' | 'publishedAt'> {
  // Form-specific fields can be added here
}

export interface ApplicationReviewForm {
  applicationId: string;
  reviewerId: string;
  status: 'approved' | 'rejected';
  feedback: string;
  rating: number;
  nextSteps?: string;
}

export interface JobOfferForm {
  applicationId: string;
  jobTitle: string;
  salary: {
    amount: number;
    currency: string;
    period: string;
  };
  startDate: Date;
  endDate: Date;
  benefits: string[];
  terms: string;
  expiresAt: Date;
  notes?: string;
}

// Workflow Management Types
export interface ApplicationWorkflowAction {
  id: string;
  label: string;
  type: 'positive' | 'negative' | 'neutral';
  nextStatus: string;
}

export interface ApplicationWorkflowLog {
  id: string;
  action: string;
  previousStatus: string | null;
  newStatus: string;
  performedBy: {
    id: string;
    name: string;
    type: 'company' | 'candidate' | 'system';
  };
  timestamp: Date;
  notes?: string;
}

export interface CandidateApplicationExtended extends CandidateApplication {
  workflowHistory?: ApplicationWorkflowLog[];
}
