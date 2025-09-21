import { hooks as authHooks } from '@feathersjs/authentication';
import Users from '../../models/users.model.js';

const { authenticate } = authHooks;

class ProgrammesService {
  async find(params) {
    const university = params.query?.university || null;
    if (!university) return { items: [] };

    const match = { role: 'student', $or: [
      { 'internProfile.university': university },
      { 'internProfile.educations.institutionName': university }
    ] };

    const pipeline = [
      { $match: match },
      { $unwind: { path: '$internProfile.educations', preserveNullAndEmptyArrays: true } },
      { $addFields: {
        eduInstitution: '$internProfile.educations.institutionName',
        eduLevel: '$internProfile.educations.level',
        eduProgramme: '$internProfile.educations.qualification',
        eduFaculty: '$internProfile.educations.fieldOfStudy'
      } },
      { $project: {
        universityFromRoot: '$internProfile.university',
        eduInstitution: 1, eduLevel: 1, eduProgramme: 1, eduFaculty: 1
      } },
      { $addFields: {
        uni: { $ifNull: ['$eduInstitution', '$universityFromRoot'] }
      } },
      { $match: { uni: university } },
      { $group: { _id: { level: '$eduLevel', programme: '$eduProgramme', faculty: '$eduFaculty' }, count: { $sum: 1 } } },
      { $project: { _id: 0, level: '$_id.level', programme: '$_id.programme', faculty: '$_id.faculty', count: 1 } },
      { $sort: { programme: 1 } }
    ];

    const items = await Users.aggregate(pipeline);
    return { items };
  }
}

export default function (app) {
  app.use('/programmes', new ProgrammesService());
  app.service('programmes').hooks({ before: { all: [ authenticate('jwt') ] } });
}

