/*
  spotify_search.js -a artist -t title
*/

console.log(process.argv);

// [
//   '/opt/homebrew/Cellar/node/21.7.1/bin/node',
//   '/Users/bob/music_browser/scripts/spotify_search.js',
//   '-a',
//   'Duran Duran',
//   '-t',
//   'Seven and the Ragged Tiger'
// ]

const Spotify = require('../spotify.js');
let spotify = new Spotify();

let artist = process.argv[process.argv.indexOf('-a') + 1];
let title = process.argv[process.argv.indexOf('-t') + 1];

if (artist && title) {
  spotify.getClientAccessToken((data) => {

    console.log(`Searching Spotify for artist '${artist}', title '${title}'`);
    spotify.search(artist, title, async (results) => {
      console.log(results.albums.items);

      results.albums.items.forEach((spitem) => {
        if (spotify.isMatch(artist, spitem.artists[0].name) && spotify.isMatch(title, spitem.name)) {
          console.log(`MATCH ${spitem.artists[0].name}: '${spitem.name}' == '${title}', spotify_id: ${spitem.id}\n`);
        } else {
          console.log(`MISS ${spitem.artists[0].name}: '${spitem.name}' != '${title}'\n`);
        }
      });
    });

  });
} else {
  console.log(`usage: spotify_search.js -a 'artist' -t 'title'`);
}
