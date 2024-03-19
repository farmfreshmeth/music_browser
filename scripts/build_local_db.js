#!/opt/homebrew/bin/node

/*
  build_local_db.js

  Downloads entire Discogs collection and builds a list
  of custom JSON for easy browsing and filtering. Uses
  node-persist for storage.

  TAKES TIME!  Cron this or dish to a worker
*/

let DataBuilder = require("../data_builder.js");

let env = process.argv.includes("--production") ? "production" : "test";
let request_export = process.argv.includes("--no-export") ? false : true;
let download = process.argv.includes("--no-download") ? false : true;
let flush = process.argv.includes("--no-flush") ? false : true;

let opts = {
  env: env,
  request_export: request_export,
  download: download,
  flush: flush,
};
let export_file = "tests/test_export.csv";

let builder = new DataBuilder(opts);

(async (opts) => {
  if (opts.flush) {
    await builder.flushDB();
  }

  await builder.mountCollection();

  if (opts.request_export) {
    let export_id = await builder.requestExport();
    await builder.checkExport(export_id);
    builder.export_file = await builder.downloadExport();
  }

  await builder.parseExport(export_file);

  if (opts.download) {
    let release_ids = builder.export_rows.map(function (value, index) {
      return value[7];
    });
    await builder.downloadReleases(release_ids);
  }

  await builder.downloadLyrics();
  await builder.mergeData();
  await builder.buildFolderList();
  await builder.cleanup();

  builder.log("DB rebuilt: " + JSON.stringify(opts));
  if (opts.env == "production") {
    mailer.send("DataBuilder report", builder.log_details.join("\n"));
  } else {
    console.log(builder.log_details.join("\n"));
  }
})(opts);

/*

require("dotenv").config();
const Discogs = require("../discogs.js");
const discogs = new Discogs();
const fs = require("fs");
const { parse } = require("csv-parse");
const storage = require("node-persist");
const wait_ms = 1050; // even though it's 60/min, keep getting 429s

const flush = async () => {
  await storage.init();
  await storage.clear();
}

const persist = async (key, value) => {
  await storage.init();
  await storage.setItem(key, value);
};

const downloadExport = async function() {
  // TODO
  return filepath;
}

const getPrimaryImage = function (images_arr) {
  for (i in images_arr) {
    if (images_arr[i]["type"] == "primary") { return images_arr[i]; }
  }
}

const delay = async (ms = 1000) =>
  new Promise(resolve => setTimeout(resolve, ms));

// Build custom collection objects
const downloadReleaseData = async (collection) => {
  for (let i in collection) {
    discogs.downloadRelease(collection[i][7], (release) => {
      persist(String(release["id"]), release);
      console.log(
        [i, collection[i][0], collection[i][2], collection[i][1]].join(" | ")
      );
    });
    await delay(wait_ms);
  }
}

async function mergeFields(collection) {
  for (let i in collection) {
    release_id = String(collection[i][7]);
    let release = await storage.getItem(release_id);
    console.log(release);
    release["custom_fields"] = {
      folder: collection[i][8],
      crate_num: collection[i][8].slice(0,2),
      section: collection[i][8].slice(3),
      media_condition: collection[i][10],
      sleeve_condition: collection[i][11],
      from_collection: collection[i][12],
      notes: collection[i][13]
    };
    await storage.setItem(release_id, release);
    console.log(["Merged", i, collection[i][0], collection[i][2], collection[i][1]].join(" | "),);
  }
}

function fetchLyrics(release_id_str) {
  // TODO
}

*/

/* script */

// flush db
/*
if (!process.argv.includes("--no-flush")) { flush(); }

// set export_file
let export_file = "";
if (!process.argv.includes("--no-export")) {
  export_file = discogs.downloadExport();
} else {
  export_file = "./data/" + process.env.EXPORT_FILE;
}

// parse export, join to release & persist
var collection = [];
fs.createReadStream(export_file)
  .pipe(parse({ delimiter: ",", from_line: 2 }))
  .on("data", function (row) {
    collection.push(row);
  })
  .on("end", function () {
    persist("collection_csv", collection);
    console.log("Persisted " + collection.length + " collection records");
    if (!process.argv.includes("--no-download")) { downloadReleaseData(collection); }
    mergeFields(collection);
  })
  .on("error", function (error) {
    console.log(error.message);
  });
*/
