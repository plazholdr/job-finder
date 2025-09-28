#!/usr/bin/env node

import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://saino365forweb_db_user:dgBXwQFyUwI6LBnI@cluster0.tffyagz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Job Listing schema
const jobListingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  requirements: [String],
  responsibilities: [String],
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'companies', required: true },
  location: {
    city: String,
    state: String,
    country: { type: String, default: 'Malaysia' }
  },
  salaryRange: {
    min: Number,
    max: Number,
    currency: { type: String, default: 'MYR' }
  },
  duration: {
    months: Number,
    startDate: Date,
    endDate: Date
  },
  status: { type: Number, enum: [0, 1, 2, 3], default: 1 }, // 1 = approved/active
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users' }
}, {
  timestamps: true
});

const JobListings = mongoose.model('joblistings', jobListingSchema);

async function createSampleJobs() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Company ID for "voter1 sdn bhd"
    const companyId = '68d552d829197a16d774d748';
    const createdBy = '68d5527629197a16d774d716'; // Owner user ID

    // Check if jobs already exist
    const existingJobs = await JobListings.find({ companyId });
    console.log(`Found ${existingJobs.length} existing jobs for this company`);

    if (existingJobs.length >= 3) {
      console.log('✅ Company already has enough sample jobs');
      return;
    }

    // Sample job data
    const sampleJobs = [
      {
        title: 'Software Engineer',
        description: 'Join our dynamic team as a Software Engineer. You will be responsible for developing and maintaining web applications using modern technologies.',
        requirements: [
          'Bachelor\'s degree in Computer Science or related field',
          'Experience with JavaScript, React, Node.js',
          'Knowledge of database systems',
          'Strong problem-solving skills'
        ],
        responsibilities: [
          'Develop and maintain web applications',
          'Collaborate with cross-functional teams',
          'Write clean, maintainable code',
          'Participate in code reviews'
        ],
        companyId,
        location: {
          city: 'Kuala Lumpur',
          state: 'Selangor',
          country: 'Malaysia'
        },
        salaryRange: {
          min: 4000,
          max: 7000,
          currency: 'MYR'
        },
        duration: {
          months: 6,
          startDate: new Date('2025-01-01'),
          endDate: new Date('2025-06-30')
        },
        status: 1,
        createdBy
      },
      {
        title: 'Senior Data Engineer',
        description: 'We are looking for an experienced Data Engineer to join our data team. You will work on building and optimizing data pipelines.',
        requirements: [
          'Bachelor\'s degree in Engineering or related field',
          'Experience with Python, SQL, Apache Spark',
          'Knowledge of cloud platforms (AWS, Azure)',
          'Experience with data warehousing'
        ],
        responsibilities: [
          'Design and build data pipelines',
          'Optimize data processing workflows',
          'Ensure data quality and reliability',
          'Collaborate with data scientists'
        ],
        companyId,
        location: {
          city: 'Petaling Jaya',
          state: 'Selangor',
          country: 'Malaysia'
        },
        salaryRange: {
          min: 6000,
          max: 10000,
          currency: 'MYR'
        },
        duration: {
          months: 12,
          startDate: new Date('2025-02-01'),
          endDate: new Date('2026-01-31')
        },
        status: 1,
        createdBy
      },
      {
        title: 'Senior Sales Executive',
        description: 'Join our sales team and help drive business growth. You will be responsible for managing client relationships and closing deals.',
        requirements: [
          'Bachelor\'s degree in Business or related field',
          'Minimum 3 years sales experience',
          'Excellent communication skills',
          'Proven track record in B2B sales'
        ],
        responsibilities: [
          'Manage client relationships',
          'Identify new business opportunities',
          'Prepare sales proposals',
          'Meet sales targets'
        ],
        companyId,
        location: {
          city: 'Kuala Lumpur',
          state: 'Kuala Lumpur',
          country: 'Malaysia'
        },
        salaryRange: {
          min: 5000,
          max: 8000,
          currency: 'MYR'
        },
        duration: {
          months: 12,
          startDate: new Date('2025-01-15'),
          endDate: new Date('2026-01-14')
        },
        status: 1,
        createdBy
      },
      {
        title: 'MT Senior Analytics Engineer',
        description: 'We are seeking a talented Analytics Engineer to join our team. You will work on building analytics solutions and dashboards.',
        requirements: [
          'Bachelor\'s degree in Analytics, Statistics, or related field',
          'Experience with SQL, Python, R',
          'Knowledge of BI tools (Tableau, Power BI)',
          'Strong analytical thinking'
        ],
        responsibilities: [
          'Build analytics dashboards',
          'Analyze business metrics',
          'Create data visualizations',
          'Support business decision making'
        ],
        companyId,
        location: {
          city: 'Cyberjaya',
          state: 'Selangor',
          country: 'Malaysia'
        },
        salaryRange: {
          min: 5500,
          max: 9000,
          currency: 'MYR'
        },
        duration: {
          months: 18,
          startDate: new Date('2025-03-01'),
          endDate: new Date('2026-08-31')
        },
        status: 1,
        createdBy
      }
    ];

    // Insert only new jobs
    const jobsToCreate = sampleJobs.slice(0, Math.max(0, 4 - existingJobs.length));
    
    if (jobsToCreate.length > 0) {
      const result = await JobListings.insertMany(jobsToCreate);
      console.log(`✅ Created ${result.length} sample jobs for voter1 sdn bhd`);
      
      result.forEach((job, index) => {
        console.log(`${index + 1}. ${job.title} - ${job.location.city}, ${job.location.state}`);
        console.log(`   Salary: RM ${job.salaryRange.min} - RM ${job.salaryRange.max}`);
        console.log(`   Duration: ${job.duration.months} months`);
        console.log('');
      });
    } else {
      console.log('No new jobs needed');
    }
    
  } catch (error) {
    console.error('❌ Error creating sample jobs:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

console.log('🔧 Creating sample jobs for voter1 sdn bhd...');
createSampleJobs();
