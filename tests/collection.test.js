/*
  collection.test.js
*/

const PG = require("../pg.js");
const Collection = require("../collection.js");
let pg = new PG();
let collection;

beforeAll(async () => {
  collection = new Collection(pg);
  await pg.connect();
});

test("collection length", async () => {
  expect(await collection.length()).toBe(706);
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
  expect(items.length).toBe(706);
});

test("folder search returns a list of releases", async () => {
  let releases = await collection.search("05 Soundtracks", "folder");
  expect(releases.length).toBe(17);
});

test("single quote escaped properly", async () => {
  expect(async () => { await collection.search("16 Children's", "folder"); }).not.toThrow();
});

test("artist search returns a list of items", async () => {
  let items = await collection.search("annie", "artist");
  expect(items.length).toBe(1);
  expect(items[0].title).toBe("Annie (A New Musical)");
});

test("artist search searches track artists", async () => {
  let items = await collection.search("mcardle", "artist");
  expect(items.length).toBe(1);
  expect(items[0].title).toBe("Annie (A New Musical)");
});

test("trims whitespace on search_str", async () => {
  let items = await collection.search("  annie   ", "artist")
  expect(items.length).toBe(1);
});

test("release title search returns a list of items", async () => {
  let items = await collection.search("ankles", "item_title");
  expect(items.length).toBe(1);
  expect(items[0].title).toBe("Ankles Aweigh");
});

test("track title search returns a list", async () => {
  let items = await collection.search("festa", "track_title");
  expect(items.length).toBe(2);
  expect(items[0].title).toBe("Ankles Aweigh");
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
  let item = await collection.item(2891017); // returns 0 or 1 length list
  expect(item.title).toBe("Honky Tonk Piano");
});

test("bad release_id returns undefined", async () => {
  let item = await collection.item("not_an_item");
  expect(item).toBe(undefined);
});

test("gets lyrics", async () => {
  let lyrics = await collection.lyrics(2406675, 'A4');
  expect(lyrics[1].lyrics).toMatch(/^\[ANNIE\]\nThe sun will come out tomorrow/);
});

test("item merges lyrics", async () => {
  let item = await collection.item(2406675);
  expect(item.tracklist[3].lyrics).toMatch(/^\[ANNIE\]\nThe sun will come out tomorrow/);
});

afterAll(async () => {
  pg.end();
});
