/*
  user.test.js
*/

const PG = require("../pg.js");
let pg = new PG();
const User = require('../user.js');
let user = new User();

let current_user;

beforeAll(async () => {
  current_user = await user.create({
    email: 'person@example.com',
    first_name: 'Example',
    last_name: 'Person',
    cleartext: 'thisIsNotAGoodPassword',
    privileges: {
      role: 'super_admin'
    },
  });
});

test("create", async () => {
  let query = `SELECT * FROM users WHERE email = 'person@example.com' LIMIT 1`;
  let res = await pg.client.query(query);
  let db_user = res.rows[0];
  expect(db_user).not.toBe(undefined);
  expect(db_user).toStrictEqual(current_user);
});

test("password hash", async () => {
  expect(await user.authorize('person@example.com', 'thisIsNotAGoodPassword')).toBe(true);
  expect(await user.authorize('person@example.com', 'neitherIsThis')).toBe(false);
});

test("hash function", async () => {
  let clear = "shittyPassword";
  let hash = await user.hash(clear);
  expect(hash.length).toBe(60);
});