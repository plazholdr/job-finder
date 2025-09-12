#!/usr/bin/env node
/*
  One-off migration to ensure company status codes exist alongside strings.
  Usage: node backend/scripts/migrate-status-codes.js <userId>
*/

const { ObjectId } = require('mongodb');

async function run() {
  const userIdArg = process.argv[2];
  const uriArg = process.argv[3]; // optional: mongodb uri

  if (!userIdArg) {
    console.error('Usage: node backend/scripts/migrate-status-codes.js <userId> [mongodbUri]');
    process.exit(1);
  }

  if (uriArg) {
    process.env.MONGODB_URI = uriArg;
    process.env.NODE_ENV = process.env.NODE_ENV || 'production';
  }

  // Load DB after possibly setting env
  const { connectToMongoDB, closeConnection, getDB } = require('../src/db');

  const userId = new ObjectId(userIdArg);

  try {
    await connectToMongoDB();
    const db = getDB();
    const users = db.collection('users');

    const user = await users.findOne({ _id: userId });
    if (!user) {
      console.error('User not found:', userIdArg);
      process.exit(1);
    }

    const company = user.company || {};

    const norm = (s) => (typeof s === 'string' ? s.toLowerCase() : 'pending');
    const toCode = (s) => (s === 'accepted' || s === 'approved' || s === 'verified' ? 1 : s === 'rejected' || s === 'declined' ? 2 : 0);
    const toName = (s) => (s === 'verified' ? 'verified' : s === 'approved' ? 'approved' : s === 'rejected' || s === 'declined' ? 'rejected' : 'pending');

    const verificationName = toName(norm(company.verificationStatus || 'pending'));
    const approvalName = toName(norm(company.approvalStatus || 'pending'));

    const update = {
      'company.verificationStatus': verificationName,
      'company.verificationStatusCode': toCode(verificationName === 'verified' ? 'verified' : verificationName),
      'company.approvalStatus': approvalName,
      'company.approvalStatusCode': toCode(approvalName === 'approved' ? 'accepted' : approvalName),
      updatedAt: new Date(),
    };

    await users.updateOne({ _id: userId }, { $set: update });

    console.log('Migration complete for user:', userIdArg, update);
  } catch (err) {
    console.error('Migration error:', err.message);
    process.exit(1);
  } finally {
    await closeConnection();
  }
}

run();
