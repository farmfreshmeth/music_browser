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
  expect(await collection.length()).toBe(705);
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
  expect(items.length).toBe(705);
});

test("folder search returns a list of releases", async () => {
  let releases = await collection.search("05 Soundtracks", "folder");
  expect(releases.length).toBe(17);
});

test("getFolderStruct", async () => {
  let struct = await collection.getFolderStruct(5376838);
  expect(struct).toStrictEqual({
    "crate": "04",
    "id": 5376838,
    "name": "04 Disco",
    "section": "Disco",
  });
});

test("getFieldsStruct", async () => {
  let notes = [
    {
      "field_id": 1,
      "value": "Very Good (VG)"
    },
    {
      "field_id": 2,
      "value": "Very Good (VG)"
    },
    {
      "field_id": 4,
      "value": "Farm Freshmeth"
    }
  ]
  let struct = await collection.getFieldsStruct(notes);
  expect(struct).toStrictEqual([
    {"field_id": 1, "name": "Media Condition", "value": "Very Good (VG)"},
    {"field_id": 2, "name": "Sleeve Condition", "value": "Very Good (VG)"},
    {"field_id": 4, "name": "Collection", "value": "Farm Freshmeth"}
  ]);
});

test("deepEquals", () => {
  let obj1 = {
    a: '1',
    b: [2, 3],
    c: { d: '4' }
  };
  let obj2 = {
    c: { d: '4' },
    a: '1',
    b: [2, 3]
  };
  expect(collection.deepEquals(obj1, obj2)).toBe(true);

  let obj3 = {
    a: 1,
    b: ['3', 2],
    c: { d: 4 }
  };
  expect(collection.deepEquals(obj1, obj3)).toBe(false);
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

test("item adds default image if necessary", async () => {
  let item = await collection.item(29843833); // The Remittance Men
  expect(item.images[0].uri).toBe('/images/studio_84_logo.png');
  expect(item.images[0].resource_url).toBe('/images/studio_84_logo.png');
  expect(item.thumb).toBe('/images/studio_84_logo.png');
});

test("item() handles number search_str", async () => {
  let item = await collection.item(2891017);
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

test("item hoists SpotifyId", async () => {
  let item = await collection.item(2916142);
  expect(item.spotify_id).toBe('4uHwcjASOWAKw4P4wveKRb');
});

afterAll(async () => {
  pg.end();
});
