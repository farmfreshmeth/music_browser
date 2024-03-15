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
// const Genius = require("./genius.js");
const discogs = new Discogs();
// const genius = new Genius();
const fs = require("fs");
const { parse } = require("csv-parse");
const Mailer = require("./mailer.js");
var mailer = new Mailer();

var log = [];

// make a loop pause to stay under api rate limit (60/min)
const delay = async (ms = 1050) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const requestExport = async function () {
  console.log("requestExport");
};

const checkExport = async function () {
  console.log("checkExport");
};

const downloadExport = async function () {
  console.log("downloadExport");
};

const parseExport = function () {};

const persist = async function () {};

const downloadReleases = async function () {
  // loop with delay
};

const downloadLyrics = async function () {
  // genius.getLyrics();
};

const mergeData = function () {};

const buildFolderList = function () {
  // collection.buildFolderList()
};

const cleanup = async function () {
  // cleanup: remove collection key, remove old data, promote new data, send log via email
};

/* ================= main ====================== */

var DataBuilder = function (collection) {
  this.collection = collection;
};

DataBuilder.prototype.rebuildDB = async function () {

  console.log("dataBuilder.collection: " + this.collection);

  requestExport();
  checkExport();
  downloadExport();
  parseExport();
  persist();
  downloadReleases();
  downloadLyrics();
  mergeData();
  buildFolderList();
  cleanup();

  log.push("DB rebuilt");
  mailer.send("DataBuilder report", log.join("\n"));
};

module.exports = DataBuilder;

