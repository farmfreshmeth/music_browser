#!/opt/homebrew/bin/node

/*
  build_local_db.js

  Downloads entire Discogs collection and builds a list
  of custom JSON for easy browsing and filtering. Uses
  node-persist for storage.

  TAKES TIME!  Cron this or dish to a worker

  $ heroku run --app music-browser node scripts/build_local_db.js
*/

require("dotenv").config();
const Discogs = require("../discogs.js");
let discogs = new Discogs();
let DataBuilder = require("../data_builder.js");
let builder = new DataBuilder();
let Mailer = require("../mailer.js");
let mailer = new Mailer();

let total_items;
let item_stubs = [];
let folder = 0; // 5396560; // soft rock.  34 items

// utility function for rate limited calls
const delay = async function (ms = 1050) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

(async () => {
  await builder.mount();
  await builder.buildFoldersList();
  await builder.buildFieldsList();

  discogs.totalCollectionItems(folder, async (items) => {
    total_items = items;
    let total_pages = Math.ceil(total_items / process.env.PER_PAGE);

    for (let p = 1; p <= total_pages; p++) {
      console.log(`page ${p} of ${total_pages}`);
      discogs.getCollectionPage(
        folder,
        p,
        total_pages,
        async (p, total_pages, stubs) => {
          item_stubs = item_stubs.concat(stubs);
        },
      );
      await delay();
    }

    console.log(`stubs: ${item_stubs.length}`);
    builder.processItemStubs(item_stubs, async (last) => {
      console.log(`done processing ${last} item stubs`);
      await builder.unmount();

      mailer.send(
        `DataBuilder report [${process.env.NODE_ENV} ${new Date().toISOString()}]`,
        builder.log_details.join("\n"),
      );
    });
  });
})();
