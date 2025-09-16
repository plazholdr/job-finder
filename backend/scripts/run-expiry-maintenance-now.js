require('dotenv').config({ path: __dirname + '/../.env' });
const { MongoClient, ObjectId } = require('mongodb');

(async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('MONGODB_URI not set in backend/.env');
      process.exit(1);
    }

    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    const db = client.db();
    const col = db.collection('jobs');

    const now = new Date();
    const sevenDaysAhead = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Backfill expiresAt for active jobs missing it
    const missing = await col.find({
      status: 'Active',
      isActive: true,
      $or: [{ expiresAt: { $exists: false } }, { expiresAt: null }]
    }).toArray();

    for (const job of missing) {
      const base = job.approvedAt ? new Date(job.approvedAt) : new Date(job.createdAt || now);
      const exp = new Date(base.getTime() + 30 * 24 * 60 * 60 * 1000);
      await col.updateOne({ _id: job._id }, { $set: { expiresAt: exp, updatedAt: now } });
      console.log('Backfilled job', job._id.toString(), 'expiresAt ->', exp.toISOString());
    }

    // Auto-expire overdue jobs
    const toExpire = await col.find({ status: 'Active', isActive: true, expiresAt: { $lt: now } }).toArray();
    for (const job of toExpire) {
      await col.updateOne(
        { _id: job._id },
        {
          $set: {
            isActive: false,
            expiredAt: now
          }
        }
      );
      console.log('Auto-expired job', job._id.toString());
    }

    // Send reminders for jobs expiring within 7 days (just mark last sent for script)
    const soon = await col.find({ status: 'Active', isActive: true, expiresAt: { $gte: now, $lte: sevenDaysAhead } }).toArray();
    for (const job of soon) {
      await col.updateOne({ _id: job._id }, { $set: { expiryReminderSentAt: now } });
      console.log('Marked reminder sent for job', job._id.toString());
    }

    // Ensure the provided job gets a near-term expiresAt to surface UI (5 days)
    const targetId = process.env.TARGET_JOB_ID || '68c7167bf3e43b0baf1eab3e';
    try {
      const exp5 = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
      const r = await col.updateOne({ _id: new ObjectId(targetId) }, { $set: { expiresAt: exp5, isActive: true, expiredAt: null, updatedAt: now } });
      if (r.modifiedCount) {
        console.log('Set demo expiresAt (5d) for', targetId, '->', exp5.toISOString());
      }
    } catch (e) {
      console.warn('Target job update skipped:', e.message);
    }

    await client.close();
    console.log('Done.');
    process.exit(0);
  } catch (err) {
    console.error('Failure:', err);
    process.exit(1);
  }
})();

