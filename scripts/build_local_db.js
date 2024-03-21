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

let env = "";
if (process.argv.includes("--production")) {
  env = "production";
} else if (process.argv.includes("--test")) {
  env = "test";
} else {
  env = "development";
}
let flush = process.argv.includes("--flush") ? true : false; // don't flush unless you have to

let opts = {
  env: env,
  flush: flush,
};

let builder = new DataBuilder(opts);
builder.mountStorage();

(async (opts) => {
  await builder.flushDB(flush, async () => {
    await builder.buildFoldersList(async () => {
      await builder.buildCustomFieldsList(async () => {
        await builder.buildCollectionItemsList(folder_id, async () => {
          builder.log("DB rebuilt: " + JSON.stringify(opts));
          if (opts.env == "production") {
            mailer.send("DataBuilder report", builder.log_details.join("\n"));
          }
        });
      });
    });
  });
})(opts);
