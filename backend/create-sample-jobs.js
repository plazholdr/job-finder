const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config({ path: '.env.development' });

const config = {
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/job-finder-september'
  }
};

async function createSampleJobs() {
  const client = new MongoClient(config.mongodb.uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db();
    const jobsCollection = db.collection('jobs');
    const usersCollection = db.collection('users');

    // Create sample companies first
    const sampleCompanies = [
      {
        _id: new ObjectId(),
        email: 'hr@techcorp.com',
        firstName: 'Tech',
        lastName: 'Corp',
        role: 'company',
        company: {
          name: 'TechCorp Solutions',
          description: 'Leading technology company specializing in web development and cloud solutions.',
          industry: 'Technology',
          size: '100-500',
          website: 'https://techcorp.com',
          location: 'Silicon Valley, CA'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId(),
        email: 'careers@greentech.com',
        firstName: 'Green',
        lastName: 'Energy',
        role: 'company',
        company: {
          name: 'Green Energy Inc',
          description: 'Renewable energy company focused on sustainable solutions.',
          industry: 'Energy',
          size: '50-100',
          website: 'https://greenenergy.com',
          location: 'Portland, OR'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId(),
        email: 'jobs@creativestudio.com',
        firstName: 'Creative',
        lastName: 'Studio',
        role: 'company',
        company: {
          name: 'Creative Design Studio',
          description: 'Award-winning design studio creating beautiful digital experiences.',
          industry: 'Design',
          size: '10-50',
          website: 'https://creativestudio.com',
          location: 'Los Angeles, CA'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Insert sample companies
    const companyResult = await usersCollection.insertMany(sampleCompanies);
    console.log(`✅ Created ${companyResult.insertedCount} sample companies`);

    // Use the created company IDs for jobs
    const [techCorpId, greenEnergyId, creativeStudioId] = sampleCompanies.map(c => c._id);
    
    const sampleJobs = [
      {
        companyId: techCorpId,
        title: 'Software Development Intern',
        description: 'Join our dynamic development team to work on cutting-edge web applications using React, Node.js, and cloud technologies. Perfect opportunity for computer science students.',
        requirements: 'Currently enrolled in Computer Science or related field. Knowledge of JavaScript, React, and Node.js preferred.',
        location: 'Silicon Valley, CA',
        remoteWork: false,
        skills: {
          technical: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
          soft: ['Communication', 'Teamwork', 'Problem Solving'],
          languages: ['English'],
          certifications: []
        },
        salary: {
          minimum: 20,
          maximum: 25,
          currency: 'USD',
          negotiable: false,
          type: 'hourly'
        },
        duration: {
          months: 3,
          startDate: new Date('2024-06-01'),
          endDate: new Date('2024-08-31'),
          flexible: false
        },
        attachments: [],
        status: 'Active',
        statusHistory: [{
          status: 'Active',
          changedAt: new Date(),
          changedBy: techCorpId,
          reason: 'Job activated'
        }],
        views: 0,
        applications: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        submittedAt: new Date(),
        approvedAt: new Date(),
        rejectedAt: null,
        rejectionReason: null
      },
      {
        companyId: greenEnergyId,
        title: 'Data Science Intern',
        description: 'Analyze large datasets and build machine learning models to drive business insights. Work with Python, R, and cloud-based analytics platforms.',
        requirements: 'Background in Statistics, Mathematics, or Computer Science. Experience with Python and data analysis libraries.',
        location: 'New York, NY',
        remoteWork: true,
        skills: {
          technical: ['Python', 'R', 'Machine Learning', 'SQL', 'Pandas'],
          soft: ['Analytical Thinking', 'Attention to Detail', 'Communication'],
          languages: ['English'],
          certifications: []
        },
        salary: {
          minimum: 22,
          maximum: 28,
          currency: 'USD',
          negotiable: true,
          type: 'hourly'
        },
        duration: {
          months: 4,
          startDate: new Date('2024-05-15'),
          endDate: new Date('2024-09-15'),
          flexible: true
        },
        attachments: [],
        status: 'Active',
        statusHistory: [{
          status: 'Active',
          changedAt: new Date(),
          changedBy: greenEnergyId,
          reason: 'Job activated'
        }],
        views: 0,
        applications: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        submittedAt: new Date(),
        approvedAt: new Date(),
        rejectedAt: null,
        rejectionReason: null
      },
      {
        companyId: creativeStudioId,
        title: 'UX/UI Design Intern',
        description: 'Create beautiful and functional user experiences for web and mobile applications. Work with our design team on client projects and internal tools.',
        requirements: 'Portfolio demonstrating design skills. Experience with Figma, Adobe Creative Suite, or similar design tools.',
        location: 'Los Angeles, CA',
        remoteWork: false,
        skills: {
          technical: ['Figma', 'Adobe Creative Suite', 'Prototyping', 'User Research'],
          soft: ['Creativity', 'User Empathy', 'Collaboration'],
          languages: ['English'],
          certifications: []
        },
        salary: {
          minimum: 18,
          maximum: 24,
          currency: 'USD',
          negotiable: false,
          type: 'hourly'
        },
        duration: {
          months: 3,
          startDate: new Date('2024-06-01'),
          endDate: new Date('2024-08-31'),
          flexible: false
        },
        attachments: [],
        status: 'Active',
        statusHistory: [{
          status: 'Active',
          changedAt: new Date(),
          changedBy: creativeStudioId,
          reason: 'Job activated'
        }],
        views: 0,
        applications: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        submittedAt: new Date(),
        approvedAt: new Date(),
        rejectedAt: null,
        rejectionReason: null
      }
    ];
    
    // Insert sample jobs
    const result = await jobsCollection.insertMany(sampleJobs);
    console.log(`✅ Created ${result.insertedCount} sample jobs`);
    
    // Create indexes
    await jobsCollection.createIndex({ companyId: 1 });
    await jobsCollection.createIndex({ status: 1 });
    await jobsCollection.createIndex({ createdAt: -1 });
    await jobsCollection.createIndex({ companyId: 1, status: 1 });
    await jobsCollection.createIndex({ 
      title: 'text', 
      description: 'text', 
      requirements: 'text',
      'skills.technical': 'text',
      'skills.soft': 'text'
    });
    console.log('✅ Created database indexes');
    
    console.log('\n🎉 Sample jobs created successfully!');
    console.log('You should now be able to see jobs at http://localhost:3000/jobs');
    
  } catch (error) {
    console.error('❌ Error creating sample jobs:', error);
  } finally {
    await client.close();
  }
}

createSampleJobs();
