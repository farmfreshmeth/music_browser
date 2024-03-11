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
const fs = require("fs");
const { parse } = require("csv-parse");
const storage = require("node-persist");
const wait_ms = 1050; // even though it's 60/min, keep getting 429s

var DataBuilder = function () {
  this.log = [];
};

DataBuilder.prototype.rebuildDB = async function () {
  // request export
  // wait while export completes
  // download export, parse, persist
  // loop collection items
    // get release from api
    // get lyrics
    // merge custom fields & lyrics
    // persist into temporary space
  // cleanup: remove collection key, remove old data, promote new data, send log via email
  console.log("rebuildDB");
};

module.exports = DataBuilder;


// storage format
// {
//   collection: [],
//   releases: [],
//   folders: []
// }