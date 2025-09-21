import feathersMongoose from 'feathers-mongoose';
const { Service } = feathersMongoose;
import Threads from '../../models/threads.model.js';
import hooks from './threads.hooks.js';

export default function (app) {
  const options = { Model: Threads, paginate: app.get('paginate') };
  app.use('/threads', new Service(options));
  const service = app.service('threads');
  service.hooks(hooks(app));
}

