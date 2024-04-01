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
const storage = require("node-persist"); // DEPRECATED

const PG = require("./pg.js");
let pg = new PG();

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

DataBuilder.prototype.mount = async function () {
  await pg.connect();
  this.log(`mount: ${JSON.stringify(pg['client']['connectionParameters'], null, 2)}`);
};

DataBuilder.prototype.unmount = async function () {
  await pg.end();
  this.log(`unmount`);
}

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
DataBuilder.prototype.buildFoldersList = async function () {
  discogs.downloadFolders(async (data) => {
    let raw_folders = data["folders"];
    for (let i in raw_folders) {
      let this_folder = {
        id: String(raw_folders[i]["id"]),
        name: raw_folders[i]["name"],
        name_encoded: encodeURIComponent(raw_folders[i]["name"]),
        crate: raw_folders[i]["name"].substring(0, 2),
        section: raw_folders[i]["name"].substring(3),
        count: raw_folders[i]["count"]
      };
      await pg.set("folders", raw_folders[i]["id"], this_folder);
      this.log(`folder ${this_folder.name}`);
    }
  });
};

// {"1": {field}, "2": {field},...}
DataBuilder.prototype.buildFieldsList = async function () {
  discogs.downloadCustomFields(async (data) => {
    let raw_fields = data["fields"];
    for (let i in raw_fields) {
      let this_field = {
        id: raw_fields[i]["id"],
        name: raw_fields[i]["name"]
      };
      await pg.set("fields", raw_fields[i]["id"], this_field);
      this.log(`field ${this_field.name}`);
    }
  });
};

// TODO paginate through collection (instead of downloading export)
DataBuilder.prototype.buildItemsList = async function (folder_id) {
  discogs.downloadCollectionItems(folder_id, async (data) => {
    let items = data["releases"];
    for (let i in items) {
      this.fixUpItem(items[i], async (fixed_up_item) => {
        await pg.set("items", fixed_up_item["id"], fixed_up_item);
        this.log(`item ${fixed_up_item["id"]} ${fixed_up_item["title"]}`);
        await delay(); // rate limited
      });
    }
  });
};

// Need to get full release data from API and merge with custom fields
DataBuilder.prototype.fixUpItem = async function (raw_item, callback) {
  let fixed_up_item = {};
  discogs.downloadRelease(raw_item["id"], async (release) => {
    let folder_dict = await pg.getFolder(raw_item["folder_id"]);

    release["folder"] = {
      id: folder_dict.id,
      name: folder_dict.name,
      crate: folder_dict.crate,
      section: folder_dict.section
    };

    release["custom_data"] = [];
    for (let i in raw_item["notes"]) {
      let field_dict = await pg.getField(Number(raw_item["notes"][i]["field_id"]));
      raw_item["notes"][i]["name"] = field_dict.name;
      release["custom_data"].push(raw_item["notes"][i]);
    }

    fixed_up_item = release;
    this.log(`fixUpItem: ${fixed_up_item["id"]}`);
    callback(fixed_up_item);
  });
};

module.exports = DataBuilder;
