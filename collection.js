/*
  collection.js defines Collection class to handle
    app interaction with the collection in
    local storage.  (wrapper for node-persist)

    routes/views should interact with Collection,
    not Discogs or node-storage directly

    An Item is a Release in the Collection including
    custom fields and folder.

    storage layout is:
    {
      key: "folders", value: {"1": {folder}, "2": {folder},...},
      key: "custom_fields", value: {"id": {custom_field},...},
      key: "item_123456", value: {collection item},
      key: "item_6543210", value: {collection item},
      ...
    }
    -- item keys are numeric strings of varying length
    -- a "Release" corresponds to Discogs "Release" resource
    -- an "Item" is a Release in a Collection (including custom data)
*/

// pass an initialized node-persist storage object to constructor
var Collection = function (storage) {
  this.storage = storage;
};

Collection.prototype.length = async function () {
  return Object.keys(await this.items()).length;
};

// TODO paginate
Collection.prototype.items = async function (
  folder = 0,
  page = 1,
  per_page = 50,
) {
  let item_keys = await this.storage.valuesWithKeyMatch(/^item_\d+$/);
  return item_keys;
};

Collection.prototype.item = async function (release_id) {
  return await this.storage.getItem(`release_${release_id}`);
};

Collection.prototype.folders = async function () {
  let hash = await this.storage.getItem("folders"); // returns hash
  var keys = Object.keys(hash).slice(2); // exclude items "0" and "1" (all and uncategorized)
  var folders = keys.map(function (v) {
    return hash[v]
  });
  folders.sort((a, b) => {
    return a["section"].localeCompare(b["section"]);
  });
  return folders;
};

Collection.prototype.customFields = async function () {
  return await this.storage.getItem("custom_fields");
};

Collection.prototype.item = async function (id) {
  let key = `item_${id}`;
  return await this.storage.getItem(key);
};

// TODO deep search (all keys/values)
// TODO paginate
Collection.prototype.search = async function (search_str, search_target) {
  var regex = new RegExp(search_str, "gi");
  var results = [];
  await this.storage.forEach(async (release) => {
    // TODO skip non release keys
    if (
      (search_target == "folder" &&
        release.value.folder &&
        release.value.folder["name"] == search_str) ||
      (search_target == "artist" && regex.exec(release.value.artists_sort)) ||
      (search_target == "release_title" && regex.exec(release.value.title))
    ) {
      results.push(release.value);
    }
  });
  return results;
};

module.exports = Collection;
