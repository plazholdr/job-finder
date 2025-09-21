import feathersMongoose from 'feathers-mongoose';
const { Service } = feathersMongoose;
import Notifications from '../../models/notifications.model.js';
import hooks from './notifications.hooks.js';

export default function (app) {
  const options = { Model: Notifications, paginate: app.get('paginate') };
  app.use('/notifications', new Service(options));
  const service = app.service('notifications');
  service.hooks(hooks(app));
}

