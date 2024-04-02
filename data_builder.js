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

// utility function for rate limited calls
const delay = async (ms = 1050) =>
  new Promise((resolve) => setTimeout(resolve, ms));

let DataBuilder = function () {
  this.log_details = [];
};

DataBuilder.prototype.mount = async function () {
  await pg.connect();
  this.log(`mount: ${JSON.stringify(pg['client']['connectionParameters'], null, 2)}`);
};

DataBuilder.prototype.unmount = async function () {
  await pg.end();
  this.log(`unmounted database ${pg.client.database}`);
}

DataBuilder.prototype.log = function (message) {
  let ts = new Date().toISOString();
  let str = `[${ts}] ${message}`;
  this.log_details.push(str);
  console.log(str);
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

// Stubs are returned by Discogs.getCollectionPage.  They
// need to be fixed up.  Stubs are combined with Releases to
// make collection Items.
DataBuilder.prototype.processItemStubs = async function (stubs, callback) {
  let i = 0;
  for (i; i < stubs.length; i++) {
    console.log(`processing stub ${i}`);
    await this.fixUpItem(stubs[i], async (item) => {
      await this.upsert('items', item.id, item);
    });
    await delay();
  }
  callback(i);
};

DataBuilder.prototype.upsert = async function (resource, key, value) {
  try {
    await pg.set(resource, key, value);
    this.log(`upserted ${resource} ${key}`);
  } catch (err) {
    this.log(`pg err: ${err}`);
  }
};

// Need to get full release data from API and merge with custom fields
DataBuilder.prototype.fixUpItem = async function (stub, callback) {
  let fixed_up_item = {};
  discogs.downloadRelease(stub["id"], async (release) => {
    let folder_dict = await pg.getFolder(stub["folder_id"]);

    release["folder"] = {
      id: folder_dict.id,
      name: folder_dict.name,
      crate: folder_dict.crate,
      section: folder_dict.section
    };

    release["custom_data"] = [];
    for (let i in stub["notes"]) {
      let field_dict = await pg.getField(Number(stub["notes"][i]["field_id"]));
      stub["notes"][i]["name"] = field_dict.name;
      release["custom_data"].push(stub["notes"][i]);
    }

    fixed_up_item = release;
    callback(fixed_up_item);
  });
};

module.exports = DataBuilder;
