import { hooks as authHooks } from '@feathersjs/authentication';
import Threads from '../../models/threads.model.js';
import Companies from '../../models/companies.model.js';

const { authenticate } = authHooks;

export default (app) => ({
  before: {
    all: [ authenticate('jwt') ],
    find: [ async (ctx) => {
      const threadId = ctx.params.query && ctx.params.query.threadId;
      if (!threadId) throw new Error('threadId is required');
      await ensureParticipant(app, ctx.params.user._id, threadId);
    } ],
    create: [ async (ctx) => {
      const { threadId } = ctx.data;
      if (!threadId) throw new Error('threadId required');
      await ensureParticipant(app, ctx.params.user._id, threadId);
      ctx.data.senderUserId = ctx.params.user._id;
    } ]
  },
  after: {
    all: [],
    create: [ async (ctx) => {
      // bump thread lastMessageAt and notify other participant
      await Threads.findByIdAndUpdate(ctx.result.threadId, { $set: { lastMessageAt: new Date() } });
      // TODO: create notification per participant if needed
      await app.service('notifications').create({
        recipientUserId: ctx.params.user._id, // placeholder; in real flow find the other participant
        recipientRole: 'student',
        type: 'message',
        title: 'New message',
        body: ctx.result.body || ''
      }).catch(()=>{});
    } ]
  },
  error: { }
});

async function ensureParticipant(app, userId, threadId) {
  const t = await Threads.findById(threadId);
  if (!t) throw new Error('Thread not found');
  const c = await Companies.findOne({ ownerUserId: userId });
  const isParticipant = t.participants.some(p => (p.userId && p.userId.toString() === userId.toString()) || (c && p.companyId && p.companyId.toString() === c._id.toString()));
  if (!isParticipant) throw new Error('Not authorized');
}

