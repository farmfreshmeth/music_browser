/*
  data_builder.test.js

  TODO mock the API calls and test thoroughly.  In the
  meantime, test manually
*/

let Builder = require("../data_builder.js");
let builder = {};
const fs = require("node:fs/promises");

let Discogs = require('../discogs.js');
Discogs.prototype.downloadRelease = jest.fn(() => { console.log('mock'); });

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
