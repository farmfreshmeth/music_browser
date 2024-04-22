/*
  user.test.js
*/

const PG = require("../pg.js");
let pg = new PG();
const User = require('../user.js');

let current_user;

beforeAll(async () => {
  current_user = await User.create({
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
  let db_user = new User(res.rows[0]);
  expect(db_user).not.toBe(undefined);
  expect(db_user).toStrictEqual(current_user);
});

test("authentication", async () => {
  let good_user = await User.authenticate('person@example.com', 'thisIsNotAGoodPassword');
  expect(good_user.authenticated).toBe(true);

  let bad_user = await User.authenticate('person@example.com', 'neitherIsThis');
  expect(bad_user).toBe(null);

  let no_user = await User.authenticate('notauser@example.com', 'bigFakePassword');
  expect(no_user).toBe(null);
});
