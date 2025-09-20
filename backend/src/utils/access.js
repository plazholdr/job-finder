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

function maskStudent(record) {
  if (!record || record.role !== 'student') return record;
  const r = record.toObject ? record.toObject() : { ...record };
  if (r.profile) {
    delete r.profile.phone;
  }
  if (r.internProfile) {
    delete r.internProfile.gpa;
    delete r.internProfile.resume;
    delete r.internProfile.portfolio;
    // keep skills/university/major visible
  }
  return r;
}

module.exports = { getCompanyForUser, isCompanyVerified, hasAcceptedInvite, maskStudent };

