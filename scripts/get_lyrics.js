/*
  get_lyrics.js

  Scheduled job to fetch track lyrics, if available.  Uses Lyrist API.
  Rate-limited to 150 requests/hour.
*/

const Lyrics = require('../lyrics.js');
let lyrics = new Lyrics();
const PG = require('../pg.js');
let pg = new PG();

// Grabs a list of tracks for which to attempt to fetch lyrics
//  track: { item_key: , position: , title: , artist: }
let getTargetTracks = async function (cursor) {
  let query = `
    SELECT
      key AS item_key,
      jsonb_array_elements(value -> 'tracklist') -> 'position' AS position,
      jsonb_array_elements(value -> 'tracklist') -> 'title' AS title,
      value -> 'artists' -> 0 -> 'name' AS artist
    FROM items
    LIMIT 25
  `;
  let res = await pg.client.query(query);
  return res.rows;
};

let getCursor = async function () {};

// Cursor stores last position processed in state table
let setCursor = async function () {};

(async () => {
  await pg.connect();
  let cursor = await getCursor();

  let target_tracks = await getTargetTracks(cursor);
  await pg.logger.log('get_lyrics.js', `Attempting lyrics fetch for ${target_tracks.length} tracks`, 'info');

  target_tracks.forEach(async (track) => {
    lyrics.get(track.title, track.artist, async (data) => {
      if (data.lyrics) {
        let query = `
          INSERT INTO lyrics (item_key, track_position, track_title, artist, lyrics)
          VALUES (${track.item_key}, ${track.position}, ${track.title}, ${track.artist}, ${data.lyrics})
          ON CONFLICT (item_key, track_position)
          DO UPDATE SET lyrics = ${data.lyrics}
          RETURNING (item_key, track_position) AS result;
        `;
        let res = await pg.client.query(query);
        await pg.logger.log('get_lyrics.js', `Set lyrics for ${res}`, 'info');
      } else {
        await pg.logger.log('get_lyrics.js', `Could not locate ${track.title}/${track.artist}. Skipping`, 'warn')
      }
      await setCursor(track.item_key);
    });
  });

  await pg.end();
})();
