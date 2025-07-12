import { NextRequest, NextResponse } from 'next/server';

interface Program {
  id: string;
  universityId: string;
  name: string;
  faculty: string;
  level: 'undergraduate' | 'graduate' | 'doctoral';
  degree: string;
  duration: number; // in years
  description: string;
  requirements: string[];
  tuition: {
    inState?: number;
    outOfState?: number;
    international?: number;
  };
  candidatesCount: number;
  isActive: boolean;
  createdAt: Date;
}

// Mock programs data
const mockPrograms: Program[] = [
  // UC Berkeley Programs
  {
    id: 'prog-1',
    universityId: 'univ-1',
    name: 'Computer Science',
    faculty: 'College of Engineering',
    level: 'undergraduate',
    degree: 'Bachelor of Science',
    duration: 4,
    description: 'Comprehensive computer science program covering algorithms, software engineering, and systems.',
    requirements: ['Mathematics', 'Physics', 'Programming Experience'],
    tuition: { inState: 14226, outOfState: 44007, international: 44007 },
    candidatesCount: 45,
    isActive: true,
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'prog-2',
    universityId: 'univ-1',
    name: 'Data Science',
    faculty: 'College of Computing, Data Science, and Society',
    level: 'graduate',
    degree: 'Master of Information and Data Science',
    duration: 2,
    description: 'Interdisciplinary program combining statistics, computer science, and domain expertise.',
    requirements: ['Statistics', 'Programming', 'Linear Algebra'],
    tuition: { inState: 26544, outOfState: 26544, international: 26544 },
    candidatesCount: 32,
    isActive: true,
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'prog-3',
    universityId: 'univ-1',
    name: 'Business Administration',
    faculty: 'Haas School of Business',
    level: 'graduate',
    degree: 'Master of Business Administration',
    duration: 2,
    description: 'Full-time MBA program with focus on innovation and leadership.',
    requirements: ['GMAT/GRE', 'Work Experience', 'Essays'],
    tuition: { inState: 68444, outOfState: 68444, international: 68444 },
    candidatesCount: 28,
    isActive: true,
    createdAt: new Date('2024-01-01')
  },
  
  // Stanford Programs
  {
    id: 'prog-4',
    universityId: 'univ-2',
    name: 'Computer Science',
    faculty: 'School of Engineering',
    level: 'undergraduate',
    degree: 'Bachelor of Science',
    duration: 4,
    description: 'World-class computer science program with emphasis on innovation and research.',
    requirements: ['Mathematics', 'Physics', 'Programming'],
    tuition: { inState: 56169, outOfState: 56169, international: 56169 },
    candidatesCount: 38,
    isActive: true,
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'prog-5',
    universityId: 'univ-2',
    name: 'Artificial Intelligence',
    faculty: 'School of Engineering',
    level: 'graduate',
    degree: 'Master of Science',
    duration: 2,
    description: 'Advanced AI program covering machine learning, robotics, and natural language processing.',
    requirements: ['Computer Science Background', 'Linear Algebra', 'Statistics'],
    tuition: { inState: 58416, outOfState: 58416, international: 58416 },
    candidatesCount: 25,
    isActive: true,
    createdAt: new Date('2024-01-01')
  },
  
  // MIT Programs
  {
    id: 'prog-6',
    universityId: 'univ-3',
    name: 'Electrical Engineering and Computer Science',
    faculty: 'School of Engineering',
    level: 'undergraduate',
    degree: 'Bachelor of Science',
    duration: 4,
    description: 'Integrated program combining electrical engineering and computer science.',
    requirements: ['Mathematics', 'Physics', 'Chemistry'],
    tuition: { inState: 57986, outOfState: 57986, international: 57986 },
    candidatesCount: 42,
    isActive: true,
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'prog-7',
    universityId: 'univ-3',
    name: 'Management Science',
    faculty: 'MIT Sloan School of Management',
    level: 'graduate',
    degree: 'Master of Business Administration',
    duration: 2,
    description: 'MBA program focused on technology and innovation management.',
    requirements: ['GMAT/GRE', 'Work Experience', 'Leadership Experience'],
    tuition: { inState: 84300, outOfState: 84300, international: 84300 },
    candidatesCount: 18,
    isActive: true,
    createdAt: new Date('2024-01-01')
  },
  
  // Carnegie Mellon Programs
  {
    id: 'prog-8',
    universityId: 'univ-4',
    name: 'Computer Science',
    faculty: 'School of Computer Science',
    level: 'undergraduate',
    degree: 'Bachelor of Science',
    duration: 4,
    description: 'Top-ranked computer science program with strong industry connections.',
    requirements: ['Mathematics', 'Programming', 'Problem Solving'],
    tuition: { inState: 59864, outOfState: 59864, international: 59864 },
    candidatesCount: 35,
    isActive: true,
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'prog-9',
    universityId: 'univ-4',
    name: 'Information Systems',
    faculty: 'Heinz College',
    level: 'graduate',
    degree: 'Master of Information Systems Management',
    duration: 2,
    description: 'Technology management program bridging business and IT.',
    requirements: ['Technical Background', 'GRE/GMAT', 'Work Experience'],
    tuition: { inState: 48500, outOfState: 48500, international: 48500 },
    candidatesCount: 22,
    isActive: true,
    createdAt: new Date('2024-01-01')
  },
  
  // University of Washington Programs
  {
    id: 'prog-10',
    universityId: 'univ-5',
    name: 'Computer Science',
    faculty: 'Paul G. Allen School of Computer Science & Engineering',
    level: 'undergraduate',
    degree: 'Bachelor of Science',
    duration: 4,
    description: 'Comprehensive CS program with strong research opportunities.',
    requirements: ['Mathematics', 'Science', 'Programming'],
    tuition: { inState: 12092, outOfState: 39906, international: 39906 },
    candidatesCount: 40,
    isActive: true,
    createdAt: new Date('2024-01-01')
  }
];

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const universityId = params.id;
    const { searchParams } = new URL(request.url);
    const faculty = searchParams.get('faculty');
    const level = searchParams.get('level');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    // Filter programs by university
    let filteredPrograms = mockPrograms.filter(program => program.universityId === universityId);

    // Apply faculty filter
    if (faculty) {
      filteredPrograms = filteredPrograms.filter(program =>
        program.faculty.toLowerCase().includes(faculty.toLowerCase())
      );
    }

    // Apply level filter
    if (level && level !== 'all') {
      filteredPrograms = filteredPrograms.filter(program => program.level === level);
    }

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredPrograms = filteredPrograms.filter(program =>
        program.name.toLowerCase().includes(searchLower) ||
        program.faculty.toLowerCase().includes(searchLower) ||
        program.description.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    filteredPrograms.sort((a, b) => {
      let aValue: any = a[sortBy as keyof Program];
      let bValue: any = b[sortBy as keyof Program];

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'desc') {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      } else {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      }
    });

    return NextResponse.json({
      success: true,
      data: filteredPrograms,
      total: filteredPrograms.length
    });

  } catch (error) {
    console.error('Error fetching programs:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
