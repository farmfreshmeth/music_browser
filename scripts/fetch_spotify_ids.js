/*
  fetch_spotify_ids.js

  ROUGH MATCH.  Some items will need to be edited
  manually by setting the 'Spotify URL' custom field
  in Discogs.
*/

const Spotify = require('../spotify.js');
let spotify = new Spotify();
const PG = require('../pg.js');
let pg = new PG();
const Discogs = require('../discogs.js');
let discogs = new Discogs();

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
      items.value -> 'instance_id' AS instance_id,
      items.value ->> 'title' AS title,
      items.value #>> '{artists, 0, name}' AS artist,
      jsonb_path_query_array(items.value, '$.custom_data[*] ? (@.field_id == 6)') -> 0 -> 'value' AS spotify_id
    FROM items
    WHERE
      NOT jsonb_path_exists(items.value, '$.custom_data[*] ? (@.field_id == 6)')
    LIMIT ${LIMIT}
  `;
  let res = await pg.client.query(query);
  return res.rows;
};

const update = async function (item, value) {
  let custom_field = {
    "name": "Spotify URL",
    "value": value,
    "field_id": 6
  };
  query = `
    UPDATE items SET
      value = jsonb_set(value, '{custom_data,99}', $1)
    WHERE key = $2
  `;
  let values = [custom_field, item.id];
  await pg.client.query(query, values);
  discogs.updateCustomField(item.key, item.instance_id, 0, 6, value, (data) => {
    pg.log('fetch_spotify_ids', `POST to Spotify ${item.key} ${item.title}`, 'info');
  });
};

(async () => {
  let items = await getItems();

  for (let i = 0; i < items.length; i++) {
    let item = items[i];
    spotify.getClientAccessToken((data) => {
      spotify.search(item.artist, item.title, async (results) => {
        let value = '';
        if (results.statusCode) {
          pg.log('fetch_spotify_ids', `http error: ${results.statusCode}`, 'error')
        } else {
          let spitems = results.albums.items;
          for (let i = 0; i < spitems.length; i++) {
            let spitem = spitems[i];
            if (spotify.isMatch(item.artist, spitem.artists[0].name) && spotify.isMatch(item.title, spitem.name)) {
              value = spitem.external_urls.spotify;
              pg.log('fetch_spotify_ids', `${item.key} ${item.artist} '${item.title}'/'${spitem.name}' ${spitem.id}`, 'info');
              break;
            }
          };
        } // non 200
        if (value == '') {
          pg.log('fetch_spotify_ids', `${item.key} ${item.artist} '${item.title}' not found`, 'warn');
        }
        await update(item, value);
      }); // search
    }); // token
    await delay();
  };
})();
