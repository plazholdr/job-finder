const mongoose = require('mongoose');

async function getCompanyForUser(app, userId) {
  const Companies = require('../models/companies.model');
  return Companies.findOne({ ownerUserId: new mongoose.Types.ObjectId(userId) });
}

async function isCompanyVerified(app, userId) {
  const company = await getCompanyForUser(app, userId);
  if (!company) return { ok: false, company: null };
  return { ok: company.verifiedStatus === 'approved', company };
}

async function hasAcceptedInvite(app, companyId, userId) {
  const Invites = require('../models/invites.model');
  const invite = await Invites.findOne({ companyId, userId, status: 'accepted' });
  return !!invite;
}

// Apply privacy masking for student profiles when viewed by companies
function maskStudent(record) {
  if (!record || record.role !== 'student') return record;
  const r = record.toObject ? record.toObject() : { ...record };
  const privacy = r.privacySetting || 'full';

  if (privacy === 'private') {
    // Caller should already filter out private in list; for safety, return minimal stub
    return { _id: r._id, role: r.role, privacySetting: 'private' };
  }

  // Base masking (hide sensitive academic docs)
  if (r.internProfile) {
    delete r.internProfile.gpa;
    delete r.internProfile.resume;
    delete r.internProfile.portfolio;
  }

  if (privacy === 'restricted') {
    // Hide identity/contact
    delete r.email;
    if (r.profile) {
      delete r.profile.phone;
      delete r.profile.firstName;
      delete r.profile.lastName;
    }
  } else {
    // full: still hide phone only
    if (r.profile) {
      delete r.profile.phone;
    }
  }
  return r;
}

module.exports = { getCompanyForUser, isCompanyVerified, hasAcceptedInvite, maskStudent };

