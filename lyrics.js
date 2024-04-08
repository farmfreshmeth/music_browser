/*
  Lyrist API client
    https://lyrist.vercel.app/guide
*/

require("dotenv").config();
const fs = require('node:fs');
const https = require("https");

let dir = './tests/data/lyrics/'; // for cached dev data
const SAVE_TO_FILE = false;

let https_options = {
  hostname: "lyrist.vercel.app",
  port: 443,
  path: "/api/",
  method: "GET",
  headers: {},
};

var Lyrics = function () {};

const filePath = function (key, position) {
  return dir + 'lyrics_' + encodeURIComponent(key) + '_' + encodeURIComponent(position) + '.json';
};

Lyrics.prototype.getByFile = function (key, title, position, artist, callback) {
  fs.readFile(filePath(key, position), 'utf8', (err, data) => {
    if (!err) {
      callback(JSON.parse(data));
    } else {
      callback(false);
    }
  });
};

Lyrics.prototype.getByHttps = function (key, title, position, artist, callback) {

  let exclude_artists = ['Various']; // better chance of finding lyrics without these artists
  if (exclude_artists.includes(artist)) {
    https_options.path = '/api/' + encodeURIComponent(title);
  } else {
    https_options.path = '/api/' + encodeURIComponent(title) + '/' + encodeURIComponent(artist);
  }

  let req = https.request(https_options, (res) => {

    let track = {
      item_key: key,
      title: title,
      position: position,
      artist: artist,
    };

    // Let end() event for 400s and 404s (not found/bad request)
    if (![200, 400, 404].includes(res.statusCode)) {
      console.error(`
        Did not get an OK from the server. Code: ${res.statusCode}
          path: https://${req.host}${req.path}
          headers: ${JSON.stringify(req.getHeaders(), null, 2)}
      `);
    }

    let data = "";
    res.on("data", (chunk) => {
      data += chunk;
    });

    res.on("close", () => {});

    res.on("end", () => {
      let result_json = JSON.parse(data);
      track.lyrics = result_json.lyrics;

      if (SAVE_TO_FILE) {
        fs.writeFile(filePath(key, position) + ``, JSON.stringify(track, null, 2), (err) => {
          if (err) throw err;
        });
      }
      callback(track);
    });
  });

  req.on("error", (e) => {
    console.error(e);
  });

  req.end();
};

// First looks for file (good for dev/test)
Lyrics.prototype.get = function(track, callback) {
  this.getByFile(track.item_key, track.title, track.position, track.artist, (file_res) => {
    if (!file_res) {
      this.getByHttps(track.item_key, track.title, track.position, track.artist, (https_res) => {
        callback(https_res);
      });
    } else {
      callback(file_res);
    }
  });
};

module.exports = Lyrics;