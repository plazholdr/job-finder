#!/usr/bin/env node
import app from '../src/app.js';

async function run() {
  const svc = app.service('companies');
  const Model = svc.Model;
  const total = await Model.countDocuments({});
  console.log('DB companies total:', total);

  // Simulate public REST call (no auth) => should auto-filter to approved only
  const publicRes = await svc.find({ provider: 'rest', query: { $limit: 500 } });
  const pubCount = Array.isArray(publicRes) ? publicRes.length : (publicRes?.data?.length || 0);
  console.log('GET /companies (public) count:', pubCount);

  // Simulate admin REST call (optional-auth decoded, but we inject user role directly)
  const adminRes = await svc.find({
    provider: 'rest',
    headers: { authorization: 'Bearer dummy' },
    user: { _id: '000000000000000000000000', role: 'admin' },
    query: { $limit: 500 }
  });
  const adminCount = Array.isArray(adminRes) ? adminRes.length : (adminRes?.data?.length || 0);
  console.log('GET /companies (admin) count:', adminCount);

  // Show a sample pending item if exists
  const items = Array.isArray(adminRes) ? adminRes : (adminRes?.data || []);
  const pending = items.find(x => x.verifiedStatus === 0 || x.verifiedStatus === 'pending' || x.verifiedStatus === undefined);
  if (pending) {
    console.log('Sample pending company:', { _id: pending._id?.toString?.(), name: pending.name, verifiedStatus: pending.verifiedStatus });
  }
}

run().catch(e => { console.error(e); process.exit(1); });

