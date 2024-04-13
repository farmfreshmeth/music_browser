/*
  data_builder.test.js
*/

let Builder = require("../data_builder.js");
let builder = {};
const fs = require("node:fs/promises");

beforeAll(async () => {
  builder = new Builder();
});

test("getItem", async () => {
  let item = await builder.getItem(2978701);
  expect(item.title).toBe('How Will I Know');

  item = await builder.getItem(9999999);
  expect(!item);
});

// test("processItemStubs", async () => {
//   let stubs = await fs.readFile('./tests/data/stubs.json');
//   builder.processItemStubs(stubs, (stub) => {
//     // query db and examine values
//     console.log(stub);
//   });
// });

afterAll(async () => {
});
