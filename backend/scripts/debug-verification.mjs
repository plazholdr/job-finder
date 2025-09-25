import { MongoClient } from 'mongodb';

const MONGODB_URI = 'mongodb+srv://saino365forweb_db_user:dgBXwQFyUwI6LBnI@cluster0.tffyagz.mongodb.net/jobfinder?retryWrites=true&w=majority&appName=Cluster0';

async function debugVerification() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    
    // Find the most recent company user
    const users = await db.collection('users').find({ 
      role: 'company',
      email: { $regex: 'sesagi153@gmail.com' }
    }).sort({ createdAt: -1 }).limit(5).toArray();
    
    console.log('\n=== Recent Company Users ===');
    users.forEach(user => {
      console.log(`Email: ${user.email}`);
      console.log(`Verified: ${user.isEmailVerified}`);
      console.log(`Token: ${user.emailVerificationToken ? 'EXISTS' : 'NONE'}`);
      console.log(`Expires: ${user.emailVerificationExpires}`);
      console.log(`Created: ${user.createdAt}`);
      console.log('---');
    });
    
    // Test token extraction from URL
    const testUrl = 'localhost:3000/verify-email?token=2c5f84634f11a56d1293bb119f507270d3e03aafbe14df&email=sesagi153%40gmail.com&forCompany=1';
    const tokenMatch = testUrl.match(/token=([^&]+)/);
    const emailMatch = testUrl.match(/email=([^&]+)/);
    
    if (tokenMatch && emailMatch) {
      const token = tokenMatch[1];
      const email = decodeURIComponent(emailMatch[1]);
      
      console.log(`\n=== URL Parsing ===`);
      console.log(`Extracted token: ${token}`);
      console.log(`Extracted email: ${email}`);
      
      // Try to find user with this token
      const userWithToken = await db.collection('users').findOne({
        email: email.toLowerCase(),
        emailVerificationToken: { $regex: token }
      });
      
      console.log(`\n=== Token Search ===`);
      if (userWithToken) {
        console.log(`Found user: ${userWithToken.email}`);
        console.log(`Full token: ${userWithToken.emailVerificationToken}`);
        console.log(`Token expires: ${userWithToken.emailVerificationExpires}`);
        console.log(`Current time: ${new Date()}`);
        console.log(`Token expired: ${new Date(userWithToken.emailVerificationExpires) < new Date()}`);
      } else {
        console.log('No user found with this token');
        
        // Try exact match
        const exactUser = await db.collection('users').findOne({ email: email.toLowerCase() });
        if (exactUser) {
          console.log(`User exists but token mismatch:`);
          console.log(`Expected: ${token}`);
          console.log(`Actual: ${exactUser.emailVerificationToken}`);
        }
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

debugVerification();
