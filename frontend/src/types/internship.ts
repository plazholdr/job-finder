// Intern-related type definitions for internship management

export interface InternshipProfile {
  profileInformation: ProfileInformation;
  educationBackground: EducationBackground[];
  certifications: Certification[];
  interests: string[];
  workExperience: WorkExperience[];
}

export interface ProfileInformation {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  avatar?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
}

export interface EducationBackground {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  gpa?: number;
  description?: string;
  isCurrentlyEnrolled: boolean;
}

export interface Certification {
  id: string;
  name: string;
  issuingOrganization: string;
  issueDate: string;
  expirationDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  description?: string;
}

export interface WorkExperience {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  startDate: string;
  endDate?: string;
  isCurrentPosition: boolean;
  description: string;
  skills: string[];
  achievements?: string[];
}

export interface InternshipDetails {
  duration: InternshipDuration;
  preferredIndustry: string[];
  preferredLocations: string[];
  salaryRange: SalaryRange;
  skills: string[];
  languages: Language[];
  availability: Availability;
  workPreferences: WorkPreferences;
}

export interface InternshipDuration {
  startDate: string;
  endDate: string;
  isFlexible: boolean;
  minimumWeeks?: number;
  maximumWeeks?: number;
}

export interface SalaryRange {
  min: number;
  max: number;
  currency: string;
  period: 'hour' | 'week' | 'month';
  isNegotiable: boolean;
}

export interface Language {
  name: string;
  proficiency: 'Basic' | 'Conversational' | 'Fluent' | 'Native';
}

export interface Availability {
  hoursPerWeek: number;
  flexibleSchedule: boolean;
  preferredStartTime?: string;
  preferredEndTime?: string;
  availableDays: string[];
}

export interface WorkPreferences {
  remote: boolean;
  hybrid: boolean;
  onSite: boolean;
  travelWillingness: 'None' | 'Local' | 'Regional' | 'National' | 'International';
}

export interface CourseInformation {
  id: string;
  courseId: string;
  courseName: string;
  courseDescription: string;
  instructor?: string;
  credits?: number;
  semester?: string;
  year?: number;
  grade?: string;
  status: 'Completed' | 'In Progress' | 'Planned';
}

export interface AssignmentInformation {
  id: string;
  assignmentTitle: string;
  natureOfAssignment: string;
  methodology: string[];
  assignmentDescription: string;
  courseId?: string;
  courseName?: string;
  submissionDate?: string;
  grade?: string;
  feedback?: string;
  attachments?: AssignmentAttachment[];
}

export interface AssignmentAttachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadDate: string;
  url: string;
}

export interface InternshipApplication {
  id: string;
  internshipId: string;
  applicantId: string;
  status: 'draft' | 'submitted' | 'under_review' | 'interview' | 'accepted' | 'rejected' | 'withdrawn';
  submittedAt?: string;
  lastUpdated: string;
  coverLetter?: string;
  additionalDocuments?: AssignmentAttachment[];
  interviewSchedule?: InterviewSchedule[];
  feedback?: ApplicationFeedback[];
}

export interface InterviewSchedule {
  id: string;
  type: 'phone' | 'video' | 'in_person';
  scheduledDate: string;
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
}

export interface ApplicationFeedback {
  id: string;
  stage: string;
  feedback: string;
  rating?: number;
  providedBy: string;
  providedAt: string;
}

export interface InternshipOpportunity {
  id: string;
  title: string;
  company: {
    id: string;
    name: string;
    logo?: string;
    industry: string;
    size: string;
    location: string;
    website?: string;
    description: string;
  };
  location: string;
  type: 'paid' | 'unpaid' | 'academic_credit';
  duration: {
    weeks: number;
    hoursPerWeek: number;
    startDate: string;
    endDate: string;
    isFlexible: boolean;
  };
  compensation?: {
    amount: number;
    currency: string;
    period: 'hour' | 'week' | 'month' | 'total';
  };
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  skills: string[];
  qualifications: string[];
  applicationDeadline: string;
  postedDate: string;
  remote: boolean;
  hybrid: boolean;
  applicationsCount: number;
  viewsCount: number;
  status: 'active' | 'closed' | 'filled';
  contactPerson?: {
    name: string;
    title: string;
    email: string;
    phone?: string;
  };
}

export interface InternshipSearchFilters {
  keywords?: string;
  location?: string[];
  industry?: string[];
  type?: ('paid' | 'unpaid' | 'academic_credit')[];
  duration?: {
    min?: number;
    max?: number;
  };
  remote?: boolean;
  hybrid?: boolean;
  onSite?: boolean;
  compensation?: {
    min?: number;
    max?: number;
    currency?: string;
    period?: string;
  };
  skills?: string[];
  postedWithin?: 'day' | 'week' | 'month' | 'all';
}

// Form state types for the intern setup flow
export interface InternshipSetupState {
  currentStep: 'profile' | 'decision' | 'details' | 'courses' | 'assignments' | 'complete';
  isFirstTimeSetup: boolean;
  profile: Partial<InternshipProfile>;
  details: Partial<InternshipDetails>;
  courses: CourseInformation[];
  assignments: AssignmentInformation[];
  errors: Record<string, string>;
  isLoading: boolean;
}

// API response types
export interface InternshipApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
