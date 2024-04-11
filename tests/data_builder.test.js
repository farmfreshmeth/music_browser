/*
  data_builder.test.js
*/

let Builder = require("../data_builder.js");
let builder = {};

beforeAll(async () => {
  builder = new Builder();
});

test("getItem", async () => {
  let item = await builder.getItem(2978701);
  expect(item.title).toBe('How Will I Know');

  item = await builder.getItem(9999999);
  expect(!item);
});

afterAll(async () => {
});
