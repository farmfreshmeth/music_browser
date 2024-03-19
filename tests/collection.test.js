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
  expect(await collection.length()).toBe(48);
});

test("folders() returns folder list", async () => {
  let folders = await collection.folders();
  expect(folders.length).toBe(17);
  expect(folders[0]).toStrictEqual({
    "09 Rock & Roll": {
      "crate": 9,
      "encoded_name": "09%20Rock%20%26%20Roll",
      "name": "09 Rock & Roll",
      "section": "Rock & Roll",
    },
  });
});

test("folder search returns a list of releases", async () => {
  let releases = await collection.search("01 Grateful Dead", "folder");
  expect(releases.length).toBe(2);
});

test("artist search returns a list releases", async () => {
  let releases = await collection.search("police", "artist");
  expect(releases.length).toBe(5);
});

test("title search returns a list of releases", async () => {
  let releases = await collection.search("argybargy", "release_title");
  expect(releases.length).toBe(1);
});

test("empty search returns an empty list", async () => {
  let releases = await collection.search("", "title");
  expect(releases.length).toBe(0);
});

test("release() returns a single release", async () => {
  let release = await collection.release("1818184");
  expect(release.title).toBe("Argybargy");
});

test("release() handles number search_str", async() => {
  let release = await collection.release(1818184);
  expect(release.title).toBe("Argybargy");
});

test("bad release_id returns undefined", async () => {
  let release = await collection.release("not a release_id");
  expect(release).toBe(undefined);
});
