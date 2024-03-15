/*
  collection.test.js
*/

const Collection = require("../collection.js");
const testStorage = require("node-persist");
const collection =  new Collection(testStorage);

beforeEach (async () => {
  await collection.storage.init({ dir: "tests/data" });
});

test("constructor mounts storage", async () => {
  expect(await collection.length()).toBe(42);
});

test("folders() returns folder list", async () => {
  let folders = await collection.folders();
  expect(folders.length).toBe(42);
  expect(folders[0]).toStrictEqual({
    "count": 512,
    "encoded_name": "All",
    "id": 0,
    "name": "All",
    "resource_url": "https://api.discogs.com/users/bGromley/collection/folders/0",
  });
});

test("folder search returns a list", async () => {});

test("artist search returns a list", async () => {});

test("title search returns a list", async () => {});

test("empty search returns a message", async () => {});
