/*
  pg.test.js
*/

const PG = require("../pg.js");
let pg = new PG();

beforeAll(async () => {
  // await pg.connect();
});

test("sanitize", () => {
  let strings = [
    'single quoted',
    " double quoted w/ leading whitespace",
    "nasty single ' quote in there"
  ];
  strings = strings.map((str) => { return pg.sanitize(str); });
  expect(strings).toStrictEqual([
    "single quoted",
    "double quoted w/ leading whitespace",
    "nasty single '' quote in there"
  ]);
});

test("set", async () => {
  let res = await pg.set("items", 1, JSON.stringify({ name: "json" }));
  expect(res).toBe(1);
  await pg.delete('items', [1]);
});

test("get", async () => {
  let res = await pg.set("items", 2, JSON.stringify({ name: "flurp" }));
  res = await pg.get("items", 2);
  expect(res).toStrictEqual({ name: "flurp" });
  await pg.delete('items', [2]);
});

test("log", async () => {
  let log_res = await pg.log('logger.test.js', 'testy test');

  let query = `
    SELECT * FROM log ORDER BY ts DESC LIMIT 1;
  `;
  let query_res = await pg.client.query(query);
  expect(query_res.rows[0]).toStrictEqual(log_res);
});

test("log_string", () => {
  let obj = {
    env: 'test',
    job: 'logger.test.js',
    level: 'info',
    message: 'testy test',
    ts: new Date('2024-04-05T20:42:16.852Z')
  }
  let target = '[2024-04-05T20:42:16.852Z test] logger.test.js INFO: testy test';
  expect(pg.log_string(obj)).toBe(target);
});

afterAll(async () => {
  await pg.end();
});
