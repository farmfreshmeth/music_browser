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
const fs = require("fs");
const { parse } = require("csv-parse");
const Mailer = require("./mailer.js");
const mailer = new Mailer();

// make a loop pause to stay under api rate limit (60/min)
const delay = async (ms = 1050) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// opts: download: true, request_export: true, flush: true, env: "production"
let DataBuilder = function (opts) {
  this.opts = opts;
  this.log = [];
};

DataBuilder.prototype.mountCollection = async function(env) {
  let db_dir = env == "production" ? ".node-persist" : "tests/data";
  await storage.init({ dir: db_dir });
  this.collection = new Collection(storage);
  this.log.push(`Mounted collection [env: ${this.opts.env}]`);
};

DataBuilder.prototype.requestExport = async function () {
  this.log.push("requestExport");
};

DataBuilder.prototype.checkExport = async function () {
  this.log.push("checkExport");
};

DataBuilder.prototype.downloadExport = async function () {
  this.log.push("downloadExport");
};

DataBuilder.prototype.parseExport = function () {


  var rows = [];
  fs.createReadStream(export_file)
    .pipe(parse({ delimiter: ",", from_line: 2 }))
    .on("data", function (row) {
      collection.push(row);
    })
    .on("end", function () {
      // TODO persist or pass to download?
    })
    .on("error", function (error) {
      this.log.push(error.message);
    });
  this.log.push("parseExport");
};

DataBuilder.prototype.persist = async function () {
  this.log.push("persist");
};

DataBuilder.prototype.downloadReleases = async function () {
  // loop with delay
  this.log.push("downloadReleases");
};

DataBuilder.prototype.downloadLyrics = async function () {
  // TODO genius.getLyrics();
};

DataBuilder.prototype.mergeData = function () {
  this.log.push("mergeData");
};

DataBuilder.prototype.buildFolderList = function () {
  // collection.buildFolderList()
  this.log.push("buildFolderList");
};

DataBuilder.prototype.cleanup = async function () {
  // cleanup: remove collection key, remove old data, promote new data, send log via email

  // respect opts.flush
  this.log.push("clean up");
};

/* ================= main ====================== */

DataBuilder.prototype.rebuildDB = async function () {
  await this.mountCollection(this.opts.env);
  if (this.opts.request_export) {
    this.requestExport()
    this.checkExport();
    this.downloadExport();
  };
  this.parseExport();
  this.persist();
  if (this.opts.download) { this.downloadReleases() };
  this.downloadLyrics();
  this.mergeData();
  this.buildFolderList();
  this.cleanup();

  this.log.push("DB rebuilt: " + JSON.stringify(this.opts));
  if (this.opts.env == "production") {
    mailer.send("DataBuilder report", this.log.join("\n"))
  } else {
    console.log(this.log.join("\n"));
  };
};

module.exports = DataBuilder;

