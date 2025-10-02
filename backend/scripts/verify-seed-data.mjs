import 'dotenv/config';
import mongoose from 'mongoose';
import Users from '../src/models/users.model.js';
import Companies from '../src/models/companies.model.js';
import JobListings from '../src/models/job-listings.model.js';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jobfinder';

async function connect() {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');
}

async function main() {
  try {
    await connect();

    // Check companies
    const companies = await Companies.find({
      name: {
        $in: [
          'TechVision Solutions Sdn Bhd',
          'GreenEarth Manufacturing Sdn Bhd',
          'FinanceFirst Advisory Sdn Bhd'
        ]
      }
    }).lean();

    console.log('\n📊 Companies Found:', companies.length);
    companies.forEach(c => {
      console.log(`\n✅ ${c.name}`);
      console.log(`   Registration: ${c.registrationNumber}`);
      console.log(`   Industry: ${c.industry}`);
      console.log(`   Status: ${c.verifiedStatus === 1 ? 'APPROVED' : 'PENDING'}`);
      console.log(`   Email: ${c.email}`);
      console.log(`   Phone: ${c.phone}`);
      console.log(`   PIC: ${c.picName} (${c.picEmail})`);
      console.log(`   Address: ${c.address.fullAddress}`);
    });

    // Check jobs
    const jobs = await JobListings.find({
      companyId: { $in: companies.map(c => c._id) }
    }).populate('companyId', 'name').lean();

    console.log(`\n📋 Job Listings Found: ${jobs.length}`);
    
    const jobsByCompany = {};
    jobs.forEach(j => {
      const companyName = j.companyId.name;
      if (!jobsByCompany[companyName]) jobsByCompany[companyName] = [];
      jobsByCompany[companyName].push(j);
    });

    Object.entries(jobsByCompany).forEach(([companyName, companyJobs]) => {
      console.log(`\n🏢 ${companyName} (${companyJobs.length} jobs):`);
      companyJobs.forEach(j => {
        console.log(`   ✅ ${j.title}`);
        console.log(`      Location: ${j.location.city}, ${j.location.state}`);
        console.log(`      Salary: RM${j.salaryRange.min} - RM${j.salaryRange.max}`);
        console.log(`      Positions: ${j.quantityAvailable}`);
        console.log(`      Status: ${j.status === 2 ? 'ACTIVE' : 'OTHER'}`);
        console.log(`      PIC: ${j.pic.name} (${j.pic.email})`);
        if (j.project) {
          console.log(`      Project: ${j.project.title}`);
        }
      });
    });

    // Check users
    const users = await Users.find({
      email: {
        $in: [
          'techvision@example.com',
          'greenearth@example.com',
          'financefirst@example.com'
        ]
      }
    }).lean();

    console.log(`\n👥 Company Users Found: ${users.length}`);
    users.forEach(u => {
      console.log(`   ✅ ${u.email} (${u.role})`);
    });

    console.log('\n✅ Verification complete!');
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});

