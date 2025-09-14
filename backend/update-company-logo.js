const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://saino365forweb_db_user:dgBXwQFyUwI6LBnI@cluster0.tffyagz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

async function updateCompanyLogo() {
  let client;

  try {
    // Connect to MongoDB
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db();
    const usersCollection = db.collection('users');

    // Update companies with actual uploaded logos from S3
    const logoUpdates = [
      {
        companyId: '68c51b90eab5ced8a2b1c579', // BABI SDN BHD
        logoPath: 'company-logos/68c51b90eab5ced8a2b1c579/logo_68c51b90eab5ced8a2b1c579_46fd76b5-69c4-4948-ab1e-4f35a4db7036.jpg'
      }
      // Note: 68c4d5ad5bf53fe6f9339b95 doesn't exist in our company list
    ];

    for (const update of logoUpdates) {
      console.log(`Updating company ${update.companyId} with logo: ${update.logoPath}`);

      const result = await usersCollection.updateOne(
        { _id: new ObjectId(update.companyId) },
        {
          $set: {
            'company.logo': update.logoPath,
            updatedAt: new Date()
          }
        }
      );

      if (result.matchedCount === 0) {
        console.log(`❌ Company ${update.companyId} not found`);
      } else if (result.modifiedCount === 0) {
        console.log(`⚠️ Company ${update.companyId} found but not modified (logo might already be set)`);
      } else {
        console.log(`✅ Company ${update.companyId} logo updated successfully!`);
      }
    }

    // Let's also add logos to the dummy companies for demonstration
    const dummyLogos = [
      {
        id: 'dummy1',
        logo: 'https://via.placeholder.com/64x64/3B82F6/FFFFFF?text=TS'
      },
      {
        id: 'dummy2',
        logo: 'https://via.placeholder.com/64x64/10B981/FFFFFF?text=GE'
      }
    ];

    // Note: Dummy companies are hardcoded in the service, not in database
    console.log('Note: Dummy companies are hardcoded and would need to be updated in the service file');

  } catch (error) {
    console.error('Error updating company logo:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('MongoDB connection closed');
    }
  }
}

// Run the update
updateCompanyLogo();
