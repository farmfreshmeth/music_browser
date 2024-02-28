/*
  Discogs.com API client
*/

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
  this.folders = undefined;
  this.fields = undefined;
 }

// folders json
// [
//   {
//     "id": 0,
//     "count": 23,
//     "name": "All",
//     "resource_url": "https://api.discogs.com/users/example/collection/folders/0"
//   },
//   {
//     "id": 1,
//     "count": 20,
//     "name": "Uncategorized",
//     "resource_url": "https://api.discogs.com/users/example/collection/folders/1"
//   }
// ]
Discogs.prototype.getFolders = function(callback) {
    this.https_options.path = '/users/' + process.env.DISCOGS_USER + "/collection/folders";
    this.sendRequest(callback);
};

// custom_fields json
// [
//     {
//       "name": "Media",
//       "options": [
//         "Mint (M)",
//         "Near Mint (NM or M-)",
//         "Very Good Plus (VG+)",
//         "Very Good (VG)",
//         "Good Plus (G+)",
//         "Good (G)",
//         "Fair (F)",
//         "Poor (P)"
//       ],
//       "id": 1,
//       "position": 1,
//       "type": "dropdown",
//       "public": true
//     },...
Discogs.prototype.getCustomFields = function(callback) {
  this.https_options.path = '/users/' + process.env.DISCOGS_USER + "/collection/fields";
  this.sendRequest(callback);
}

// Called in app.js
Discogs.prototype.preload = function() {
  this.getFolders((folders) => {
    this.folders = folders;
    this.getCustomFields((fields) => {
      this.fields = fields;
    });
  });
};

Discogs.prototype.getReleases = function(folder_id, callback) {
  this.https_options.path = '/users/' + process.env.DISCOGS_USER + "/collection/folders/" + folder_id + "/releases"
  this.sendRequest(callback);
};

Discogs.prototype.getRelease = function(release_id, callback) {
  this.https_options.path = '/releases/' + release_id;
  this.sendRequest(callback);
};

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
};

module.exports = Discogs;