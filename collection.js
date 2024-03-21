/*
  collection.js defines Collection class to handle
    app interaction with the collection in
    local storage.  (wrapper for node-persist)

    routes/views should interact with Collection,
    not Discogs or node-storage directly

    An Item is a Release in the Collection including
    custom fields and folder.
*/

// pass an initialized node-persist storage object to constructor
var Collection = function (storage) {
  this.storage = storage;
  this.folders = this.folders();
  this.customFields = this.customFields();
};

// TODO paginate
Collection.prototype.items = async function (folder = 0, page = 1, per_page = 50) {
  // get values where key /^item_\d+/g;
};

Collection.prototype.item = async function (release_id) {
  return await this.storage.getItem(`release_${release_id}`);
};

Collection.prototype.folders = async function () {
  return await this.storage.getItem("folders");
};

Collection.prototype.customFields = async function () {
  return await this.storage.getItem("custom_fields");
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

module.exports = Collection;
