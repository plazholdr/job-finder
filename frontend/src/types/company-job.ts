// Company and Job Management type definitions

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'intern' | 'company' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

export interface Company {
  id: string;
  name: string;
  description: string;
  nature: string;
  logo: string;
  email: string;
  address: string;
  phoneNumber: string;
  picEmail: string;
  picMobileNumber: string;
  website: string;
  // Additional fields from ER diagram
  briefDescription?: string;
  industry?: string;
  size?: string;
  founded?: string;
  headquarters?: string;
  mission?: string;
  values?: string[];
  benefits?: string[];
  culture?: string;
  rating?: number;
  reviewCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Job {
  id: string;
  companyId: string;
  company?: Company;
  logo: string;
  name: string;
  title: string;
  briefDescription: string;
  postedDate: Date;
  deadline: Date;
  location: string;
  salaryRange: string;
  // Additional fields from ER diagram
  jobListingTitle?: string;
  jobListingBriefDescription?: string;
  startDate?: Date;
  endDate?: Date;
  duration?: string;
  profession?: string;
  requirements?: string[];
  responsibilities?: string[];
  benefits?: string[];
  skills?: string[];
  experienceLevel?: string;
  educationLevel?: string;
  remote?: boolean;
  type?: string;
  status?: 'active' | 'closed' | 'filled';
  applicationsCount?: number;
  viewsCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Internship {
  id: string;
  jobId: string;
  job?: Job;
  startDate: Date;
  endDate: Date;
  duration: string;
  profession: string;
  jobDescription: string;
  location: string;
  cityState: string;
  postalCode: string;
  quantity: number;
  maxQuantity: number;
  picName: string;
  // Additional fields from ER diagram
  internshipJobListingTitle?: string;
  internshipJobListingBriefDescription?: string;
  internshipStartDate?: Date;
  internshipEndDate?: Date;
  internshipDuration?: string;
  internshipProfession?: string;
  internshipJobDescription?: string;
  internshipLocation?: string;
  internshipQuantity?: number;
  internshipPicName?: string;
  internshipSalaryRange?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  internshipId: string;
  internship?: Internship;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  duration: string;
  location: string;
  levelMultiple: boolean;
  roleDescription: string;
  areaOfInterest1: string;
  areaOfInterest2: string;
  areaOfInterest3: string;
  // Additional fields from ER diagram
  projectTitle?: string;
  projectDescription?: string;
  projectStartDate?: Date;
  projectEndDate?: Date;
  projectDuration?: string;
  projectLocation?: string;
  projectLevelMultiple?: boolean;
  projectRoleDescription?: string;
  projectAreaOfInterest1?: string;
  projectAreaOfInterest2?: string;
  projectAreaOfInterest3?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LikedCompany {
  id: string;
  userId: string;
  companyId: string;
  createdAt: Date;
}

export interface LikedJob {
  id: string;
  userId: string;
  jobId: string;
  createdAt: Date;
}

export interface Application {
  id: string;
  userId: string;
  jobId: string;
  job?: Job;
  personalInformation: string;
  internshipDetails: string;
  courseInformation: string;
  assignmentInformation: string;
  status: 'pending' | 'applied' | 'reviewed' | 'interview_scheduled' | 'interview_completed' | 'accepted' | 'rejected' | 'withdrawn';
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  timeline?: ApplicationTimelineEvent[];
  feedback?: string;
  interviewDetails?: InterviewDetails;
  offerDetails?: OfferDetails;
  offerValidity?: string | null;
  offerLetterUrl?: string | null;
}

export interface ApplicationTimelineEvent {
  id: string;
  applicationId: string;
  status: Application['status'];
  title: string;
  description: string;
  timestamp: Date;
  actor: 'system' | 'company' | 'intern';
  actorName?: string;
}

export interface InterviewDetails {
  id: string;
  applicationId: string;
  type: 'phone' | 'video' | 'in_person' | 'technical' | 'behavioral';
  scheduledDate: Date;
  duration: number; // in minutes
  location?: string;
  meetingLink?: string;
  interviewer: {
    name: string;
    title: string;
    email: string;
  };
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  notes?: string;
  feedback?: string;
  rating?: number; // 1-5 scale
}

export interface OfferDetails {
  id: string;
  applicationId: string;
  salary: number;
  currency: string;
  period: 'hour' | 'week' | 'month' | 'total';
  startDate: Date;
  endDate: Date;
  benefits: string[];
  conditions: string[];
  deadline: Date;
  status: 'pending' | 'accepted' | 'declined' | 'negotiating';
  responseRequired: boolean;
}

// View types for the flowchart
export interface CompanyOverview {
  id: string;
  name: string;
  briefDescription: string;
  nature: string;
}

export interface JobOverview {
  id: string;
  companyLogo: string;
  companyName: string;
  internshipJobListingTitle: string;
  internshipJobListingBriefDescription: string;
  internshipJobListingPostedDate: Date;
  internshipJobListingDeadline: Date;
  internshipJobLocation: string;
  internshipJobSalaryRange: string;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedApiResponse<T> {
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

// Filter and search types
export interface CompanyFilters {
  search?: string;
  nature?: string[];
  location?: string[];
}

export interface JobFilters {
  search?: string;
  location?: string[];
  salaryRange?: {
    min?: number;
    max?: number;
  };
  postedWithin?: 'day' | 'week' | 'month' | 'all';
  deadline?: 'week' | 'month' | 'all';
}

// Hiring and Onboarding types
export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  dueDate?: Date;
  documents?: string[];
  assignedTo?: string;
  estimatedDuration?: string;
}

export interface HiringProcess {
  id: string;
  applicationId: string;
  userId: string;
  status: 'offer_extended' | 'offer_accepted' | 'onboarding' | 'completed';
  startDate: Date;
  endDate?: Date;
  mentor?: {
    id: string;
    name: string;
    title: string;
    email: string;
    phone?: string;
  };
  department: string;
  supervisor: {
    id: string;
    name: string;
    title: string;
    email: string;
  };
  workspace?: {
    location: string;
    desk?: string;
    equipment: string[];
  };
  onboardingSteps: OnboardingStep[];
}
