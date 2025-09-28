// Filter configurations for different pages/contexts

export const INTERN_SEARCH_FILTERS = [
  {
    key: 'fieldOfStudy',
    label: 'Field of Study',
    title: 'Field of Study',
    type: 'checkbox',
    width: '160px',
    apiField: 'educations.fieldOfStudy', // Maps to actual data structure
    options: [
      'Bachelor of Computer Science',
      'Bachelor of Engineering',
      'Bachelor of Business Administration',
      'Bachelor of Finance',
      'Bachelor of Marketing',
      'Bachelor of Design',
      'Bachelor of Medicine',
      'Bachelor of Law',
      'Bachelor of Education',
      'Bachelor of Psychology',
      'Master of Computer Science',
      'Master of Engineering',
      'Master of Business Administration',
      'Diploma in Computer Science',
      'Diploma in Engineering',
      'Diploma in Business'
    ]
  },
  {
    key: 'educationLevel',
    label: 'Education Level',
    title: 'Education Level',
    type: 'checkbox',
    width: '140px',
    apiField: 'educations.level',
    options: [
      'Degree',
      'Master',
      'PhD',
      'Diploma',
      'Certificate'
    ]
  },
  {
    key: 'university',
    label: 'University',
    title: 'University/Institution',
    type: 'checkbox',
    width: '130px',
    apiField: 'educations.institutionName',
    options: [
      'Swinburne University',
      'University of Malaya',
      'Universiti Teknologi Malaysia',
      'Universiti Putra Malaysia',
      'Universiti Kebangsaan Malaysia',
      'Universiti Sains Malaysia',
      'Taylor\'s University',
      'Sunway University',
      'INTI International University',
      'Monash University Malaysia'
    ]
  },
  {
    key: 'workExperience',
    label: 'Work Experience',
    title: 'Work Experience Industry',
    type: 'checkbox',
    width: '150px',
    apiField: 'workExperiences.industry',
    options: [
      'Technology',
      'Finance',
      'Healthcare',
      'Education',
      'Manufacturing',
      'Retail',
      'Consulting',
      'Media',
      'Government',
      'Non-profit',
      'Automotive',
      'Real Estate',
      'Hospitality',
      'Transportation'
    ]
  },
  {
    key: 'skills',
    label: 'Skills',
    title: 'Technical Skills',
    type: 'checkbox',
    width: '100px',
    apiField: 'skills.name',
    options: [
      'JavaScript',
      'Python',
      'Java',
      'React',
      'Node.js',
      'SQL',
      'MongoDB',
      'AWS',
      'Docker',
      'Git',
      'Machine Learning',
      'Data Analysis',
      'UI/UX Design',
      'Project Management'
    ]
  },
  {
    key: 'preferredLocations',
    label: 'Preferred Location',
    title: 'Preferred Work Location',
    type: 'checkbox',
    width: '150px',
    apiField: 'preferences.locations',
    options: [
      'Kuala Lumpur',
      'Selangor',
      'Penang',
      'Johor',
      'Perak',
      'Sabah',
      'Sarawak',
      'Kedah',
      'Kelantan',
      'Terengganu',
      'Pahang',
      'Negeri Sembilan',
      'Melaka',
      'Perlis',
      'Remote'
    ]
  }
];

export const JOB_SEARCH_FILTERS = [
  {
    key: 'industry',
    label: 'Industry',
    title: 'Industry',
    type: 'checkbox',
    width: '120px',
    options: [
      'Technology',
      'Finance',
      'Healthcare',
      'Education',
      'Manufacturing',
      'Retail',
      'Consulting',
      'Media',
      'Government',
      'Non-profit'
    ]
  },
  {
    key: 'jobType',
    label: 'Job Type',
    title: 'Employment Type',
    type: 'checkbox',
    width: '110px',
    options: [
      'Full-time',
      'Part-time',
      'Contract',
      'Internship',
      'Remote'
    ]
  },
  {
    key: 'experience',
    label: 'Experience',
    title: 'Experience Level',
    type: 'checkbox',
    width: '130px',
    options: [
      'Entry Level',
      '1-3 years',
      '3-5 years',
      '5-10 years',
      '10+ years'
    ]
  },
  {
    key: 'location',
    label: 'Location',
    title: 'Job Location',
    type: 'checkbox',
    width: '110px',
    options: [
      'Kuala Lumpur',
      'Selangor',
      'Penang',
      'Johor',
      'Remote',
      'Hybrid'
    ]
  },
  {
    key: 'salary',
    label: 'Salary',
    title: 'Salary Range (RM)',
    type: 'checkbox',
    width: '100px',
    options: [
      '2000 - 4000',
      '4000 - 6000',
      '6000 - 8000',
      '8000 - 10000',
      '10000+'
    ]
  }
];

export const COMPANY_SEARCH_FILTERS = [
  {
    key: 'industry',
    label: 'Industry',
    title: 'Company Industry',
    type: 'checkbox',
    width: '120px',
    options: [
      'Technology',
      'Finance',
      'Healthcare',
      'Manufacturing',
      'Retail',
      'Consulting',
      'Education',
      'Media'
    ]
  },
  {
    key: 'size',
    label: 'Company Size',
    title: 'Company Size',
    type: 'checkbox',
    width: '140px',
    options: [
      '1-10 employees',
      '11-50 employees',
      '51-200 employees',
      '201-500 employees',
      '500+ employees'
    ]
  },
  {
    key: 'location',
    label: 'Location',
    title: 'Company Location',
    type: 'checkbox',
    width: '110px',
    options: [
      'Kuala Lumpur',
      'Selangor',
      'Penang',
      'Johor',
      'Perak'
    ]
  },
  {
    key: 'verified',
    label: 'Verification',
    title: 'Verification Status',
    type: 'checkbox',
    width: '130px',
    options: [
      'Verified',
      'Pending',
      'All'
    ]
  }
];

export const UNIVERSITY_SEARCH_FILTERS = [
  {
    key: 'level',
    label: 'Level',
    title: 'Education Level',
    type: 'checkbox',
    width: '100px',
    options: [
      'Diploma',
      'Bachelor',
      'Master',
      'PhD'
    ]
  },
  {
    key: 'faculty',
    label: 'Faculty',
    title: 'Faculty/School',
    type: 'checkbox',
    width: '110px',
    options: [
      'Engineering',
      'Computer Science',
      'Business',
      'Medicine',
      'Law',
      'Arts',
      'Science'
    ]
  },
  {
    key: 'gpa',
    label: 'GPA Range',
    title: 'GPA Range',
    type: 'checkbox',
    width: '120px',
    options: [
      '3.5 - 4.0',
      '3.0 - 3.5',
      '2.5 - 3.0',
      '2.0 - 2.5'
    ]
  }
];

// Helper function to get filter config by type
export const getFilterConfig = (type) => {
  switch (type) {
    case 'intern-search':
      return INTERN_SEARCH_FILTERS;
    case 'job-search':
      return JOB_SEARCH_FILTERS;
    case 'company-search':
      return COMPANY_SEARCH_FILTERS;
    case 'university-search':
      return UNIVERSITY_SEARCH_FILTERS;
    default:
      return [];
  }
};

// Helper function to create custom filter config
export const createCustomFilterConfig = (filters) => {
  return filters.map(filter => ({
    key: filter.key,
    label: filter.label,
    title: filter.title || filter.label,
    type: filter.type || 'checkbox',
    width: filter.width || '120px',
    options: filter.options || []
  }));
};
