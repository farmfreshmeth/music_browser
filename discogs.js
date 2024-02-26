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
 }

// Common to all endpoints
Discogs.prototype.sendRequest = function(callback) {
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
      callback(JSON.parse(data));
    });
  });

  req.on('error', (e) => {
    console.error(e);
  });
  req.end();
}

Discogs.prototype.getFolders = function(callback) {
  this.https_options.path = '/users/' + process.env.DISCOGS_USER + "/collection/folders";
  this.sendRequest(callback);
};

Discogs.prototype.getReleases = function(folder_id, callback) {
  this.https_options.path = '/users/' + process.env.DISCOGS_USER + "/collection/folders/" + folder_id + "/releases"
  this.sendRequest(callback);
};

Discogs.prototype.getRelease = function(release_id, callback) {
  this.https_options.path = '/releases/' + release_id;
  this.sendRequest(callback);
};

module.exports = Discogs;