import { MongoClient } from 'mongodb';
import crypto from 'crypto';

const MONGODB_URI = 'mongodb+srv://saino365forweb_db_user:dgBXwQFyUwI6LBnI@cluster0.tffyagz.mongodb.net/jobfinder?retryWrites=true&w=majority&appName=Cluster0';

async function createVerificationToken() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const token = crypto.randomBytes(24).toString('hex');
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    const result = await db.collection('users').updateOne(
      { email: 'sesagi153@gmail.com' },
      { 
        $set: { 
          emailVerificationToken: token + ':' + code,
          emailVerificationExpires: expires,
          isEmailVerified: false
        }
      }
    );
    
    console.log('Updated user:', result.modifiedCount);
    console.log('New token:', token);
    console.log('Full token:', token + ':' + code);
    console.log('Expires:', expires);
    console.log('Verification URL: http://localhost:3000/verify-email?token=' + token + '&email=sesagi153%40gmail.com&forCompany=1');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

createVerificationToken();
