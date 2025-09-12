import { NextRequest, NextResponse } from 'next/server';

interface SearchFilters {
  query?: string;
  type: 'applications' | 'jobs' | 'candidates' | 'all';
  status?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  skills?: string[];
  location?: string;
  department?: string;
  experience?: {
    min?: number;
    max?: number;
  };
  education?: string[];
  salary?: {
    min?: number;
    max?: number;
  };
  tags?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

interface SearchResult {
  id: string;
  type: 'application' | 'job' | 'candidate';
  title: string;
  subtitle: string;
  description: string;
  status: string;
  tags: string[];
  metadata: Record<string, any>;
  relevanceScore: number;
  createdAt: Date;
  updatedAt: Date;
}

// Mock search data
const mockSearchResults: SearchResult[] = [
  {
    id: 'app-1',
    type: 'application',
    title: 'John Doe - Software Engineering Intern',
    subtitle: 'Computer Science, Stanford University',
    description: 'Experienced in React, Node.js, and Python. Looking for summer internship.',
    status: 'under_review',
    tags: ['React', 'Node.js', 'Python', 'Computer Science'],
    metadata: {
      university: 'Stanford University',
      gpa: 3.8,
      graduationYear: 2025,
      location: 'San Francisco, CA'
    },
    relevanceScore: 0.95,
    createdAt: new Date('2024-01-20T10:00:00Z'),
    updatedAt: new Date('2024-01-22T14:30:00Z')
  },
  {
    id: 'app-2',
    type: 'application',
    title: 'Emily Chen - Data Science Intern',
    subtitle: 'Statistics, UC Berkeley',
    description: 'Strong background in Python, R, and machine learning algorithms.',
    status: 'interview_scheduled',
    tags: ['Python', 'R', 'Machine Learning', 'Statistics'],
    metadata: {
      university: 'UC Berkeley',
      gpa: 3.7,
      graduationYear: 2024,
      location: 'Berkeley, CA'
    },
    relevanceScore: 0.89,
    createdAt: new Date('2024-01-19T14:20:00Z'),
    updatedAt: new Date('2024-01-21T11:45:00Z')
  },
  {
    id: 'app-3',
    type: 'application',
    title: 'Michael Rodriguez - Marketing Intern',
    subtitle: 'Business Administration, UCLA',
    description: 'Creative marketing student with social media and content creation experience.',
    status: 'new',
    tags: ['Marketing', 'Social Media', 'Content Creation', 'Business'],
    metadata: {
      university: 'UCLA',
      gpa: 3.6,
      graduationYear: 2025,
      location: 'Los Angeles, CA'
    },
    relevanceScore: 0.76,
    createdAt: new Date('2024-01-21T16:30:00Z'),
    updatedAt: new Date('2024-01-21T16:30:00Z')
  },
  {
    id: 'job-1',
    type: 'job',
    title: 'Software Engineering Intern',
    subtitle: 'Engineering Department',
    description: 'Join our engineering team to work on cutting-edge web applications.',
    status: 'published',
    tags: ['JavaScript', 'React', 'Node.js', 'Internship'],
    metadata: {
      department: 'Engineering',
      location: 'San Francisco, CA',
      type: 'hybrid',
      applicationsCount: 45
    },
    relevanceScore: 0.88,
    createdAt: new Date('2024-01-15T09:00:00Z'),
    updatedAt: new Date('2024-01-20T16:45:00Z')
  },
  {
    id: 'candidate-1',
    type: 'candidate',
    title: 'Sarah Johnson',
    subtitle: 'Data Science, MIT',
    description: 'Machine learning enthusiast with experience in Python, TensorFlow, and data analysis.',
    status: 'available',
    tags: ['Python', 'Machine Learning', 'TensorFlow', 'Data Science'],
    metadata: {
      university: 'MIT',
      major: 'Data Science',
      gpa: 3.9,
      graduationYear: 2024,
      location: 'Boston, MA'
    },
    relevanceScore: 0.82,
    createdAt: new Date('2024-01-18T11:30:00Z'),
    updatedAt: new Date('2024-01-21T09:15:00Z')
  }
];

// GET advanced search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const filters: SearchFilters = {
      query: searchParams.get('query') || undefined,
      type: (searchParams.get('type') as SearchFilters['type']) || 'all',
      status: searchParams.get('status')?.split(',') || undefined,
      dateRange: searchParams.get('dateStart') && searchParams.get('dateEnd') ? {
        start: searchParams.get('dateStart')!,
        end: searchParams.get('dateEnd')!
      } : undefined,
      skills: searchParams.get('skills')?.split(',') || undefined,
      location: searchParams.get('location') || undefined,
      department: searchParams.get('department') || undefined,
      experience: {
        min: searchParams.get('experienceMin') ? parseInt(searchParams.get('experienceMin')!) : undefined,
        max: searchParams.get('experienceMax') ? parseInt(searchParams.get('experienceMax')!) : undefined
      },
      education: searchParams.get('education')?.split(',') || undefined,
      salary: {
        min: searchParams.get('salaryMin') ? parseInt(searchParams.get('salaryMin')!) : undefined,
        max: searchParams.get('salaryMax') ? parseInt(searchParams.get('salaryMax')!) : undefined
      },
      tags: searchParams.get('tags')?.split(',') || undefined,
      sortBy: searchParams.get('sortBy') || 'relevance',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20')
    };

    // Apply filters
    let filteredResults = [...mockSearchResults];

    // Filter by type
    if (filters.type !== 'all') {
      filteredResults = filteredResults.filter(result => result.type === filters.type);
    }

    // Filter by query (search in title, subtitle, description, tags)
    if (filters.query) {
      const query = filters.query.toLowerCase();
      filteredResults = filteredResults.filter(result =>
        result.title.toLowerCase().includes(query) ||
        result.subtitle.toLowerCase().includes(query) ||
        result.description.toLowerCase().includes(query) ||
        result.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Filter by status
    if (filters.status && filters.status.length > 0) {
      filteredResults = filteredResults.filter(result =>
        filters.status!.includes(result.status)
      );
    }

    // Filter by date range
    if (filters.dateRange) {
      const startDate = new Date(filters.dateRange.start);
      const endDate = new Date(filters.dateRange.end);
      filteredResults = filteredResults.filter(result =>
        result.createdAt >= startDate && result.createdAt <= endDate
      );
    }

    // Filter by skills/tags
    if (filters.skills && filters.skills.length > 0) {
      filteredResults = filteredResults.filter(result =>
        filters.skills!.some(skill =>
          result.tags.some(tag => tag.toLowerCase().includes(skill.toLowerCase()))
        )
      );
    }

    // Filter by location
    if (filters.location) {
      filteredResults = filteredResults.filter(result =>
        result.metadata.location?.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }

    // Filter by department
    if (filters.department) {
      filteredResults = filteredResults.filter(result =>
        result.metadata.department?.toLowerCase().includes(filters.department!.toLowerCase())
      );
    }

    // Filter by education
    if (filters.education && filters.education.length > 0) {
      filteredResults = filteredResults.filter(result =>
        filters.education!.some(edu =>
          result.metadata.university?.toLowerCase().includes(edu.toLowerCase()) ||
          result.metadata.major?.toLowerCase().includes(edu.toLowerCase())
        )
      );
    }

    // Apply sorting
    filteredResults.sort((a, b) => {
      let comparison = 0;

      switch (filters.sortBy) {
        case 'relevance':
          comparison = b.relevanceScore - a.relevanceScore;
          break;
        case 'date':
          comparison = b.createdAt.getTime() - a.createdAt.getTime();
          break;
        case 'updated':
          comparison = b.updatedAt.getTime() - a.updatedAt.getTime();
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        default:
          comparison = b.relevanceScore - a.relevanceScore;
      }

      return filters.sortOrder === 'asc' ? -comparison : comparison;
    });

    // Apply pagination
    const startIndex = (filters.page! - 1) * filters.limit!;
    const endIndex = startIndex + filters.limit!;
    const paginatedResults = filteredResults.slice(startIndex, endIndex);

    // Generate facets for filtering UI
    const facets = generateFacets(mockSearchResults, filters);

    return NextResponse.json({
      success: true,
      data: {
        results: paginatedResults,
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total: filteredResults.length,
          totalPages: Math.ceil(filteredResults.length / filters.limit!),
          hasNext: endIndex < filteredResults.length,
          hasPrev: filters.page! > 1
        },
        facets,
        filters: filters
      }
    });

  } catch (error) {
    console.error('Error performing search:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// POST saved search
export async function POST(request: NextRequest) {
  try {
    const searchData = await request.json();

    // Validate required fields
    if (!searchData.name || !searchData.filters) {
      return NextResponse.json(
        {
          success: false,
          error: 'Name and filters are required'
        },
        { status: 400 }
      );
    }

    const savedSearch = {
      id: `search-${Date.now()}`,
      name: searchData.name,
      description: searchData.description || '',
      filters: searchData.filters,
      isDefault: searchData.isDefault || false,
      notifications: searchData.notifications || false,
      createdBy: 'current-user', // In real app, get from auth
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // In a real application, save to database
    console.log('Saved search created:', savedSearch);

    return NextResponse.json({
      success: true,
      data: savedSearch,
      message: 'Search saved successfully'
    });

  } catch (error) {
    console.error('Error saving search:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// Generate facets for filtering UI
function generateFacets(results: SearchResult[], currentFilters: SearchFilters) {
  const facets = {
    types: {} as Record<string, number>,
    statuses: {} as Record<string, number>,
    skills: {} as Record<string, number>,
    locations: {} as Record<string, number>,
    departments: {} as Record<string, number>,
    universities: {} as Record<string, number>
  };

  results.forEach(result => {
    // Count types
    facets.types[result.type] = (facets.types[result.type] || 0) + 1;

    // Count statuses
    facets.statuses[result.status] = (facets.statuses[result.status] || 0) + 1;

    // Count skills/tags
    result.tags.forEach(tag => {
      facets.skills[tag] = (facets.skills[tag] || 0) + 1;
    });

    // Count locations
    if (result.metadata.location) {
      facets.locations[result.metadata.location] = (facets.locations[result.metadata.location] || 0) + 1;
    }

    // Count departments
    if (result.metadata.department) {
      facets.departments[result.metadata.department] = (facets.departments[result.metadata.department] || 0) + 1;
    }

    // Count universities
    if (result.metadata.university) {
      facets.universities[result.metadata.university] = (facets.universities[result.metadata.university] || 0) + 1;
    }
  });

  return facets;
}
