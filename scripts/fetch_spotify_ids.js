/*
  fetch_spotify_ids.js
*/

const Spotify = require('../spotify.js');
let spotify = new Spotify();
const PG = require('../pg.js');
let pg = new PG();

const LIMIT = 50; // schedule this script.  LIMIT avoids 429s

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

const update = async function (item_key, new_json) {
  if (!new_json) throw Error('null new_json');
  let query = `
    UPDATE items SET value = jsonb_set(value, '{spotify}', $1) WHERE items.key = $2
  `;
  let values = [new_json, item_key];
  await pg.client.query(query, values);
};

(async () => {
  let items = await getItems();

  for (let i = 0; i < items.length; i++) {
    let item = items[i];
    spotify.getClientAccessToken((data) => {
      spotify.search(item.artist, item.title, async (results) => {

        if (results.statusCode) {
          pg.log('fetch_spotify_ids', `http error: ${error}`, 'error');

        } else {

          let spitems = results.albums.items;
          let spitem_match = {};
          if (spitems.length > 0) {
            spitems.forEach((spitem) => {
              if (spotify.isMatch(item.artist, spitem.artists[0].name) && spotify.isMatch(item.title, spitem.name)) {
                spitem_match = spitem;
              }
            });
            if (Object.keys(spitem_match).length !== 0) {
              pg.log('fetch_spotify_ids', `${item.key} ${item.artist} '${item.title}'/'${spitem_match.name}' ${spitem_match.id}`, 'info');
            } else {
              pg.log('fetch_spotify_ids', `${item.key} ${item.artist} '${item.title}' not found`, 'warn');
            }
          }
          await update(item.key, spitem_match);

        } // non 200
      }); // search
    }); // token
    await delay();
  };
})();
