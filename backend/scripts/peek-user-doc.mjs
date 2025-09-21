import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Users from '../src/models/users.model.js';

dotenv.config();

const uri = process.env.MONGODB_URI;
const email = process.argv[2];

async function main() {
  await mongoose.connect(uri);
  const doc = await Users.findOne({ email: email.toLowerCase() });
  if (!doc) { console.log('User not found'); return; }
  console.log('raw password present?', !!doc.password);
  const json = doc.toJSON();
  console.log('after toJSON, password present?', 'password' in json);
  console.log('keys', Object.keys(json).slice(0,10));
  await mongoose.disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });

