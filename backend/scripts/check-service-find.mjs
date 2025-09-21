import 'dotenv/config';
import app from '../src/app.js';

async function main() {
  const email = process.argv[2];
  if (!email) { console.error('email required'); process.exit(1); }
  const users = app.service('users');
  const res = await users.find({ paginate: false, query: { email: email.toLowerCase() } });
  console.log('result type', Array.isArray(res) ? 'array' : typeof res);
  const entity = Array.isArray(res) ? res[0] : res.data?.[0];
  console.log('entity keys', entity ? Object.keys(entity).slice(0, 12) : null);
  console.log('has password?', entity && Object.prototype.hasOwnProperty.call(entity, 'password'));
  console.log('password prefix', entity && entity.password ? entity.password.slice(0,7) : null);
}

main().catch(e => { console.error(e); process.exit(1); });

