/*
  dump_stubs.js

  Creates seed data for testing
*/

require("dotenv").config();
const Discogs = require("../../discogs.js");
let discogs = new Discogs();
const fs = require("node:fs/promises");

FILE = './tests/data/stubs.json';
let folder = 5396560; // 5396560; // soft rock.  34 items
let item_stubs = [];

const delay = async (ms = 1050) =>
  new Promise((resolve) => setTimeout(resolve, ms));

(async () => {

  discogs.totalCollectionItems(folder, async (total_items) => {
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
    await fs.writeFile(FILE, JSON.stringify(item_stubs, null, 2));
    console.log(`stubs: ${item_stubs.length}`);
  });

})();