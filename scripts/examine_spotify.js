/*
  examine_spotify.js

  for dev
*/

const Spotify = require('../spotify.js');
let spotify = new Spotify();
const PG = require('../pg.js');
let pg = new PG();

const LIMIT = 10;

// Spotify doesn't specify a requests-per-second, so try this
const delay = async function (ms = 250) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

const getItems = async function () {
  let query = `
    SELECT
      items.key AS key,
      items.value ->> 'title' AS title,
      items.value #>> '{artists, 0, name}' AS artist
    FROM items
    WHERE
      items.value ->> 'spotify' IS NULL
    LIMIT ${LIMIT}
  `;
  let res = await pg.client.query(query);
  return res.rows;
};

(async () => {
  let items = await getItems();
  console.log(items);

  for (let i = 0; i < items.length; i++) {
    let item = items[i];
    spotify.getClientAccessToken((data) => {
      spotify.search(item.artist, item.title, async (results) => {
        if (results.statusCode) {
          pg.log('fetch_spotify_ids', `http error: ${error}`, 'error');
        } else {
          let spotify_items = results.albums.items;
          console.log(`${spotify_items.length} spotify items for ${item.title}`)

          // console.log(JSON.stringify(spotify_items, null, 2));
          /*
            from array of spitems:
            - map return 'name'
            - do exact compare item.title to spitem.name
            - default: {}
          */
          spotify_items.forEach((spitem) => {
            if (spitem.name == item.title) {
              console.log(`${spitem.artists[0].name}: '${spitem.name}' matches '${item.title}'`);
            } else {
              console.log(`${spitem.artists[0].name}: '${spitem.name}' does not match '${item.title}'`);
            }
          });
        }
      });
    });
    await delay();
  };
})();
