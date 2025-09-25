import { MongoClient } from 'mongodb';

const client = new MongoClient('mongodb+srv://saino365forweb_db_user:dgBXwQFyUwI6LBnI@cluster0.tffyagz.mongodb.net/jobfinder?retryWrites=true&w=majority&appName=Cluster0');

try {
  await client.connect();
  const db = client.db();
  
  const result = await db.collection('users').updateOne(
    { email: 'comp1.owner@example.com' },
    { 
      $set: { isEmailVerified: true },
      $unset: { emailVerificationToken: '', emailVerificationExpires: '' }
    }
  );
  
  console.log('Updated:', result.modifiedCount, 'users');
  
  const user = await db.collection('users').findOne({ email: 'comp1.owner@example.com' });
  console.log('User verified:', user?.isEmailVerified);
  
} catch (error) {
  console.error('Error:', error);
} finally {
  await client.close();
}
