/*
  Discogs.com API client
*/

// possibly the wrong approach b/c of async

const https = require('https');

var Discogs = function() {
  this.https_options = {
    hostname: 'api.discogs.com',
    port: 443,
    path: '',
    method: 'GET',
    headers: {
      "User-Agent": "FFMBrowser/1.0 +https://github.com/farmfreshmeth/music_browser",
      "Authorization": "Discogs token=" + process.env.DISCOGS_PERSONAL_ACCESS_TOKEN
    }
  };
  this.basePath = '/users/' + process.env.DISCOGS_USER
  this.endpoints = {
    folders: "/collection/folders"
  };
}

Discogs.prototype.getFolders = function(callback) {
  this.https_options.path = this.basePath + this.endpoints.folders;

  var req = https.request(this.https_options, (res) => {
    if (res.statusCode !== 200) {
      console.error(`Did not get an OK from the server. Code: ${res.statusCode}`);
      res.resume();
      return;
    }

    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('close', () => {
      callback(data);
    });
  });

  req.on('error', (e) => {
    console.error(e);
  });
  req.end();
};

module.exports = Discogs;