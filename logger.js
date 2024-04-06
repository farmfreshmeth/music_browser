/*
  logger.js

  Pushes timestamped log messages into logs table.  Used by PG() class.
    You probably don't want to instantiate a new logger apart from your
    PG object.

  Levels:  info, warn, error, fatal
*/

let Logger = function () {
  this.env = process.env.NODE_ENV;
};

// Must pass a connected pg object!
Logger.prototype.connect = async function (pg) {
  this.client = pg.client;
};

Logger.prototype.log = async function (
  job = '',
  message = '',
  level = 'info'
) {
  let query = `
    INSERT INTO log (env, level, job, message)
    VALUES ('${this.env}', '${level}', '${job}', '${message}')
    RETURNING ts, env, level, job, message;
  `;
  let res = await this.client.query(query);
  let entry = res.rows[0];
  if (process.env.NODE_ENV == 'development') { console.log(this.string(entry)); }
  return entry;
};

Logger.prototype.string = function (obj) {
  return `[${obj.ts.toISOString()} ${obj.env}] ${obj.job} ${obj.level.toUpperCase()}: ${obj.message}`;
};

module.exports = Logger;
