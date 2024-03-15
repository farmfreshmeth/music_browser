/*
  collection.test.js
*/

const testStorage = require("node-persist");
const Collection = require("../collection.js");
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

test("folder search returns a list of releases", async () => {
  let releases = await collection.search("01 Grateful Dead", "folder");
  expect(releases.length).toBe(2);
});

test("artist search returns a list releases", async () => {
  let releases = await collection.search("Van Halen", "artist");
  expect(releases.length).toBe(4);
});

test("title search returns a list of releases", async () => {
  let releases = await collection.search("The Best Of ZZ Top", "release_title");
  console.log(releases[0]);
  expect(releases.length).toBe(1);
});

test("empty search returns an empty list", async () => {
  let releases = await collection.search("", "title");
  expect(releases.length).toBe(0);
});

test("release() returns a single release", async () => {
  let release = await collection.release("766302");
  expect(release.title).toBe("The Best Of ZZ Top");
});

test("release() handles number search_str", async() => {
  let release = await collection.release(766302);
  expect(release.title).toBe("The Best Of ZZ Top");
});

test("bad release_id returns undefined", async () => {
  let release = await collection.release("not a release_id");
  expect(release).toBe(undefined);
});
