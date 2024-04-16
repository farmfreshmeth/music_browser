/*
  examine_discogs.js

    For testing/inspecting live API calls
*/

const Discogs = require('../discogs.js');
let discogs = new Discogs();
let total_pages = 1;

// utility function for rate limited calls
const delay = (ms = 1050) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// discogs.totalCollectionItems(0, (data) => {
//   total_pages = data;
//   console.log(`totalCollectionItems: ${total_pages}`);
// });

discogs.getCollectionPage(0, 1, total_pages, (page, total_pages, pageItems) => {
  console.log(`got ${pageItems.length} items\n${JSON.stringify(pageItems, null, 2)}`);
});

// (async () => {
//   for (let outer = 1; outer <= 50; outer++) {
//     await delay();
//     for (let inner = 0; inner < 100; inner++) {
//       await delay();
//       console.log(`[${new Date().toISOString()}] outer loop ${outer} inner loop ${inner}`);
//     }
//   }
// })();
