import feathersMongoose from 'feathers-mongoose';
const { Service } = feathersMongoose;
import Timesheet from '../../models/timesheets.model.js';
import hooks from './timesheets.hooks.js';

export default function (app) {
  const options = { Model: Timesheet, paginate: app.get('paginate') };
  app.use('/timesheets', new Service(options));
  const service = app.service('timesheets');
  service.hooks(hooks(app));
}

