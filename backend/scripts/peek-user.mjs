import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Users from '../src/models/users.model.js';

dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/jobfinder';
const email = process.argv[2];

if (!email) {
  console.error('Usage: node scripts/peek-user.mjs <email>');
  process.exit(1);
}

async function main() {
  await mongoose.connect(uri, { dbName: undefined });
  const user = await Users.findOne({ email: email.toLowerCase() }).lean();
  if (!user) {
    console.log('User not found');
  } else {
    console.log({
      _id: user._id,
      email: user.email,
      username: user.username,
      hasPassword: Boolean(user.password),
      passwordPrefix: user.password ? String(user.password).slice(0, 7) : null,
      role: user.role,
      createdAt: user.createdAt,
    });
  }
  await mongoose.disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });

