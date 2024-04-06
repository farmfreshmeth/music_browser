/*
  logger.test.js
*/

const PG = require('../pg.js');
let pg = new PG();
let logger;

// pg.connect() creates pg.logger

beforeAll(async () => {
  await pg.connect();
  logger = pg.logger;
});

test("constructor", () => {
  expect(logger.env).toBe('test');
});

test("connect", () => {
  expect(logger.pg).not.toBe(null);
});

test("log", async () => {
  let log_res = await logger.log('logger.test.js', 'testy test');

  let query = `
    SELECT * FROM log ORDER BY ts DESC LIMIT 1;
  `;
  let query_res = await logger.client.query(query);
  expect(query_res.rows[0]).toStrictEqual(log_res);
});

test("string", () => {
  let obj = {
    env: 'test',
    job: 'logger.test.js',
    level: 'info',
    message: 'testy test',
    ts: new Date('2024-04-05T20:42:16.852Z')
  }
  let target = '[2024-04-05T20:42:16.852Z test] logger.test.js INFO: testy test';
  expect(logger.string(obj)).toBe(target);
});

afterAll(async () => {
  await pg.end();
});
