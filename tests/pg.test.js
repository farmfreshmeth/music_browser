/*
  pg.test.js
*/

const PG = require("../pg.js");
let pg = new PG();

beforeAll(async () => {
  await pg.connect();
});

test("hello world", async () => {
  let res = await pg.test();
  expect(res).toBe("Hello world!");
});

test("set", async () => {
  let res = await pg.set("items", 1, JSON.stringify({ name: "json" }));
  expect(res).toBe(1);
});

test("get", async () => {
  let res = await pg.set("items", 2, JSON.stringify({ name: "flurp" }));
  res = await pg.get("items", 2);
  expect(res).toStrictEqual({ name: "flurp" });
});

test("getFolder", async () => {
  let target = {
    count: 717,
    crate: "Al",
    id: "0",
    name: "All",
    name_encoded: "All",
    section: "",
  };
  let res = await pg.getFolder(0);
  expect(res).toStrictEqual(target);

  res = await pg.getFolder("0");
  expect(res).toStrictEqual(target);
});

test("getField", async () => {
  let target = {
    "id": 5,
    "name": "Commentary",
  };
  let res = await pg.getField(5);
  expect(res).toStrictEqual(target);

  res = await pg.getField("5");
  expect(res).toStrictEqual(target);
});

afterAll(async () => {
  pg.end();
});
