/*
  get_lyrics.js

  Scheduled job to fetch track lyrics, if available.  Uses Lyrist API.
  Rate-limited to 150 requests/hour.
*/

const fs = require('node:fs');

const Lyrics = require('../lyrics.js');
let lyrics = new Lyrics();
const PG = require('../pg.js');
let pg = new PG();

const LIMIT = 5;

// Grabs a list of tracks for which to attempt to fetch lyrics
//  track: { item_key: , position: , title: , artist: }
let getTargetTracks = async function () {
  let left_query = `
    SELECT
      key AS item_key,
      jsonb_array_elements(value -> 'tracklist') ->> 'position' AS position,
      jsonb_array_elements(value -> 'tracklist') ->>'title' AS title,
      value -> 'artists' -> 0 ->> 'name' AS artist
    FROM items
  `;
  let right_query = `
    SELECT
      item_key,
      track_position AS position,
      track_title AS title,
      artist
    FROM lyrics
  `;
  query_string = `
    ${left_query}
    EXCEPT
    ${right_query}
    ORDER BY item_key ASC
    LIMIT ${LIMIT};
  `;
  let res = await pg.execute(query_string);
  await pg.log('get_lyrics.js', `Attempting lyrics fetch for ${res.rows.length} tracks`, 'info');
  return res.rows;
};

let persist = async function(track) {
  let query = `
    INSERT INTO lyrics (item_key, track_position, track_title, artist, lyrics) VALUES
    ($1, $2::text, $3::text, $4::text, $5::text)
    ON CONFLICT (item_key, track_position)
    DO UPDATE SET lyrics = $5::text
    RETURNING (item_key, track_position) AS result;
  `;
  let values = [track.item_key, track.position, track.title, track.artist, track.lyrics];
  return await pg.client.query(query, values);
};

(async () => {
  let target_tracks = await getTargetTracks();
  target_tracks.forEach((track) => {
    lyrics.get(track, async (res) => {
      await persist(res);
      pg.log('get_lyrics', `${track.item_key}`, 'info');
    });
  });
})();
