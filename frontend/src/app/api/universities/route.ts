import { NextRequest, NextResponse } from 'next/server';

interface University {
  id: string;
  name: string;
  location: string;
  type: 'public' | 'private';
  established: number;
  website: string;
  logo: string;
  description: string;
  ranking: number;
  studentCount: number;
  facultyCount: number;
  programsCount: number;
  contactInfo: {
    email: string;
    phone: string;
    address: string;
  };
}

// Mock universities data
const mockUniversities: University[] = [
  {
    id: 'univ-1',
    name: 'University of California, Berkeley',
    location: 'Berkeley, CA',
    type: 'public',
    established: 1868,
    website: 'https://berkeley.edu',
    logo: '/api/placeholder/64/64',
    description: 'A leading public research university known for excellence in engineering, computer science, and business.',
    ranking: 22,
    studentCount: 45057,
    facultyCount: 3065,
    programsCount: 350,
    contactInfo: {
      email: 'admissions@berkeley.edu',
      phone: '+1 (510) 642-6000',
      address: '110 Sproul Hall, Berkeley, CA 94720'
    }
  },
  {
    id: 'univ-2',
    name: 'Stanford University',
    location: 'Stanford, CA',
    type: 'private',
    established: 1885,
    website: 'https://stanford.edu',
    logo: '/api/placeholder/64/64',
    description: 'A prestigious private research university renowned for innovation and entrepreneurship.',
    ranking: 6,
    studentCount: 17249,
    facultyCount: 2279,
    programsCount: 65,
    contactInfo: {
      email: 'admission@stanford.edu',
      phone: '+1 (650) 723-2300',
      address: '450 Serra Mall, Stanford, CA 94305'
    }
  },
  {
    id: 'univ-3',
    name: 'Massachusetts Institute of Technology',
    location: 'Cambridge, MA',
    type: 'private',
    established: 1861,
    website: 'https://mit.edu',
    logo: '/api/placeholder/64/64',
    description: 'World-renowned for science, technology, engineering, and mathematics programs.',
    ranking: 2,
    studentCount: 11934,
    facultyCount: 1021,
    programsCount: 46,
    contactInfo: {
      email: 'admissions@mit.edu',
      phone: '+1 (617) 253-1000',
      address: '77 Massachusetts Avenue, Cambridge, MA 02139'
    }
  },
  {
    id: 'univ-4',
    name: 'Carnegie Mellon University',
    location: 'Pittsburgh, PA',
    type: 'private',
    established: 1900,
    website: 'https://cmu.edu',
    logo: '/api/placeholder/64/64',
    description: 'Leading university in computer science, engineering, and business.',
    ranking: 25,
    studentCount: 15818,
    facultyCount: 1482,
    programsCount: 200,
    contactInfo: {
      email: 'admission@cmu.edu',
      phone: '+1 (412) 268-2000',
      address: '5000 Forbes Avenue, Pittsburgh, PA 15213'
    }
  },
  {
    id: 'univ-5',
    name: 'University of Washington',
    location: 'Seattle, WA',
    type: 'public',
    established: 1861,
    website: 'https://washington.edu',
    logo: '/api/placeholder/64/64',
    description: 'Top public research university with strong programs in technology and medicine.',
    ranking: 59,
    studentCount: 52319,
    facultyCount: 4707,
    programsCount: 370,
    contactInfo: {
      email: 'admissions@uw.edu',
      phone: '+1 (206) 543-2100',
      address: '1410 NE Campus Parkway, Seattle, WA 98195'
    }
  },
  {
    id: 'univ-6',
    name: 'Georgia Institute of Technology',
    location: 'Atlanta, GA',
    type: 'public',
    established: 1885,
    website: 'https://gatech.edu',
    logo: '/api/placeholder/64/64',
    description: 'Premier technological university known for engineering and computer science.',
    ranking: 38,
    studentCount: 40000,
    facultyCount: 1300,
    programsCount: 130,
    contactInfo: {
      email: 'admission@gatech.edu',
      phone: '+1 (404) 894-2000',
      address: '225 North Avenue NW, Atlanta, GA 30332'
    }
  },
  {
    id: 'univ-7',
    name: 'University of Texas at Austin',
    location: 'Austin, TX',
    type: 'public',
    established: 1883,
    website: 'https://utexas.edu',
    logo: '/api/placeholder/64/64',
    description: 'Large public research university with comprehensive academic programs.',
    ranking: 42,
    studentCount: 51832,
    facultyCount: 3000,
    programsCount: 170,
    contactInfo: {
      email: 'admissions@utexas.edu',
      phone: '+1 (512) 471-3434',
      address: '110 Inner Campus Dr, Austin, TX 78712'
    }
  },
  {
    id: 'univ-8',
    name: 'New York University',
    location: 'New York, NY',
    type: 'private',
    established: 1831,
    website: 'https://nyu.edu',
    logo: '/api/placeholder/64/64',
    description: 'Global research university with campuses worldwide.',
    ranking: 30,
    studentCount: 58168,
    facultyCount: 9000,
    programsCount: 230,
    contactInfo: {
      email: 'admissions@nyu.edu',
      phone: '+1 (212) 998-1212',
      address: '4 Washington Square North, New York, NY 10003'
    }
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const type = searchParams.get('type');
    const location = searchParams.get('location');
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    let filteredUniversities = [...mockUniversities];

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredUniversities = filteredUniversities.filter(university =>
        university.name.toLowerCase().includes(searchLower) ||
        university.location.toLowerCase().includes(searchLower) ||
        university.description.toLowerCase().includes(searchLower)
      );
    }

    // Apply type filter
    if (type && type !== 'all') {
      filteredUniversities = filteredUniversities.filter(university => university.type === type);
    }

    // Apply location filter
    if (location) {
      filteredUniversities = filteredUniversities.filter(university =>
        university.location.toLowerCase().includes(location.toLowerCase())
      );
    }

    // Apply sorting
    filteredUniversities.sort((a, b) => {
      let aValue: any = a[sortBy as keyof University];
      let bValue: any = b[sortBy as keyof University];

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
      data: filteredUniversities,
      total: filteredUniversities.length
    });

  } catch (error) {
    console.error('Error fetching universities:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
