/*
  user.js

  Common user auth methods
*/

const PG = require("./pg.js");
let pg = new PG();
const User = function () {};
const bcrypt = require("bcrypt");
const saltRounds = 10;

User.prototype.get = async function (email) {
  let query = `SELECT * FROM users WHERE email = $1`;
  let res = await pg.client.query(query, [email]);
  return res.rows[0];
};

// {
//   email: 'person@example.com',
//   first_name: 'Example',
//   last_name: 'Person',
//   cleartext: 'thisIsNotAGoodPassword',
//   privileges: {
//     role: 'super_admin'
//   },
// }
User.prototype.create = async function (params) {
  let hash = await this.hash(params.cleartext);
  let query = `
    INSERT INTO users (email, first_name, last_name, password, privileges)
    VALUES ($1, $2, $3, $4, $5)
  `;
  let res = await pg.client.query(query, [
    params.email,
    params.first_name,
    params.last_name,
    hash,
    params.privileges
  ]);
  return await this.get(params.email);
};

User.prototype.authorize = async function (email, cleartext) {
  let user = await this.get(email);
  return await bcrypt.compare(cleartext, user.password);
};

User.prototype.hash = async function (cleartext) {
  let salt = await bcrypt.genSalt(saltRounds);
  return await bcrypt.hash(cleartext, salt);
};

module.exports = User;
