/*
  data_builder.js marshalls data from Discogs into node-persist storage
    it is called by node-scheduler to rebuild the local db from Discogs
    exports and API calls

    it is necessary to do this because the Discogs API doesn't support
    collection search, only full db search.  Using exports avoids having
    to paginate through the collection in the api
*/

require("dotenv").config();
const Discogs = require("./discogs.js");
const discogs = new Discogs();
const storage = require("node-persist");
const Collection = require("./collection.js");
const fs = require("node:fs/promises");
const CSV = require('csv-string');
const Mailer = require("./mailer.js");
const mailer = new Mailer();

// make a loop pause to stay under api rate limit (60/min)
const delay = async (ms = 1050) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// opts: download: true, request_export: true, flush: true, env: "production"
let DataBuilder = function (opts) {
  this.opts = opts;
  this.db_dir = this.opts.env == "production" ? ".node-persist" : "tests/data";
  this.log_details = [];
  this.export_file = "";
  this.export_rows = [];
  this.collection = undefined;
};

// timestamps, adds to log, prints to console
DataBuilder.prototype.log = function (message) {
  let ts = (new Date()).toISOString();
  let str = `[${ts}] ${message}`;
  this.log_details.push(str);
  if (this.opts.env != "test") { console.log(str) };
};

// CAREFUL:  flushing without rebuilding successfully breaks everything
DataBuilder.prototype.flushDB = async function() {
  await storage.init({ dir: this.db_dir });
  await storage.clear();
  this.collection = undefined;
};

DataBuilder.prototype.mountCollection = async function() {
  await storage.init({ dir: this.db_dir });
  this.collection = new Collection(storage);
  this.log(`Mounted collection [env: ${this.opts.env}]`);
};

DataBuilder.prototype.requestExport = async function () {
  let export_url = await discogs.requestExport();
  this.log("requestExport: " + export_url);
  return export_url;
};

DataBuilder.prototype.checkExport = async function (export_url) {
  let download_url = await discogs.checkExport(export_url);
  this.log("checkExport: download ready " + download_url);
  return download_url;
};

DataBuilder.prototype.downloadExport = async function (download_url) {
  let export_file = await discogs.downloadExport(download_url);
  this.log("downloadExport: " + export_file);
  return export_file;
};

DataBuilder.prototype.parseExport = async function (export_file) {
  this.log("parseExport: " + export_file);
  try {

    const fh = await fs.open(export_file, 'r');

    for await (const line of fh.readLines()) {
      let row = CSV.parse(line, ",")[0];
      if (row.length != 15) { console.log(row) };
      this.export_rows.push(row);
    };



    this.export_rows.shift(); // remove column headers
    this.log("parseExport success: " + this.export_rows.length);
    if (this.opts.env == "production") { fs.unlink(export_file) };
    return this.export_rows;

  } catch (err) {
    this.log("parseExport error: " + err.message);
    return undefined;
  };
};

DataBuilder.prototype.downloadReleases = async function (arr_release_ids) {
  this.log("downloadReleases start");
  for (let i in arr_release_ids) {
    discogs.downloadRelease(arr_release_ids[i], async (release) => {
      if (!release) {
        this.log(`downloadReleases: ${arr_release_ids[i]} returned undefined`);
      } else {
        await storage.setItem(arr_release_ids[i], release);
        this.log("downloadReleases: " + [release["id"], release["title"], release["artists_sort"]].join(" | "));
      }
    });
    await delay();
  }
};

DataBuilder.prototype.downloadLyrics = async function () {
  // TODO genius.getLyrics();
};

DataBuilder.prototype.mergeData = async function () {
  for (let i in this.export_rows) {
    release_id = String(this.export_rows[i][7]);
    let release = await storage.getItem(release_id);
    if (release) {
      release["custom_fields"] = {
        folder: this.export_rows[i][8],
        crate_num: this.export_rows[i][8].slice(0,2),
        section: this.export_rows[i][8].slice(3),
        media_condition: this.export_rows[i][10],
        sleeve_condition: this.export_rows[i][11],
        from_collection: this.export_rows[i][12],
        notes: this.export_rows[i][13],
        commentary: this.export_rows[i][14]
      };
      await storage.setItem(release_id, release);
      this.log(["mergeData", i, this.export_rows[i][2], this.export_rows[i][1]].join(" | "),);
    } else {
      this.log(`mergeData error: ${release_id} not in storage.`);
    };
  };
};

/*
  storage["folders"] = [
    {"01 Grateful Dead": {
      "name": "01 Grateful Dead",
      "crate": 1,
      "section": "Grateful Dead",
      "encoded_name": "01%20Grateful%20Dead"
    }},
    {},...
  ]
*/
DataBuilder.prototype.buildFolderList = async function () {
  let releases = await this.collection.releases();
  let folders = [];
  let folder_names = [];
  for (i in releases) {
    let this_folder_name = releases[i]["custom_fields"]["folder"];
    if (!folder_names.includes(this_folder_name)) {
      let folder = {};
      folder[this_folder_name] = {
        "name": this_folder_name,
        "crate": Number(this_folder_name.slice(0, 2)),
        "section": this_folder_name.slice(3),
        "encoded_name": encodeURIComponent(this_folder_name)
      };
      folders.push(folder);
      folder_names.push(this_folder_name);
    }
  }
  await this.collection.storage.setItem("folders", folders);
  this.log("buildFolderList: " + folders.length);
};

DataBuilder.prototype.cleanup = async function () {
  // TODO remove export file if exists
  this.log("clean up");
};

module.exports = DataBuilder;

