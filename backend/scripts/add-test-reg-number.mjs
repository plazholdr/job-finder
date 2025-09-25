import { MongoClient } from 'mongodb';

const client = new MongoClient('mongodb+srv://saino365forweb_db_user:dgBXwQFyUwI6LBnI@cluster0.tffyagz.mongodb.net/jobfinder?retryWrites=true&w=majority&appName=Cluster0');

try {
  await client.connect();
  const db = client.db();
  
  // Add a registration number to an existing company for testing
  const result = await db.collection('companies').updateOne(
    { name: 'TechNova Sdn Bhd' },
    { $set: { registrationNumber: '202001234567' } }
  );
  
  console.log('Updated:', result.modifiedCount, 'companies');
  
  const company = await db.collection('companies').findOne({ name: 'TechNova Sdn Bhd' });
  console.log('Company reg number:', company?.registrationNumber);
  
} catch (error) {
  console.error('Error:', error);
} finally {
  await client.close();
}
