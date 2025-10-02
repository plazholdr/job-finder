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
}

async function createUser({ email, password, role = 'company', profile = {} }) {
  const existing = await Users.findOne({ email }).lean();
  if (existing) {
    console.log(`⚠️  User ${email} already exists, using existing user`);
    return existing;
  }
  const hashed = await bcrypt.hash(password, 10);
  const doc = await Users.create({
    email,
    username: email.split('@')[0].toLowerCase(),
    password: hashed,
    role,
    profile,
    isEmailVerified: true
  });
  console.log(`✅ Created user: ${email}`);
  return doc.toObject();
}

async function createCompany(data) {
  const existing = await Companies.findOne({ registrationNumber: data.registrationNumber }).lean();
  if (existing) {
    console.log(`⚠️  Company ${data.name} already exists, using existing company`);
    return existing;
  }
  const doc = await Companies.create({
    ...data,
    verifiedStatus: VERIFICATION_STATUS.APPROVED,
    submittedAt: new Date(),
    reviewedAt: new Date()
  });
  console.log(`✅ Created company: ${data.name}`);
  return doc.toObject();
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

async function createJob(data) {
  const doc = await JobListings.create({
    ...data,
    status: JobListingStatus.ACTIVE,
    publishAt: minusDays(5),
    expiresAt: plusDays(25),
    submittedAt: minusDays(7),
    approvedAt: minusDays(5)
  });
  console.log(`✅ Created job: ${data.title}`);
  return doc.toObject();
}

async function main() {
  try {
    await connect();

    // Create 3 company owner users
    const owner1 = await createUser({
      email: 'techvision@example.com',
      password: 'Password123!',
      role: 'company',
      profile: {
        firstName: 'Sarah',
        lastName: 'Lim',
        phone: '+60123456789'
      }
    });

    const owner2 = await createUser({
      email: 'greenearth@example.com',
      password: 'Password123!',
      role: 'company',
      profile: {
        firstName: 'Ahmad',
        lastName: 'Hassan',
        phone: '+60198765432'
      }
    });

    const owner3 = await createUser({
      email: 'financefirst@example.com',
      password: 'Password123!',
      role: 'company',
      profile: {
        firstName: 'Michelle',
        lastName: 'Tan',
        phone: '+60167891234'
      }
    });

    // Create Company 1: TechVision Solutions Sdn Bhd
    const company1 = await createCompany({
      ownerUserId: owner1._id,
      name: 'TechVision Solutions Sdn Bhd',
      registrationNumber: '202301234567',
      industry: 'Information Technology',
      size: '51-200 employees',
      website: 'https://techvision.com.my',
      logoKey: 'companies/techvision-logo.png',
      description: 'TechVision Solutions is a leading software development company specializing in enterprise solutions, mobile applications, and cloud services. We work with clients across Southeast Asia to deliver innovative technology solutions that drive business growth.',
      email: 'hr@techvision.com.my',
      phone: '+603-2123-4567',
      picName: 'Jennifer Wong',
      picEmail: 'jennifer.wong@techvision.com.my',
      picPhone: '+60123456789',
      address: {
        street: 'Level 15, Menara TechHub, Jalan Ampang',
        city: 'Kuala Lumpur',
        state: 'Wilayah Persekutuan',
        country: 'Malaysia',
        zipCode: '50450',
        fullAddress: 'Level 15, Menara TechHub, Jalan Ampang, 50450 Kuala Lumpur, Wilayah Persekutuan, Malaysia'
      }
    });

    // Create Company 2: GreenEarth Manufacturing Sdn Bhd
    const company2 = await createCompany({
      ownerUserId: owner2._id,
      name: 'GreenEarth Manufacturing Sdn Bhd',
      registrationNumber: '202201987654',
      industry: 'Manufacturing',
      size: '201-500 employees',
      website: 'https://greenearth.com.my',
      logoKey: 'companies/greenearth-logo.png',
      description: 'GreenEarth Manufacturing is committed to sustainable manufacturing practices. We produce eco-friendly packaging solutions and biodegradable products for the ASEAN market. Our state-of-the-art facility in Penang combines innovation with environmental responsibility.',
      email: 'careers@greenearth.com.my',
      phone: '+604-6543-2109',
      picName: 'Rajesh Kumar',
      picEmail: 'rajesh.kumar@greenearth.com.my',
      picPhone: '+60198765432',
      address: {
        street: 'Plot 25, Bayan Lepas Industrial Park',
        city: 'Penang',
        state: 'Pulau Pinang',
        country: 'Malaysia',
        zipCode: '11900',
        fullAddress: 'Plot 25, Bayan Lepas Industrial Park, 11900 Penang, Pulau Pinang, Malaysia'
      }
    });

    // Create Company 3: FinanceFirst Advisory Sdn Bhd
    const company3 = await createCompany({
      ownerUserId: owner3._id,
      name: 'FinanceFirst Advisory Sdn Bhd',
      registrationNumber: '202101456789',
      industry: 'Financial Services',
      size: '11-50 employees',
      website: 'https://financefirst.com.my',
      logoKey: 'companies/financefirst-logo.png',
      description: 'FinanceFirst Advisory provides comprehensive financial planning, investment advisory, and corporate finance services. Our team of certified financial planners helps individuals and businesses achieve their financial goals through strategic planning and expert guidance.',
      email: 'info@financefirst.com.my',
      phone: '+607-3344-5566',
      picName: 'David Chong',
      picEmail: 'david.chong@financefirst.com.my',
      picPhone: '+60167891234',
      address: {
        street: 'Suite 8-3, Menara Ansar, Jalan Trus',
        city: 'Johor Bahru',
        state: 'Johor',
        country: 'Malaysia',
        zipCode: '80000',
        fullAddress: 'Suite 8-3, Menara Ansar, Jalan Trus, 80000 Johor Bahru, Johor, Malaysia'
      }
    });

    console.log('\n📋 Creating jobs for TechVision Solutions...');

    // Jobs for Company 1: TechVision Solutions
    const job1_1 = await createJob({
      companyId: company1._id,
      title: 'Full Stack Developer Intern',
      position: 'intern',
      description: 'Join our dynamic development team and gain hands-on experience building enterprise web applications. You will work with modern technologies including React, Node.js, and MongoDB, contributing to real client projects under the mentorship of senior developers.',
      quantityAvailable: 3,
      location: {
        city: 'Kuala Lumpur',
        state: 'Wilayah Persekutuan'
      },
      salaryRange: {
        min: 1500,
        max: 2000
      },
      pic: {
        name: 'Jennifer Wong',
        phone: '+60123456789',
        email: 'jennifer.wong@techvision.com.my'
      },
      project: {
        title: 'Enterprise Resource Planning System Development',
        description: 'Development of a comprehensive ERP system for a major retail client, including inventory management, sales tracking, and analytics dashboard.',
        startDate: plusDays(14),
        endDate: plusDays(104),
        locations: ['Kuala Lumpur', 'Remote'],
        roleDescription: 'Assist in frontend and backend development, participate in code reviews, write unit tests, and collaborate with the design team to implement user interfaces.',
        areasOfInterest: ['Web Development', 'Database Design', 'API Development', 'Agile Methodology']
      },
      createdBy: owner1._id
    });

    const job1_2 = await createJob({
      companyId: company1._id,
      title: 'Mobile App Development Intern',
      position: 'intern',
      description: 'Work on cutting-edge mobile applications for iOS and Android platforms. Learn React Native development while contributing to apps used by thousands of users across Malaysia and Singapore.',
      quantityAvailable: 2,
      location: {
        city: 'Kuala Lumpur',
        state: 'Wilayah Persekutuan'
      },
      salaryRange: {
        min: 1400,
        max: 1900
      },
      pic: {
        name: 'Jennifer Wong',
        phone: '+60123456789',
        email: 'jennifer.wong@techvision.com.my'
      },
      project: {
        title: 'Mobile Banking Application Enhancement',
        description: 'Enhance and maintain a mobile banking application with features including biometric authentication, real-time notifications, and seamless payment integration.',
        startDate: plusDays(21),
        endDate: plusDays(111),
        locations: ['Kuala Lumpur'],
        roleDescription: 'Develop new features for mobile apps, fix bugs, optimize performance, and ensure cross-platform compatibility. Work closely with UX designers and backend developers.',
        areasOfInterest: ['Mobile Development', 'React Native', 'UI/UX Implementation', 'API Integration']
      },
      createdBy: owner1._id
    });

    const job1_3 = await createJob({
      companyId: company1._id,
      title: 'DevOps & Cloud Infrastructure Intern',
      position: 'intern',
      description: 'Learn about cloud infrastructure, CI/CD pipelines, and DevOps practices. Gain experience with AWS, Docker, Kubernetes, and automation tools while supporting our production systems.',
      quantityAvailable: 1,
      location: {
        city: 'Kuala Lumpur',
        state: 'Wilayah Persekutuan'
      },
      salaryRange: {
        min: 1600,
        max: 2100
      },
      pic: {
        name: 'Jennifer Wong',
        phone: '+60123456789',
        email: 'jennifer.wong@techvision.com.my'
      },
      project: {
        title: 'Cloud Migration and Infrastructure Automation',
        description: 'Assist in migrating legacy applications to AWS cloud infrastructure and implementing automated deployment pipelines for faster and more reliable releases.',
        startDate: plusDays(30),
        endDate: plusDays(120),
        locations: ['Kuala Lumpur', 'Remote'],
        roleDescription: 'Set up and maintain CI/CD pipelines, monitor system performance, automate infrastructure provisioning, and assist with cloud security implementations.',
        areasOfInterest: ['Cloud Computing', 'DevOps', 'Automation', 'System Administration', 'AWS']
      },
      createdBy: owner1._id
    });

    console.log('\n📋 Creating jobs for GreenEarth Manufacturing...');

    // Jobs for Company 2: GreenEarth Manufacturing
    const job2_1 = await createJob({
      companyId: company2._id,
      title: 'Production Engineering Intern',
      position: 'intern',
      description: 'Get hands-on experience in modern manufacturing processes and production optimization. Work with our engineering team to improve efficiency, reduce waste, and implement sustainable manufacturing practices.',
      quantityAvailable: 4,
      location: {
        city: 'Penang',
        state: 'Pulau Pinang'
      },
      salaryRange: {
        min: 1200,
        max: 1700
      },
      pic: {
        name: 'Rajesh Kumar',
        phone: '+60198765432',
        email: 'rajesh.kumar@greenearth.com.my'
      },
      project: {
        title: 'Smart Factory Implementation Phase 2',
        description: 'Implementation of IoT sensors and data analytics to optimize production line efficiency and reduce material waste in our eco-friendly packaging production facility.',
        startDate: plusDays(10),
        endDate: plusDays(100),
        locations: ['Penang'],
        roleDescription: 'Monitor production processes, collect and analyze efficiency data, assist in implementing process improvements, and support the engineering team in troubleshooting production issues.',
        areasOfInterest: ['Manufacturing Engineering', 'Process Optimization', 'Quality Control', 'Sustainability', 'Industrial IoT']
      },
      createdBy: owner2._id
    });

    const job2_2 = await createJob({
      companyId: company2._id,
      title: 'Quality Assurance & Testing Intern',
      position: 'intern',
      description: 'Join our quality assurance team to ensure our products meet the highest standards. Learn about quality management systems, testing procedures, and compliance with international environmental standards.',
      quantityAvailable: 2,
      location: {
        city: 'Penang',
        state: 'Pulau Pinang'
      },
      salaryRange: {
        min: 1100,
        max: 1600
      },
      pic: {
        name: 'Rajesh Kumar',
        phone: '+60198765432',
        email: 'rajesh.kumar@greenearth.com.my'
      },
      project: {
        title: 'ISO 14001 Compliance and Quality Enhancement',
        description: 'Support the quality team in maintaining ISO 14001 environmental management certification and implementing enhanced quality control procedures for new product lines.',
        startDate: plusDays(15),
        endDate: plusDays(105),
        locations: ['Penang'],
        roleDescription: 'Conduct product testing, document quality metrics, assist in audits, analyze defect patterns, and help implement corrective actions to improve product quality.',
        areasOfInterest: ['Quality Assurance', 'Testing', 'ISO Standards', 'Environmental Compliance', 'Data Analysis']
      },
      createdBy: owner2._id
    });

    const job2_3 = await createJob({
      companyId: company2._id,
      title: 'Supply Chain & Logistics Intern',
      position: 'intern',
      description: 'Learn about sustainable supply chain management and logistics operations. Assist in optimizing our green supply chain, managing inventory, and coordinating with suppliers and distributors across the region.',
      quantityAvailable: 2,
      location: {
        city: 'Penang',
        state: 'Pulau Pinang'
      },
      salaryRange: {
        min: 1150,
        max: 1650
      },
      pic: {
        name: 'Rajesh Kumar',
        phone: '+60198765432',
        email: 'rajesh.kumar@greenearth.com.my'
      },
      project: {
        title: 'Green Supply Chain Optimization Initiative',
        description: 'Optimize supply chain operations to reduce carbon footprint, improve delivery times, and enhance supplier relationships while maintaining cost efficiency.',
        startDate: plusDays(20),
        endDate: plusDays(110),
        locations: ['Penang', 'Remote'],
        roleDescription: 'Track shipments, analyze logistics data, coordinate with suppliers, assist in inventory management, and support the implementation of sustainable procurement practices.',
        areasOfInterest: ['Supply Chain Management', 'Logistics', 'Sustainability', 'Inventory Management', 'Data Analytics']
      },
      createdBy: owner2._id
    });

    console.log('\n📋 Creating jobs for FinanceFirst Advisory...');

    // Jobs for Company 3: FinanceFirst Advisory
    const job3_1 = await createJob({
      companyId: company3._id,
      title: 'Financial Analyst Intern',
      position: 'intern',
      description: 'Gain valuable experience in financial analysis, investment research, and portfolio management. Work alongside certified financial planners to analyze market trends and prepare client reports.',
      quantityAvailable: 2,
      location: {
        city: 'Johor Bahru',
        state: 'Johor'
      },
      salaryRange: {
        min: 1300,
        max: 1800
      },
      pic: {
        name: 'David Chong',
        phone: '+60167891234',
        email: 'david.chong@financefirst.com.my'
      },
      project: {
        title: 'Investment Portfolio Analysis and Reporting System',
        description: 'Develop comprehensive investment analysis reports and assist in creating an automated portfolio tracking system for high-net-worth clients.',
        startDate: plusDays(14),
        endDate: plusDays(104),
        locations: ['Johor Bahru'],
        roleDescription: 'Conduct financial research, analyze investment opportunities, prepare client reports, assist in portfolio rebalancing, and support the team in client presentations.',
        areasOfInterest: ['Financial Analysis', 'Investment Research', 'Portfolio Management', 'Market Analysis', 'Excel Modeling']
      },
      createdBy: owner3._id
    });

    const job3_2 = await createJob({
      companyId: company3._id,
      title: 'Corporate Finance Intern',
      position: 'intern',
      description: 'Support our corporate finance team in M&A advisory, business valuation, and financial due diligence. Learn about corporate restructuring, financial modeling, and deal execution.',
      quantityAvailable: 1,
      location: {
        city: 'Johor Bahru',
        state: 'Johor'
      },
      salaryRange: {
        min: 1400,
        max: 1900
      },
      pic: {
        name: 'David Chong',
        phone: '+60167891234',
        email: 'david.chong@financefirst.com.my'
      },
      project: {
        title: 'SME Business Valuation and Advisory Services',
        description: 'Assist in conducting business valuations for small and medium enterprises seeking funding or preparing for mergers and acquisitions.',
        startDate: plusDays(21),
        endDate: plusDays(111),
        locations: ['Johor Bahru', 'Remote'],
        roleDescription: 'Build financial models, conduct industry research, prepare valuation reports, assist in due diligence processes, and support client meetings.',
        areasOfInterest: ['Corporate Finance', 'Business Valuation', 'Financial Modeling', 'M&A', 'Due Diligence']
      },
      createdBy: owner3._id
    });

    const job3_3 = await createJob({
      companyId: company3._id,
      title: 'Digital Marketing & Client Relations Intern',
      position: 'intern',
      description: 'Help grow our digital presence and support client relationship management. Create content for financial education, manage social media, and assist in organizing client seminars and webinars.',
      quantityAvailable: 2,
      location: {
        city: 'Johor Bahru',
        state: 'Johor'
      },
      salaryRange: {
        min: 1100,
        max: 1600
      },
      pic: {
        name: 'David Chong',
        phone: '+60167891234',
        email: 'david.chong@financefirst.com.my'
      },
      project: {
        title: 'Financial Literacy Campaign and Client Engagement',
        description: 'Launch a comprehensive digital marketing campaign to promote financial literacy and attract new clients through educational content and social media engagement.',
        startDate: plusDays(10),
        endDate: plusDays(100),
        locations: ['Johor Bahru', 'Remote'],
        roleDescription: 'Create social media content, write blog articles on financial topics, manage email campaigns, coordinate webinars, and support client onboarding processes.',
        areasOfInterest: ['Digital Marketing', 'Content Creation', 'Social Media', 'Client Relations', 'Financial Education']
      },
      createdBy: owner3._id
    });

    console.log('\n✅ Seed completed successfully!');
    console.log('\n📊 Summary:');
    console.table({
      'Company Owners': 3,
      'Companies': 3,
      'Job Listings': 9,
      'Total Positions': 21
    });

    console.log('\n🔐 Login Credentials:');
    console.log('Company 1 (TechVision): techvision@example.com / Password123!');
    console.log('Company 2 (GreenEarth): greenearth@example.com / Password123!');
    console.log('Company 3 (FinanceFirst): financefirst@example.com / Password123!');

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

