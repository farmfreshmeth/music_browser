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

const PG = require("./pg.js");
let pg = new PG();

const Collection = require('./collection.js');
let collection = new Collection(pg);

const fs = require("node:fs/promises");
const Mailer = require("./mailer.js");
const mailer = new Mailer();

// utility function for rate limited calls
const delay = async (ms = 1050) =>
  new Promise((resolve) => setTimeout(resolve, ms));

let DataBuilder = function () {};

DataBuilder.prototype.log = function (message, level = 'info') {
  pg.log('data_builder', message, level)
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

DataBuilder.prototype.getItem = async function (id) {
  let query = `
    SELECT value FROM items WHERE key = $1
  `;
  let values = [id];
  let res = await pg.client.query(query, values);
  if (res.rows.length > 0) {
    return res.rows[0].value;
  } else {
    return undefined;
  }
};

// Stubs are returned by Discogs.getCollectionPage.  They
// need to be fixed up.  Stubs are combined with Releases to
// make collection Items.
DataBuilder.prototype.processItemStubs = async function (stubs, callback) {
  let i = 0;
  for (i; i < stubs.length; i++) {
    let stub = stubs[i];
    let item = await this.getItem(stub.id);
    if (item) {
      let folder = await collection.getFolderStruct(stub.folder_id);
      let custom_data = await collection.getFieldsStruct(stub.notes);
      let query = `
        UPDATE items SET value =
          jsonb_set(jsonb_set(value, '{folder}', $1), '{custom_data}', $2)
        WHERE key = $3
      `;
      let values = [JSON.stringify(folder), JSON.stringify(custom_data), item.id];
      await pg.client.query(query, values);
      await pg.log('data_builder', `UPDATED ITEM ${item.id} ${item.title}`, 'info');
    } else {
      await this.fixUpItem(stubs[i], async (item) => {
        await this.upsert('items', item.id, item);
        await pg.log('data_builder', `NEW ITEM ${item.id} ${item.title}`, 'info');
      });
      await delay();
    }
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
  discogs.downloadRelease(stub["id"], async (release) => {
    release["folder"] = await collection.getFolderStruct(stub["folder_id"]);
    release["custom_data"] = await collection.getFieldsStruct(stub['notes']);
    callback(release);
  });
};

module.exports = DataBuilder;
