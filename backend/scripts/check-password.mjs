import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import Users from '../src/models/users.model.js';

dotenv.config();

const uri = process.env.MONGODB_URI;
const email = process.argv[2];
const plain = process.argv[3];

if (!email || !plain) {
  console.error('Usage: node scripts/check-password.mjs <email> <plain>');
  process.exit(1);
}

async function main() {
  await mongoose.connect(uri);
  const user = await Users.findOne({ email: email.toLowerCase() }).lean();
  if (!user) {
    console.log('User not found');
  } else {
    const ok = await bcrypt.compare(plain, user.password || '');
    console.log({ ok, hash: user.password?.slice(0,30) });
  }
  await mongoose.disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });

