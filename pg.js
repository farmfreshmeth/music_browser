/*
  pg.js
    node-postgres wrapper
*/

require("dotenv").config();
const { Pool } = require("pg");

let PG = function () {
  let conn_params = {};
  if (process.env.NODE_ENV == 'test') {
    conn_params.connectionString = process.env.DATABASE_URL_TEST;
  } else if (process.env.NODE_ENV == 'development') {
    conn_params.connectionString = process.env.DATABASE_URL;
  } else { // production
    conn_params.connectionString = process.env.DATABASE_URL;
    conn_params.ssl = { rejectUnauthorized: false };
  }
  conn_params.allowExitOnIdle = true;

  // this.client = new Client(conn_params);
  this.client = new Pool(conn_params);
};

PG.prototype.connect = async function () {
  return; // no need to connect using Pool.  for backwards compat
};

// Fix up strings for insert/search
PG.prototype.sanitize = function (str) {
  str = str.trim();
  str = str.replace(/'/g, "''");
  return str;
};

PG.prototype.log_string = function (obj) {
  return `[${obj.ts.toISOString()} ${obj.env}] ${obj.job} ${obj.level.toUpperCase()}: ${obj.message}`;
};

PG.prototype.log = async function (
  job = '',
  message = '',
  level = 'info'
) {
  message = this.sanitize(message);
  let query = `
    INSERT INTO log (env, level, job, message)
    VALUES ('${process.env.NODE_ENV}', '${level}', '${job}', '${message}')
    RETURNING ts, env, level, job, message;
  `;
  let res = await this.client.query(query);
  let entry = res.rows[0];
  if (process.env.NODE_ENV == 'development') { console.log(this.log_string(entry)); }
  return entry;
};

// sugar
PG.prototype.execute = async function (query) {
  return await this.client.query(query);
};

// pass array of keys
PG.prototype.delete = async function(resource, keys) {
  let match_str = `(${keys.join(', ')})`;
  let query = `DELETE FROM ${resource} WHERE key IN ${match_str}`;
  return await this.client.query(query);
};

PG.prototype.helloWorld = async function () {
  const res = await this.client.query("SELECT $1::text as message", [
    "Hello world!",
  ]);
  return res.rows[0].message; // Hello world!
};

// Pass JS object as value
PG.prototype.set = async function (resource, key, value) {
  let query =
    "INSERT INTO " +
    resource +
    " (key, value) \
    VALUES ($1, $2) \
    ON CONFLICT (key) \
    DO UPDATE SET value = $2 \
    RETURNING key AS result \
  ";
  try {
    if (process.env.DEBUG) {
      this.log('pg.js', this.sanitize(query), 'info');
    }
    let res = await this.client.query(query, [key, value]);
    return res["rows"][0].result;
  } catch (err) {
    // Can't log error here b/c connection is fubar
    console.log(query, err);
  }
};

PG.prototype.get = async function (resource, key) {
  let query = `\
    SELECT value FROM ${resource} WHERE key = ${key}
  `;
  let res = await this.client.query(query);
  return res["rows"][0].value;
};

PG.prototype.end = async function () {
  if (process.env.DEBUG) { await this.log('pg.js', `Closing connection to ${this.client.database}`, 'info'); }
  await this.client.end(); // ends the Pool.  no need to release clients unless checked out
};

module.exports = PG;
