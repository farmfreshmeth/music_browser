/*
  pg.js
    node-postgres wrapper
*/

require("dotenv").config();
const { Client } = require("pg");

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
  this.client = new Client(conn_params);
  console.log(`Using database ${this.client.database}`);
};

PG.prototype.connect = async function () {
  try {
    await this.client.connect();
  } catch (err) {
    console.log(err);
  }
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
    let res = await this.client.query(query, [key, value]);
    return res["rows"][0].result;
  } catch (err) {
    console.log(err);
    return err;
  }
};

PG.prototype.get = async function (resource, key) {
  let query = `\
    SELECT value FROM ${resource} WHERE key = ${key}
  `;
  let res = await this.client.query(query);
  return res["rows"][0].value;
};

// TODO move to collection.js
PG.prototype.getFolder = async function (id) {
  return await this.get("folders", id);
};

// TODO move to collection.js
PG.prototype.getField = async function (id) {
  return await this.get("fields", id);
};

PG.prototype.end = async function () {
  await this.client.end();
};

module.exports = PG;
