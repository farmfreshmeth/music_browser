/*

  collection.js defines Collection class to handle
    app interaction with the collection in
    local storage.  (wrapper for node-persist)

    routes/views should interact with Collection,
    not Discogs or node-storage directly
*/

// pass an initialized node-persist storage object to constructor
var Collection = function (storage) {
  this.storage = storage;
};

Collection.prototype.length = async function () {
  return await this.storage.length();
};

Collection.prototype.release = async function (release_id, callback) {
  var release = await this.storage.getItem(release_id);
  callback(release);
};

Collection.prototype.folders = async function () {
  let uniq_folders = await this.storage.valuesWithKeyMatch(/folder/);
  uniq_folders = uniq_folders[0]; // do not know why it's wrapped in an array element
  for (let i in uniq_folders) {
    uniq_folders[i]["encoded_name"] = encodeURIComponent(
      uniq_folders[i]["name"],
    );
  }
  return uniq_folders;
};

// Collection.prototype.folder = function (folder_id) {
//   var folder_arr = this.folders.filter((folder) => {
//     return folder["id"] == folder_id;
//   });
//   return folder_arr[0];
// };

// TODO fuzzy search
Collection.prototype.search = async function (search_str, search_target) {
  var results = [];
  await this.storage.forEach(async (release) => {
    if (
      (search_target == "folder" &&
        release.value.custom_fields &&
        release.value.custom_fields.folder == search_str) ||
      (search_target == "artist" && release.value.artists_sort == search_str) ||
      (search_target == "release_title" && release.value.title == search_str)
    ) {
      results.push(release.value);
    }
  });
  return results;
};

module.exports = Collection; // singleton


