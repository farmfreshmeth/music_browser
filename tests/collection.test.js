/*
  collection.test.js
*/

const PG = require("../pg.js");
const Collection = require("../collection.js");
let collection;
let pg = new PG();

beforeAll(async () => {
  await pg.connect();
  collection = new Collection(pg);
});

test("collection length", async () => {
  expect(await collection.length()).toBe(3);
});

test("folders() returns list of folder objects", async () => {
  let folders = await collection.folders();

  expect(folders.length).toBe(50);
  expect(folders[0]).toStrictEqual({
    count: 16,
    crate: "11",
    id: "6989107",
    name: "11 Alternative Rock",
    name_encoded: "11%20Alternative%20Rock",
    section: "Alternative Rock",
  });
});

test("collection.items returns all items", async () => {
  let items = await collection.items();
  expect(items.length).toBe(3);
});

test("folder search returns a list of releases", async () => {
  let releases = await collection.search("05 Soundtracks", "folder");
  expect(releases.length).toBe(2);
});

test("artist search returns a list of items", async () => {
  let items = await collection.search("annie", "artist");
  expect(items.length).toBe(1);
  expect(items[0].title).toBe("Annie (A New Musical)");
});

test("title search returns a list of items", async () => {
  let items = await collection.search("ankles", "release_title");
  expect(items.length).toBe(1);
  expect(items[0].title).toBe("Ankles Aweigh");
});

test("empty search returns an empty list", async () => {
  let releases = await collection.search("", "title");
  expect(releases.length).toBe(0);
});

test("item() returns a single collection item", async () => {
  let item = await collection.item("2891017");
  expect(item[0].title).toBe("Honky Tonk Piano");
});

test("item() handles number search_str", async () => {
  let items = await collection.item(2891017); // returns 0 or 1 length list
  expect(items.length).toBe(1);
  expect(items[0].title).toBe("Honky Tonk Piano");
});

test("bad release_id returns undefined", async () => {
  let item = await collection.item("not_an_item");
  console.log(item);
  expect(item).toBe(undefined);
});

afterAll(async () => {
  pg.end();
});
