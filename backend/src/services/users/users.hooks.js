const { authenticate } = require('@feathersjs/authentication').hooks;
const { hashPassword, protect } = require('@feathersjs/authentication-local').hooks;
const { disallow, iff, isProvider } = require('feathers-hooks-common');
const mongoose = require('mongoose');
const { getCompanyForUser, hasAcceptedInvite, maskStudent } = require('../../utils/access');

async function maskForCompanies(context) {
  // Only apply when requester is a company and viewing other users
  const requester = context.params && context.params.user;
  if (!requester || requester.role !== 'company') return context;

  const company = await getCompanyForUser(context.app, requester._id);
  const companyId = company && company._id;

  const applyMask = async (record) => {
    if (!record || (record._id && record._id.toString() === requester._id.toString())) return record;
    if (record.role !== 'student') return record;
    if (!companyId) return maskStudent(record);
    const ok = await hasAcceptedInvite(context.app, new mongoose.Types.ObjectId(companyId), new mongoose.Types.ObjectId(record._id));
    return ok ? record : maskStudent(record);
  };

  if (Array.isArray(context.result && context.result.data)) {
    const data = context.result.data;
    context.result.data = await Promise.all(data.map(applyMask));
  } else if (Array.isArray(context.result)) {
    context.result = await Promise.all(context.result.map(applyMask));
  } else {
    context.result = await applyMask(context.result);
  }
  return context;
}

module.exports = {
  before: {
    all: [],
    find: [ iff(isProvider('external'), authenticate('jwt')) ],
    get: [ iff(isProvider('external'), authenticate('jwt')) ],
    create: [
      hashPassword('password'),
      // Normalize username/email and validate
      (context) => {
        const data = context.data || {};
        const { email, password } = data;
        if (!email && !data.username) {
          throw new Error('Email or username is required');
        }
        if (!password) {
          throw new Error('Password is required');
        }
        // Default role to student if not provided
        if (!data.role) data.role = 'student';
        // If username not given, use email (or lowercase of provided username)
        const identifier = (data.username || data.email || '').toLowerCase();
        data.username = identifier;
        if (!data.email) data.email = identifier; // allow login by either
        context.data = data;
      }
    ],
    update: [
      disallow('external'),
      hashPassword('password')
    ],
    patch: [
      authenticate('jwt'),
      iff(
        isProvider('external'),
        // Users can only update their own profile
        (context) => {
          if (context.params.user.role !== 'admin') {
            context.id = context.params.user._id;
          }
        }
      ),
      hashPassword('password')
    ],
    remove: [
      authenticate('jwt'),
      iff(
        isProvider('external'),
        // Only admins can delete users, or users can delete themselves
        (context) => {
          if (context.params.user.role !== 'admin') {
            context.id = context.params.user._id;
          }
        }
      )
    ]
  },

  after: {
    all: [
      // Make sure the password field is never sent to the client
      protect('password')
    ],
    find: [ maskForCompanies ],
    get: [ maskForCompanies ],
    create: [
      // Send welcome email or verification email here
      (context) => {
        // TODO: Implement email verification
        console.log('User created:', context.result.email);
      }
    ],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
