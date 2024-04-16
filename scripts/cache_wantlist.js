/*
  cache_wantlist.js
*/

const Discogs = require("../discogs.js");
let discogs = new Discogs();
const PG = require("../pg.js");
let pg = new PG();

PER_PAGE = 50;

(async () => {

  discogs.getWantlist(1, PER_PAGE, async (outer_res) => {
    let total_pages = outer_res.pagination.pages;

    for (let page = 1; page <= total_pages; page++) {
      discogs.getWantlist(page, PER_PAGE, async (res) => {
        await pg.log('cache_wantlist', `Fetched page ${page} of ${total_pages} of want list`, 'info');
        var wants = res.wants;

        wants.forEach(async (want) => {
          await pg.set('wants', want.id, want.basic_information);
          console.log(`persisted ${want.id}`);
        });
      });
    }
  });

})();
