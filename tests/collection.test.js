/*
  collection.test.js
*/

const storage = require("node-persist");
const Collection = require("../collection.js");
let collection;

beforeAll(() => {
  return new Promise(async (resolve) => {
    await storage.init({ dir: "tests/data" });
    collection = new Collection(storage);
    resolve();
  });
});

test("constructor mounts storage", async () => {
  expect(await collection.length()).toBe(3);
});

test("folders() returns folder list", async () => {
  let folders = await collection.folders();
  expect(folders.length).toBe(49);
  expect(folders[0]).toStrictEqual({
    "count": 15,
    "crate": "11",
    "id": "6989107",
    "name": "11 Alternative Rock",
    "name_encoded": "11%20Alternative%20Rock",
    "section": "Alternative Rock",
  });
});

test("folder search returns a list of releases", async () => {
  let releases = await collection.search("13 Jazz", "folder");
  expect(releases.length).toBe(1);
});

test("artist search returns a list releases", async () => {
  let releases = await collection.search("annie", "artist");
  expect(releases.length).toBe(1);
});

test("title search returns a list of releases", async () => {
  let releases = await collection.search("ankles", "release_title");
  expect(releases.length).toBe(1);
});

test("empty search returns an empty list", async () => {
  let releases = await collection.search("", "title");
  expect(releases.length).toBe(0);
});

test("item() returns a single collection item", async () => {
  let item = await collection.item("2891017");
  expect(item.title).toBe("Honky Tonk Piano");
});

test("item() handles number search_str", async () => {
  let item = await collection.item(2891017);
  expect(item.title).toBe("Honky Tonk Piano");
});

test("bad release_id returns undefined", async () => {
  let item = await collection.item("not a release_id");
  expect(item).toBe(undefined);
});
