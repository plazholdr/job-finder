import feathersMongoose from 'feathers-mongoose';
const { Service } = feathersMongoose;
import Favorites from '../../models/favorites.model.js';
import hooks from './favorites.hooks.js';

export default function (app) {
  const options = { Model: Favorites, paginate: app.get('paginate') };
  app.use('/favorites', new Service(options));
  const service = app.service('favorites');
  service.hooks(hooks(app));
}

