/*
  examine_spotify.js
*/

const Spotify = require('../spotify.js');
let spotify = new Spotify();

spotify.getClientAccessToken((data) => {
  spotify.search('Miles Davis', 'Kind of Blue', (results) => {
    console.log(JSON.stringify(results.albums.items[0], null, 2));
  });
});

// TODO oEmbed?, iFrame?
