/*
  storage.test.js
*/

const testStorage = require("node-persist");

beforeAll(async () => {
  await testStorage.init({ dir: "tests/data" });
});

test("storage exists", async () => {
  expect(await testStorage.length()).toBe(49);
});