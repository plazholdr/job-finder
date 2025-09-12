#!/usr/bin/env node
/*
  Backfill status codes across all relevant documents.
  - Users (role=company): verificationStatus(Code), approvalStatus(Code)
  - Offers (company.company.offers + internship.offers): add statusCode from status if missing

  Usage:
    node backend/scripts/migrate-status-codes-all.js [mongodbUri]
*/

const { ObjectId } = require('mongodb');

async function connect(uri) {
  const { MongoClient } = require('mongodb');
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  await client.connect();
  return { client, db: client.db() };
}

function norm(s) {
  return typeof s === 'string' ? s.toLowerCase() : 'pending';
}

function toCodeFromName(name) {
  if (name === 'accepted' || name === 'approved' || name === 'verified') return 1;
  if (name === 'rejected' || name === 'declined') return 2;
  return 0;
}

function normalizeVerificationName(s) {
  const n = norm(s);
  if (n === 'verified') return 'verified';
  if (n === 'rejected' || n === 'declined') return 'rejected';
  return 'pending';
}

function normalizeApprovalName(s) {
  const n = norm(s);
  if (n === 'approved' || n === 'accepted') return 'approved';
  if (n === 'rejected' || n === 'declined') return 'rejected';
  return 'pending';
}

function normalizeOfferName(s) {
  const n = norm(s);
  if (n === 'accepted') return 'accepted';
  if (n === 'rejected') return 'rejected';
  // keep other names as-is, but map their code to pending
  return n || 'pending';
}

async function migrate(uri) {
  const { client, db } = await connect(uri);
  const users = db.collection('users');

  let updatedUsers = 0;
  let updatedOffers = 0;

  // Cursor through companies
  const cursor = users.find({ role: 'company' });
  while (await cursor.hasNext()) {
    const user = await cursor.next();
    const company = user.company || {};

    // Normalize verification/approval
    const verName = normalizeVerificationName(company.verificationStatus);
    const appName = normalizeApprovalName(company.approvalStatus);

    const setFields = {
      'company.verificationStatus': verName,
      'company.verificationStatusCode': toCodeFromName(verName === 'verified' ? 'verified' : verName),
      'company.approvalStatus': appName,
      'company.approvalStatusCode': toCodeFromName(appName === 'approved' ? 'accepted' : appName),
      updatedAt: new Date(),
    };

    // Company offers array
    if (Array.isArray(company.offers)) {
      const offers = company.offers.map(o => {
        const name = normalizeOfferName(o.status || 'pending');
        const code = toCodeFromName(name);
        return { ...o, status: name, statusCode: code };
      });
      setFields['company.offers'] = offers;
      updatedOffers += company.offers.length;
    }

    // Candidate side offers (mirrors)
    // We cannot know all candidates from here; do a separate pass updating internship.offers across all users
    await users.updateOne({ _id: user._id }, { $set: setFields });
    updatedUsers++;
  }

  // Update internship.offers for all users (students)
  const studentCursor = users.find({ 'internship.offers': { $exists: true, $type: 'array' } });
  while (await studentCursor.hasNext()) {
    const user = await studentCursor.next();
    const offers = (user.internship && Array.isArray(user.internship.offers)) ? user.internship.offers.map(o => {
      const name = normalizeOfferName(o.status || 'pending');
      const code = toCodeFromName(name);
      return { ...o, status: name, statusCode: code };
    }) : [];

    await users.updateOne({ _id: user._id }, { $set: { 'internship.offers': offers, updatedAt: new Date() } });
    updatedOffers += offers.length;
  }

  console.log('Migration complete:', { updatedUsers, updatedOffers });
  await client.close();
}

(async () => {
  try {
    const uri = process.argv[2] || process.env.MONGODB_URI;
    if (!uri) {
      console.error('Provide MongoDB URI: node backend/scripts/migrate-status-codes-all.js <mongodbUri>');
      process.exit(1);
    }
    await migrate(uri);
  } catch (e) {
    console.error('Migration failed:', e.message);
    process.exit(1);
  }
})();
