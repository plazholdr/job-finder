const { authenticate } = require('@feathersjs/authentication').hooks;

module.exports = (app) => ({
  before: {
    all: [],
    find: [ authenticate('jwt'), async (ctx) => {
      if (ctx.params.user.role !== 'admin') {
        // company owner can only see their own submissions
        ctx.params.query = ctx.params.query || {};
        ctx.params.query.submittedBy = ctx.params.user._id;
      }
    } ],
    get: [ authenticate('jwt'), async (ctx) => {
      if (ctx.params.user.role === 'admin') return;
      const doc = await app.service('company-verifications').get(ctx.id, { paginate: false });
      if (doc.submittedBy.toString() !== ctx.params.user._id.toString()) {
        throw new Error('Not authorized');
      }
    } ],
    create: [ authenticate('jwt'), async (ctx) => {
      // Only company owners can create
      if (ctx.params.user.role !== 'company') throw new Error('Only company users can submit KYC');
      ctx.data.submittedBy = ctx.params.user._id;
      ctx.data.status = 'pending';
      ctx.data.submittedAt = new Date();
    } ],
    patch: [ authenticate('jwt'), async (ctx) => {
      // Admin-only approve/reject
      if (ctx.params.user.role !== 'admin') throw new Error('Admin only');
      const { action, rejectionReason } = ctx.data;
      if (!['approve','reject'].includes(action)) throw new Error('Invalid action');
      const current = await app.service('company-verifications').get(ctx.id);
      ctx.data = { status: action === 'approve' ? 'approved' : 'rejected',
                   rejectionReason: action === 'reject' ? (rejectionReason || '') : undefined,
                   reviewedAt: new Date(), reviewerId: ctx.params.user._id };
      // Also patch company
      await app.service('companies').patch(current.companyId, {
        verifiedStatus: action === 'approve' ? 'approved' : 'rejected',
        rejectionReason: action === 'reject' ? (rejectionReason || '') : undefined,
        reviewedAt: new Date(), reviewerId: ctx.params.user._id
      });
    } ],
    remove: [ authenticate('jwt') ]
  },
  after: {
    all: [], find: [], get: [],
    create: [ async (ctx) => {
      // notify admins
      await app.service('notifications').create({
        recipientUserId: ctx.params.user._id, // optional: admins broadcast; for now, notify submitter as receipt
        recipientRole: 'company',
        type: 'kyc_submitted',
        title: 'KYC submitted',
        body: 'Your company verification has been submitted.'
      }).catch(()=>{});
    } ],
    patch: [ async (ctx) => {
      // notify owner based on updated status
      const current = await app.service('company-verifications').get(ctx.id);
      const type = ctx.result.status === 'approved' ? 'kyc_approved' : 'kyc_rejected';
      await app.service('notifications').create({
        recipientUserId: current.submittedBy,
        recipientRole: 'company',
        type,
        title: ctx.result.status === 'approved' ? 'KYC approved' : 'KYC rejected',
        body: ctx.result.status === 'approved' ? 'Your company is verified.' : (ctx.result.rejectionReason || 'Your verification was rejected.')
      }).catch(()=>{});
    } ],
    update: [], remove: []
  },
  error: { all: [], find: [], get: [], create: [], update: [], patch: [], remove: [] }
});

