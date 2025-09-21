import { hooks as authHooks } from '@feathersjs/authentication';
import Users from '../../models/users.model.js';

const { authenticate } = authHooks;

class UniversitiesService {
  async find(params) {
    const q = String(params.query?.q || '').trim();
    const match = { role: 'student', $or: [
      { 'internProfile.university': { $exists: true } },
      { 'internProfile.educations.0': { $exists: true } }
    ] };
    const pipeline = [ { $match: match }, { $project: {
      universities: {
        $setUnion: [ [ '$internProfile.university' ], '$internProfile.educations.institutionName' ]
      }
    } }, { $unwind: '$universities' }, { $match: { universities: { $ne: null } } }, { $group: { _id: '$universities', count: { $sum: 1 } } }, { $sort: { _id: 1 } } ];
    let items = await Users.aggregate(pipeline);
    items = items.map(x => ({ name: x._id, count: x.count }));
    if (q) items = items.filter(x => x.name && x.name.toLowerCase().includes(q.toLowerCase()));
    return { items };
  }
}

export default function (app) {
  app.use('/universities', new UniversitiesService());
  app.service('universities').hooks({ before: { all: [ authenticate('jwt') ] } });
}

