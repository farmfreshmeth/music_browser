/*
  collection.js defines Collection class to handle
    app interaction with the collection in
    local storage.  (wrapper for node-persist)

    routes/views should interact with Collection,
    not Discogs or node-storage directly

    storage layout is:
    {
      key: "folders", value: [{folder object},...],
      key: "123456", value: {release object with custom fields},
      key: "234567", value: {release object with custom fields},
      ...
    }
    -- releases keys are all numeric
*/

// pass an initialized node-persist storage object to constructor
var Collection = function (storage) {
  this.storage = storage;
};

// count only release objects
Collection.prototype.length = async function () {
  let releases = await this.releases();
  return releases.length;
};

// return just the releases objects
Collection.prototype.releases = async function () {
  let obj = await this.storage.valuesWithKeyMatch(/^\d+$/); // numeric keys
  return Array.from(obj);
};

Collection.prototype.folders = async function () {
  return await this.storage.getItem("folders");
};

// TODO deep search (all keys/values)
Collection.prototype.search = async function (search_str, search_target) {
  var regex = new RegExp(search_str, "gi");
  var results = [];
  await this.storage.forEach(async (release) => {
    if (
      (search_target == "folder" &&
        release.value.custom_fields &&
        release.value.custom_fields.folder == search_str) ||
      (search_target == "artist" && regex.exec(release.value.artists_sort)) ||
      (search_target == "release_title" && regex.exec(release.value.title))
    ) {
      results.push(release.value);
    }
  });
  return results;
};

Collection.prototype.release = async function (release_id) {
  if (typeof release_id == "number") {
    release_id = String(release_id);
  }
  return await this.storage.getItem(release_id);
};

module.exports = Collection;
