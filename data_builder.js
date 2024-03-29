/*
  data_builder.js wraps discogs.js and marshalls data from Discogs
    into node-persist storage.  It is used by scripts/build_local_db.js
    to rebuild the local db from the Discogs API.

    It is necessary to do this because the Discogs API doesn't support
    collection search.

    See collection.js for storage layout
*/

require("dotenv").config();
const Discogs = require("./discogs.js");
const discogs = new Discogs();
const storage = require("node-persist");
const fs = require("node:fs/promises");
const CSV = require("csv-string");
const Mailer = require("./mailer.js");
const mailer = new Mailer();

// make a loop pause to stay under api rate limit (60/min)
const delay = async (ms = 1050) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// opts: flush: false, env: "production"|"development"|"test"
let DataBuilder = function (opts) {
  this.opts = opts;
  this.db_dir = this.opts.env == "test" ? "tests/data" : ".node-persist/storage";
  this.log_details = [];
};

DataBuilder.prototype.mountStorage = async function (callback) {
  await storage.init({dir: this.db_dir});
  this.storage = storage;
  this.log(`mountStorage: ${this.db_dir}`);
  callback();
};

DataBuilder.prototype.log = function (message) {
  let ts = new Date().toISOString();
  let str = `[${this.opts.env} ${ts}] ${message}`;
  this.log_details.push(str);
  console.log(str);
};

// CAREFUL:  flushing without rebuilding successfully breaks everything
DataBuilder.prototype.flushDB = async function (flush, callback) {
  if (flush) {
    await this.storage.clear({dir: this.db_dir});
    await this.storage.init({dir: this.db_dir}); // reinitialize empty database
    this.log(`Flushed database at ${this.db_dir}`);
  } else {
    this.log(`Did not flush database at ${this.db_dir}`);
  };
  callback();
};

// {"34225": {folder}, "883838": {folder},...}
DataBuilder.prototype.buildFoldersList = async function (callback) {
  discogs.downloadFolders(async (data) => {
    let raw_folders = data["folders"];
    let fixed_up_folders = {};
    for (let i in raw_folders) {
      let this_folder = {
        id: String(raw_folders[i]["id"]),
        name: raw_folders[i]["name"],
        name_encoded: encodeURIComponent(raw_folders[i]["name"]),
        crate: raw_folders[i]["name"].substring(0, 2),
        section: raw_folders[i]["name"].substring(3),
        count: raw_folders[i]["count"]
      };
      fixed_up_folders[raw_folders[i]["id"]] = this_folder;
    }
    await this.storage.setItem("folders", fixed_up_folders);
    this.log(`buildFoldersList: ${raw_folders.length}`);
    callback();
  });
};

// {"1": {field}, "2": {field},...}
DataBuilder.prototype.buildCustomFieldsList = async function (callback) {
  discogs.downloadCustomFields(async (data) => {
    let raw_fields = data["fields"];
    let fixed_up_fields = {};
    for (let i in raw_fields) {
      let this_field = {
        id: raw_fields[i]["id"],
        name: raw_fields[i]["name"]
      };
      fixed_up_fields[raw_fields[i]["id"]] = this_field;
    }
    await storage.setItem("custom_fields", fixed_up_fields);
    this.log(`buildCustomFieldsList: ${raw_fields.length}`);
    callback();
  });
};

// TODO paginate through collection (instead of downloading export)
DataBuilder.prototype.buildCollectionItemsList = async function (
  folder_id,
  callback,
) {
  discogs.downloadCollectionItems(folder_id, async (data) => {
    let collection_items = data["releases"];
    for (let i in collection_items) {
      this.fixUpItem(collection_items[i], async (fixed_up_item) => {
        await storage.setItem(`item_${fixed_up_item["id"]}`, fixed_up_item);
        await delay(); // rate limited
      });
    }
    callback();
  });
};

// Need to get full release data from API and merge with custom fields
DataBuilder.prototype.fixUpItem = async function (raw_item, callback) {
  const folders = await storage.getItem("folders");
  const custom_fields = await storage.getItem("custom_fields");
  let fixed_up_item = {};
  discogs.downloadRelease(raw_item["id"], async (release) => {
    release["custom_data"] = [];
    release["folder"] = {
      id: raw_item["folder_id"],
      name: folders[raw_item["folder_id"]].name,
      crate: folders[raw_item["folder_id"]].crate,
      section: folders[raw_item["folder_id"]].section
    };
    for (let i in raw_item["notes"]) {
      raw_item["notes"][i]["name"] = custom_fields[raw_item["notes"][i]["field_id"]].name;
      release["custom_data"].push(raw_item["notes"][i]);
    }
    fixed_up_item = release;
    this.log(`fixUpItem: ${fixed_up_item["id"]}`);
    callback(fixed_up_item);
  });
};

module.exports = DataBuilder;
