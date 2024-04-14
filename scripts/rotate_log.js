/*
  rotate_log.js
*/

const PG = require('../pg.js');
let pg = new PG();

const RETAIN = 30; // days

(async () => {
  let query = `
    DELETE FROM log WHERE ts < NOW() - '${RETAIN} DAYS'::interval;
  `;
  let res = await pg.client.query(query);
  pg.log('rotate_log', `DELETED ${res.rowCount} log rows`, 'info');
})();
