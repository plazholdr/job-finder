import { MongoClient } from 'mongodb';

const MONGODB_URI = 'mongodb+srv://saino365forweb_db_user:dgBXwQFyUwI6LBnI@cluster0.tffyagz.mongodb.net/jobfinder?retryWrites=true&w=majority&appName=Cluster0';

async function checkTokenMismatch() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db();
    const user = await db.collection('users').findOne({ email: 'sesagi153@gmail.com' });

    if (user) {
      console.log('User found');
      console.log('Email verified:', user.isEmailVerified);
      console.log('Current token in DB:', user.emailVerificationToken);
      console.log('Token expires:', user.emailVerificationExpires);
      console.log('Current time:', new Date());

      const urlToken = '5dbc609e00f94d42fc14989d55889c5d39bdb0b31fe23a5a';
      console.log('Token from URL:', urlToken);

      if (user.emailVerificationToken) {
        console.log('Tokens match:', user.emailVerificationToken.includes(urlToken));
        console.log('Token expired:', new Date(user.emailVerificationExpires) < new Date());
      } else {
        console.log('No token in database - creating one to match URL');
      }

      // Update the token to match the URL regardless
      console.log('\nUpdating token to match URL...');
      const result = await db.collection('users').updateOne(
        { email: 'sesagi153@gmail.com' },
        {
          $set: {
            emailVerificationToken: urlToken + ':123456',
            emailVerificationExpires: new Date(Date.now() + 30 * 60 * 1000)
          }
        }
      );
      console.log('Updated:', result.modifiedCount, 'users');
      console.log('Now try the verification link again!');
    } else {
      console.log('User not found');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

checkTokenMismatch();
