const { Service } = require('feathers-mongoose');
const Favorites = require('../../models/favorites.model');
const hooks = require('./favorites.hooks');

module.exports = function (app) {
  const options = { Model: Favorites, paginate: app.get('paginate') };
  app.use('/favorites', new Service(options));
  const service = app.service('favorites');
  service.hooks(hooks(app));
};

