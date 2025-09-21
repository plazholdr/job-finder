import feathersMongoose from 'feathers-mongoose';
const { Service } = feathersMongoose;
import Messages from '../../models/messages.model.js';
import hooks from './messages.hooks.js';

export default function (app) {
  const options = { Model: Messages, paginate: app.get('paginate') };
  app.use('/messages', new Service(options));
  const service = app.service('messages');
  service.hooks(hooks(app));
}

