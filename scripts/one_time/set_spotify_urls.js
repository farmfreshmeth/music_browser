/*
  set_spotify_urls.js

  Takes rough-guess Spotify urls and stashes them in
  custom field "Spotify URL" (id: 6) so Spotify
  links can be edited manually from now on.

  Run once
*/

require("dotenv").config();
const Discogs = require("../discogs.js");
const discogs = new Discogs();
const PG = require("../pg.js");
let pg = new PG();

const FIELD = 6; // Spotify URL
const LIMIT = 1000;

const delay = async (ms = 1050) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// https://open.spotify.com/album/2n3HUMLmNl0Cm2atVwWSK6?si=qpt-f9rQQs6moV1E13oRpQ
// https://open.spotify.com/album/5YZjpyw1ob1U0166Jgi2Yh?si=zsxk_3IhRgi0tq9cmna5VA
let spotifyUrl = function (id) {
  return `https://open.spotify.com/album/${id}`;
};

(async () => {
  let query = `
    SELECT
      value -> 'id' AS release_id,
      value -> 'instance_id' AS instance_id,
      value -> 'folder' -> 'id' AS folder_id,
      value -> 'spotify' ->> 'id' AS spotify_id,
      value -> 'spotify' -> 'external_urls' ->> 'spotify' AS spotify_url
    FROM items
    WHERE value -> 'spotify' ->> 'id' IS NOT NULL
    LIMIT ${LIMIT}
  `;
  let res = await pg.client.query(query);

  res.rows.forEach((row) => {
    discogs.updateCustomField(
      row.release_id,
      row.instance_id,
      row.folder_id,
      FIELD,
      row.spotify_url,
      async (data) => {
        let custom_field = {
          "name": "Spotify URL",
          "value": row.spotify_url,
          "field_id": 6
        };
        query = `
          UPDATE items SET
            value = jsonb_set(value, '{custom_data,99}', $2) - 'spotify'
          WHERE key = $1
        `;
        await pg.client.query(query, [row.release_id, custom_field]);
        await delay();
      },
    );
  });
})();
