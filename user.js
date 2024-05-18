/*
  user.js

  Common user auth methods
*/

const PG = require("./pg.js");
let pg = new PG();
const bcrypt = require("bcrypt");
const saltRounds = 10;

let User = function (record) {
  this.id = record.id;
  this.email = record.email;
  this.first_name = record.first_name;
  this.last_name = record.last_name;
  this.role = record.privileges.role;
  this.authenticated = false;
};

User.authenticate = async function (email, cleartext) {
  let query = `SELECT * FROM users WHERE email = $1`;
  let res = await pg.client.query(query, [email]);

  let record = res.rows[0];
  if (record && await bcrypt.compare(cleartext, record.password)) {
    let user = new User(record);
    user.authenticated = true;
    return user;
  } else {
    return null;
  }
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
User.create = async function (params) {
  let hashed_str = await hash(params.cleartext);
  let query = `
    INSERT INTO users (email, first_name, last_name, password, privileges)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id
  `;
  try {
    let res = await pg.client.query(query, [
      params.email,
      params.first_name,
      params.last_name,
      hashed_str,
      params.privileges,
    ]);
    return new User({
      id: res.rows[0].id,
      email: params.email,
      first_name: params.first_name,
      last_name: params.last_name,
      privileges: params.privileges,
    });
  } catch (err) {
    return err;
  }
};

let hash = async function (cleartext) {
  let salt = await bcrypt.genSalt(saltRounds);
  return await bcrypt.hash(cleartext, salt);
};

module.exports = User;
