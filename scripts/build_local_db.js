#!/opt/homebrew/bin/node

/*
  build_local_db.js

  Downloads entire Discogs collection and builds a list
  of custom JSON for easy browsing and filtering. Uses
  node-persist for storage.

  TAKES TIME!  Cron this or dish to a worker
*/

let DataBuilder = require("../data_builder.js");
let Mailer = require("../mailer.js");
let mailer = new Mailer();
let folder_id = 0; // all
let exec = require('child_process').exec;

let env = "";
let db = "";
if (process.argv.includes("--production")) {
  env = "production";
  db = "";
} else if (process.argv.includes("--test")) {
  env = "test";
  db = "music_browser_test";
} else {
  env = "development";
  db = "music_browser";
}
let flush = process.argv.includes("--flush") ? true : false;

let opts = {
  env: env,
  flush: flush,
  db: db,
};

if (flush) {
  exec(`psql -U farmfreshmeth -d ${opts.db} -f ./scripts/provision_db.sql`, (err, stdout, stderr) => {
    console.log(`flushed database ${opts.db}`);
  });
}

let builder = new DataBuilder(opts);

(async (opts) => {
  await builder.mount();
  await builder.buildFoldersList();
  await builder.buildFieldsList();
  await builder.buildItemsList(0); // All

})(opts);

// (async (opts) => {
//   await builder.mount(async () => {
//     await builder.flushDB(opts.flush, async () => {
//       await builder.buildFoldersList(async () => {
//         await builder.buildCustomFieldsList(async () => {
//           await builder.buildCollectionItemsList(folder_id, async () => {
//             builder.log("DB rebuilt: " + JSON.stringify(opts));
//             if (opts.env == "production") {
//               mailer.send("DataBuilder report", builder.log_details.join("\n"));
//             }
//           });
//         });
//       });
//     });
//   });
// })(opts);
