interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'company' | 'admin';
  emailVerified: boolean;
  profile: {
    avatar?: string;
    bio?: string;
    phone?: string;
    location?: string;
    website?: string;
    linkedin?: string;
    github?: string;
  };
  student?: {
    education: any[];
    experience: any[];
    skills: string[];
    resume?: string;
    portfolio?: string;
    expectedSalary?: number;
    jobPreferences?: {
      jobTypes: string[];
      locations: string[];
      remote: boolean;
    };
  };
  internship?: {
    profile: {
      profileInformation: any;
      educationBackground: any[];
      certifications: any[];
      interests: string[];
      workExperience: any[];
    };
    details: {
      duration: any;
      preferredIndustry: string[];
      preferredLocations: string[];
      salaryRange: any;
      skills: string[];
      languages: string[];
      availability: any;
      workPreferences: any;
    };
    courses: any[];
    assignments: any[];
    isSetupComplete: boolean;
  };
}

interface ProfileCompletionResult {
  percentage: number;
  completedFields: number;
  totalFields: number;
  missingFields: string[];
  sections: {
    basic: { completed: number; total: number; missing: string[] };
    profile: { completed: number; total: number; missing: string[] };
    education: { completed: number; total: number; missing: string[] };
    experience: { completed: number; total: number; missing: string[] };
    skills: { completed: number; total: number; missing: string[] };
    preferences: { completed: number; total: number; missing: string[] };
    internship?: { completed: number; total: number; missing: string[] };
  };
}

export function calculateProfileCompletion(user: User): ProfileCompletionResult {
  const sections = {
    basic: { completed: 0, total: 0, missing: [] as string[] },
    profile: { completed: 0, total: 0, missing: [] as string[] },
    education: { completed: 0, total: 0, missing: [] as string[] },
    experience: { completed: 0, total: 0, missing: [] as string[] },
    skills: { completed: 0, total: 0, missing: [] as string[] },
    preferences: { completed: 0, total: 0, missing: [] as string[] },
  };

  // Basic Information (Required)
  const basicFields = [
    { key: 'firstName', label: 'First Name', value: user.firstName },
    { key: 'lastName', label: 'Last Name', value: user.lastName },
    { key: 'email', label: 'Email', value: user.email },
    { key: 'emailVerified', label: 'Email Verification', value: user.emailVerified },
  ];

  basicFields.forEach(field => {
    sections.basic.total++;
    if (field.value && field.value !== '') {
      sections.basic.completed++;
    } else {
      sections.basic.missing.push(field.label);
    }
  });

  // Profile Information
  const profileFields = [
    { key: 'bio', label: 'Bio', value: user.profile?.bio },
    { key: 'phone', label: 'Phone', value: user.profile?.phone },
    { key: 'location', label: 'Location', value: user.profile?.location },
    { key: 'linkedin', label: 'LinkedIn', value: user.profile?.linkedin },
  ];

  profileFields.forEach(field => {
    sections.profile.total++;
    if (field.value && field.value !== '') {
      sections.profile.completed++;
    } else {
      sections.profile.missing.push(field.label);
    }
  });

  if (user.role === 'student' && user.student) {
    // Education
    sections.education.total = 1; // At least one education entry
    if (user.student.education && user.student.education.length > 0) {
      sections.education.completed = 1;
    } else {
      sections.education.missing.push('Education Background');
    }

    // Experience
    sections.experience.total = 1; // At least one experience entry (can be internships)
    if (user.student.experience && user.student.experience.length > 0) {
      sections.experience.completed = 1;
    } else {
      sections.experience.missing.push('Work Experience');
    }

    // Skills
    sections.skills.total = 1; // At least 3 skills
    if (user.student.skills && user.student.skills.length >= 3) {
      sections.skills.completed = 1;
    } else {
      sections.skills.missing.push('Skills (minimum 3)');
    }

    // Preferences
    const prefFields = [
      { key: 'jobTypes', label: 'Job Types', value: user.student.jobPreferences?.jobTypes?.length },
      { key: 'locations', label: 'Preferred Locations', value: user.student.jobPreferences?.locations?.length },
    ];

    prefFields.forEach(field => {
      sections.preferences.total++;
      if (field.value && field.value > 0) {
        sections.preferences.completed++;
      } else {
        sections.preferences.missing.push(field.label);
      }
    });

    // Resume (optional but recommended)
    sections.preferences.total++;
    if (user.student.resume) {
      sections.preferences.completed++;
    } else {
      sections.preferences.missing.push('Resume');
    }
  }

  // Add internship section if user has internship data
  if (user.internship) {
    const internshipSection = { completed: 0, total: 0, missing: [] as string[] };
    
    // Check internship profile completion
    const internshipFields = [
      { key: 'bio', label: 'Internship Bio', value: user.internship.profile?.profileInformation?.bio },
      { key: 'interests', label: 'Interests', value: user.internship.profile?.interests?.length },
      { key: 'preferredIndustry', label: 'Preferred Industry', value: user.internship.details?.preferredIndustry?.length },
      { key: 'skills', label: 'Internship Skills', value: user.internship.details?.skills?.length },
    ];

    internshipFields.forEach(field => {
      internshipSection.total++;
      if (field.value && field.value !== '' && field.value !== 0) {
        internshipSection.completed++;
      } else {
        internshipSection.missing.push(field.label);
      }
    });

    (sections as any).internship = internshipSection;
  }

  // Calculate totals
  const totalCompleted = Object.values(sections).reduce((sum, section) => sum + section.completed, 0);
  const totalFields = Object.values(sections).reduce((sum, section) => sum + section.total, 0);
  const allMissingFields = Object.values(sections).flatMap(section => section.missing);

  const percentage = totalFields > 0 ? Math.round((totalCompleted / totalFields) * 100) : 0;

  return {
    percentage,
    completedFields: totalCompleted,
    totalFields,
    missingFields: allMissingFields,
    sections,
  };
}

export function getProfileCompletionLevel(percentage: number): {
  level: 'incomplete' | 'basic' | 'good' | 'excellent';
  color: string;
  message: string;
} {
  if (percentage < 30) {
    return {
      level: 'incomplete',
      color: 'red',
      message: 'Your profile needs attention. Complete basic information to get started.',
    };
  } else if (percentage < 60) {
    return {
      level: 'basic',
      color: 'yellow',
      message: 'Good start! Add more details to improve your visibility.',
    };
  } else if (percentage < 85) {
    return {
      level: 'good',
      color: 'blue',
      message: 'Great profile! A few more details will make it outstanding.',
    };
  } else {
    return {
      level: 'excellent',
      color: 'green',
      message: 'Excellent! Your profile is comprehensive and attractive to employers.',
    };
  }
}

export function getNextProfileStep(user: User): {
  section: string;
  action: string;
  priority: 'high' | 'medium' | 'low';
} {
  const completion = calculateProfileCompletion(user);
  
  // Priority order for completion
  if (!user.emailVerified) {
    return { section: 'basic', action: 'Verify your email address', priority: 'high' };
  }
  
  if (completion.sections.basic.missing.length > 0) {
    return { section: 'basic', action: `Complete: ${completion.sections.basic.missing[0]}`, priority: 'high' };
  }
  
  if (user.role === 'student') {
    if (completion.sections.education.missing.length > 0) {
      return { section: 'education', action: 'Add your education background', priority: 'high' };
    }
    
    if (completion.sections.skills.missing.length > 0) {
      return { section: 'skills', action: 'Add your skills (minimum 3)', priority: 'high' };
    }
    
    if (completion.sections.profile.missing.length > 0) {
      return { section: 'profile', action: `Add: ${completion.sections.profile.missing[0]}`, priority: 'medium' };
    }
    
    if (completion.sections.experience.missing.length > 0) {
      return { section: 'experience', action: 'Add work experience or internships', priority: 'medium' };
    }
    
    if (completion.sections.preferences.missing.length > 0) {
      return { section: 'preferences', action: `Set: ${completion.sections.preferences.missing[0]}`, priority: 'low' };
    }
  }
  
  return { section: 'complete', action: 'Profile is complete!', priority: 'low' };
}
