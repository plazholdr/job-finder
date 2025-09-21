import { hooks as authHooks } from '@feathersjs/authentication';
const { authenticate } = authHooks;

export default (app) => ({
  before: { all: [ authenticate('jwt') ] }
});

