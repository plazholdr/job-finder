import mongoose from 'mongoose';
import { config } from 'dotenv';

config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://saino365forweb_db_user:dgBXwQFyUwI6LBnI@cluster0.tffyagz.mongodb.net/jobfinder?retryWrites=true&w=majority&appName=Cluster0'

async function approveCompany(companyName) {
  try {
    console.log('=== Company Approval Tool ===\n');

    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;

    // Find the company
    let company;
    if (companyName) {
      company = await db.collection('companies').findOne({
        name: { $regex: companyName, $options: 'i' }
      });
    } else {
      // Show all pending companies
      const pendingCompanies = await db.collection('companies').find({
        verifiedStatus: 0
      }).toArray();

      if (pendingCompanies.length === 0) {
        console.log('No pending companies found.');
        return;
      }

      console.log('Pending companies:');
      pendingCompanies.forEach((comp, i) => {
        console.log(`${i + 1}. ${comp.name} (${comp.registrationNumber})`);
        console.log(`   Submitted: ${comp.submittedAt}`);
        console.log(`   Owner: ${comp.ownerUserId}`);
        console.log('');
      });

      console.log('\nTo approve a specific company, run:');
      console.log('node scripts/approve-company.mjs "Company Name"');
      return;
    }

    if (!company) {
      console.log(`Company "${companyName}" not found.`);
      return;
    }

    console.log('Found company:');
    console.log(`Name: ${company.name}`);
    console.log(`Registration: ${company.registrationNumber}`);
    console.log(`Current Status: ${company.verifiedStatus} (0=pending, 1=approved, 2=rejected)`);
    console.log(`Submitted: ${company.submittedAt}`);

    if (company.verifiedStatus === 1) {
      console.log('\n✅ Company is already approved!');
      return;
    }

    // Approve the company
    const result = await db.collection('companies').updateOne(
      { _id: company._id },
      {
        $set: {
          verifiedStatus: 1, // 1 = approved
          reviewedAt: new Date(),
          reviewerId: null // You can set this to an admin user ID if needed
        }
      }
    );

    if (result.modifiedCount > 0) {
      console.log('\n🎉 Company approved successfully!');
      console.log('The company can now sign in and access the platform.');

      // Also approve any pending verifications
      const verificationResult = await db.collection('companyverifications').updateMany(
        { companyId: company._id, status: 0 },
        {
          $set: {
            status: 1, // 1 = approved
            reviewedAt: new Date()
          }
        }
      );

      if (verificationResult.modifiedCount > 0) {
        console.log(`✅ Also approved ${verificationResult.modifiedCount} verification(s).`);
      }
    } else {
      console.log('❌ Failed to approve company.');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Get company name from command line argument
const companyName = process.argv[2];
approveCompany(companyName);
