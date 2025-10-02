import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Users from '../src/models/users.model.js';
import Companies from '../src/models/companies.model.js';
import JobListings from '../src/models/job-listings.model.js';
import { VERIFICATION_STATUS, JobListingStatus } from '../src/constants/enums.js';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jobfinder';

async function connect() {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');
  console.log('   Database:', mongoose.connection.db.databaseName);
}

function plusDays(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

function minusDays(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

async function main() {
  try {
    await connect();

    console.log('\n🏢 Creating Test Company User...');

    // Delete existing test users if they exist
    await Users.deleteOne({ email: 'testcompany@example.com' });
    await Users.deleteOne({ email: 'teststudent@example.com' });

    const hashed = await bcrypt.hash('Test1234!', 10);

    const companyUser = await Users.create({
      email: 'testcompany@example.com',
      username: 'testcompany',
      password: hashed,
      role: 'company',
      profile: {
        firstName: 'Test',
        lastName: 'Company Admin',
        phone: '+60123456789'
      },
      isEmailVerified: true
    });
    console.log('✅ Company user created:', companyUser.email);

    console.log('\n👨‍🎓 Creating Test Student User...');
    const studentUser = await Users.create({
      email: 'teststudent@example.com',
      username: 'teststudent',
      password: hashed,
      role: 'student',
      profile: {
        firstName: 'Test',
        lastName: 'Student',
        phone: '+60198765432'
      },
      internProfile: {
        university: 'University of Malaya',
        major: 'Computer Science',
        gpa: 3.7,
        graduationYear: 2025,
        skills: ['JavaScript', 'Python', 'React', 'Node.js'],
        preferences: {
          jobTypes: ['Full-time Internship'],
          locations: ['Kuala Lumpur', 'Selangor'],
          industries: ['Information Technology', 'Finance'],
          preferredDuration: '3 months',
          salaryRange: { min: 1200, max: 2000 }
        }
      },
      isEmailVerified: true
    });
    console.log('✅ Student user created:', studentUser.email);

    console.log('\n🏢 Creating Test Company...');

    // Delete existing test company if exists
    await Companies.deleteOne({ registrationNumber: '202399999999' });

    const company = await Companies.create({
      ownerUserId: companyUser._id,
      name: 'TestCorp Solutions Sdn Bhd',
      registrationNumber: '202399999999',
      industry: 'Information Technology',
      size: '11-50 employees',
      website: 'https://testcorp.example.com',
      logoKey: 'companies/testcorp-logo.png',
      description: 'TestCorp Solutions is a software development company focused on building innovative web and mobile applications for businesses across Malaysia.',
      email: 'hr@testcorp.example.com',
      phone: '+603-9999-8888',
      picName: 'John Doe',
      picEmail: 'john.doe@testcorp.example.com',
      picPhone: '+60123456789',
      address: {
        street: 'Level 10, Menara Test, Jalan Sultan Ismail',
        city: 'Kuala Lumpur',
        state: 'Wilayah Persekutuan',
        country: 'Malaysia',
        zipCode: '50250',
        fullAddress: 'Level 10, Menara Test, Jalan Sultan Ismail, 50250 Kuala Lumpur, Wilayah Persekutuan, Malaysia'
      },
      verifiedStatus: VERIFICATION_STATUS.APPROVED,
      submittedAt: new Date(),
      reviewedAt: new Date()
    });
    console.log('✅ Company created:', company.name);

    console.log('\n📋 Creating Test Jobs...');

    const job1 = await JobListings.create({
      companyId: company._id,
      title: 'Software Development Intern',
      position: 'intern',
      description: 'Join our development team to work on exciting web applications. You will learn modern web technologies including React, Node.js, and MongoDB while contributing to real client projects.',
      quantityAvailable: 2,
      location: {
        city: 'Kuala Lumpur',
        state: 'Wilayah Persekutuan'
      },
      salaryRange: {
        min: 1500,
        max: 2000
      },
      pic: {
        name: 'John Doe',
        phone: '+60123456789',
        email: 'john.doe@testcorp.example.com'
      },
      project: {
        title: 'E-Commerce Platform Development',
        description: 'Build a modern e-commerce platform with advanced features including real-time inventory management, payment integration, and analytics dashboard.',
        startDate: plusDays(14),
        endDate: plusDays(104),
        locations: ['Kuala Lumpur', 'Remote'],
        roleDescription: 'Develop frontend components, implement backend APIs, write tests, and participate in code reviews.',
        areasOfInterest: ['Web Development', 'Full Stack', 'E-Commerce', 'React', 'Node.js']
      },
      status: JobListingStatus.ACTIVE,
      publishAt: minusDays(3),
      expiresAt: plusDays(27),
      submittedAt: minusDays(5),
      approvedAt: minusDays(3),
      createdBy: companyUser._id
    });
    console.log('✅ Job created:', job1.title);

    const job2 = await JobListings.create({
      companyId: company._id,
      title: 'UI/UX Design Intern',
      position: 'intern',
      description: 'Work with our design team to create beautiful and intuitive user interfaces. Learn industry-standard design tools and methodologies while working on real client projects.',
      quantityAvailable: 1,
      location: {
        city: 'Kuala Lumpur',
        state: 'Wilayah Persekutuan'
      },
      salaryRange: {
        min: 1300,
        max: 1800
      },
      pic: {
        name: 'John Doe',
        phone: '+60123456789',
        email: 'john.doe@testcorp.example.com'
      },
      project: {
        title: 'Mobile App UI Redesign',
        description: 'Redesign the user interface of our flagship mobile application to improve user experience and modernize the visual design.',
        startDate: plusDays(21),
        endDate: plusDays(111),
        locations: ['Kuala Lumpur'],
        roleDescription: 'Create wireframes and mockups, conduct user research, design UI components, and collaborate with developers for implementation.',
        areasOfInterest: ['UI Design', 'UX Research', 'Mobile Design', 'Figma', 'User Testing']
      },
      status: JobListingStatus.ACTIVE,
      publishAt: minusDays(2),
      expiresAt: plusDays(28),
      submittedAt: minusDays(4),
      approvedAt: minusDays(2),
      createdBy: companyUser._id
    });
    console.log('✅ Job created:', job2.title);

    console.log('\n✅ Test data created successfully!');
    console.log('\n📊 Summary:');
    console.log('   Company: TestCorp Solutions Sdn Bhd');
    console.log('   Jobs: 2 (3 total positions)');
    console.log('   Student: Test Student');

    console.log('\n🔐 Credentials:');
    console.log('   Company Login:');
    console.log('     Email: testcompany@example.com');
    console.log('     Password: Test1234!');
    console.log('   Student Login:');
    console.log('     Email: teststudent@example.com');
    console.log('     Password: Test1234!');

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});

