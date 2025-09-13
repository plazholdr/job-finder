#!/usr/bin/env node
// Create or update a Super Admin user
require('dotenv').config({ path: process.env.ENV_FILE || '.env.production' });

const { connectToMongoDB, closeConnection } = require('../src/db');
const UserModel = require('../src/models/user.model');

async function main() {
  const email = process.env.SUPER_ADMIN_EMAIL || 'superadmin@jobfinder.com';
  const username = process.env.SUPER_ADMIN_USERNAME || 'superadmin';
  const password = process.env.SUPER_ADMIN_PASSWORD || 'Admin!2025#JF';
  const firstName = process.env.SUPER_ADMIN_FIRSTNAME || 'Super';
  const lastName = process.env.SUPER_ADMIN_LASTNAME || 'Admin';

  try {
    const db = await connectToMongoDB();
    const userModel = new UserModel(db);

    const existing = await userModel.collection.findOne({ $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }] });

    if (!existing) {
      const created = await userModel.create({
        email,
        username,
        password,
        firstName,
        lastName,
        role: 'admin'
      });

      await userModel.collection.updateOne(
        { _id: created._id },
        { $set: { 'admin.permissions': ['read', 'write', 'delete', 'super_admin'] } }
      );

      console.log('✅ Super admin created');
      console.log(JSON.stringify({ email, username, password }, null, 2));
    } else {
      // Update password and ensure permissions
      const updated = await userModel.updatePassword(existing._id, password);
      await userModel.collection.updateOne(
        { _id: existing._id },
        { $set: { role: 'admin', 'admin.permissions': ['read', 'write', 'delete', 'super_admin'], isActive: true } }
      );
      console.log('✅ Super admin updated');
      console.log(JSON.stringify({ email, username: existing.username || username, password }, null, 2));
    }
  } catch (err) {
    console.error('❌ Failed to create/update super admin:', err.message);
    process.exitCode = 1;
  } finally {
    try { await closeConnection(); } catch (_) {}
  }
}

main();
