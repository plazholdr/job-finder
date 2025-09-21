import { hooks as authHooks } from '@feathersjs/authentication';
import Users from '../../models/users.model.js';

const { authenticate } = authHooks;

class ProgrammeCandidatesService {
  constructor(app) { this.app = app; }
  async find(params) {
    const q = params.query || {};
    const { university, programme, faculty, level } = q;
    const startDate = q.startDate ? new Date(q.startDate) : null;
    const endDate = q.endDate ? new Date(q.endDate) : null;
    const locations = q.locations ? (Array.isArray(q.locations) ? q.locations : [q.locations]) : [];
    const salaryMin = q.salaryMin ? Number(q.salaryMin) : null;
    const salaryMax = q.salaryMax ? Number(q.salaryMax) : null;

    const match = { role: 'student' };

    const and = [];
    if (university) {
      and.push({ $or: [ { 'internProfile.university': university }, { 'internProfile.educations.institutionName': university } ] });
    }
    if (programme) and.push({ 'internProfile.educations.qualification': programme });
    if (faculty) and.push({ 'internProfile.educations.fieldOfStudy': faculty });
    if (level) and.push({ 'internProfile.educations.level': level });

    if (startDate) and.push({ 'internProfile.preferences.preferredStartDate': { $gte: startDate } });
    if (endDate) and.push({ 'internProfile.preferences.preferredEndDate': { $lte: endDate } });

    if (locations.length) and.push({ 'internProfile.preferences.locations': { $in: locations } });

    if (salaryMin != null || salaryMax != null) {
      const cond = {};
      if (salaryMin != null) cond.$gte = salaryMin;
      if (salaryMax != null) cond.$lte = salaryMax;
      and.push({ 'internProfile.preferences.salaryRange.min': cond });
    }

    if (and.length) match.$and = and;

    const projection = {
      email: 1,
      role: 1,
      'profile.firstName': 1,
      'profile.lastName': 1,
      'internProfile.university': 1,
      'internProfile.educations': 1,
      'internProfile.preferences': 1
    };

    const candidates = await Users.find(match).select(projection).limit(100).lean();
    return { items: candidates };
  }

  async patch(id, data, params) {
    const user = params.user;
    if (!user || user.role !== 'company') throw Object.assign(new Error('Only companies can send invites'), { code: 403 });

    // Accept either a single userId via URL or payload list
    const userIds = [];
    if (id && id !== null) userIds.push(id);
    if (Array.isArray(data?.userIds)) userIds.push(...data.userIds);
    if (data?.userId) userIds.push(data.userId);

    const uniqueUserIds = [...new Set(userIds.filter(Boolean))];
    if (!uniqueUserIds.length) throw Object.assign(new Error('No userIds provided'), { code: 400 });

    const type = data?.type || 'profile_access';
    const message = data?.message;

    // Delegate to invites.create (array) which performs dedupe and notifications
    const payload = uniqueUserIds.map(uid => ({ userId: uid, type, message }));
    const created = await this.app.service('invites').create(payload, params);
    return { created: Array.isArray(created) ? created : [created] };
  }


}

export default function (app) {
  app.use('/programme-candidates', new ProgrammeCandidatesService(app));
  app.service('programme-candidates').hooks({ before: { all: [ authenticate('jwt') ] } });
}

