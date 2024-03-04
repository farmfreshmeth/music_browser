/*
  Discogs.com API client.  https://www.discogs.com/developers/#
*/

const https = require('https');
const storage = require('node-persist');
require('dotenv').config();

let https_options = {
  hostname: 'api.discogs.com',
  port: 443,
  path: '',
  method: 'GET',
  headers: {
    "User-Agent": "FFMBrowser/1.0 +https://github.com/farmfreshmeth/music_browser",
    "Authorization": "Discogs token=" + process.env.DISCOGS_PERSONAL_ACCESS_TOKEN
  }
};

var Discogs = function() {
  this.token = process.env.DISCOGS_PERSONAL_ACCESS_TOKEN
  this.folders = [];
  this.fields = [];
  this.collection = [];
  this.storage = storage;
  this.mountStorage();
 }

Discogs.prototype.getFolders = function(callback) {
    this.https_options.path = '/users/' + process.env.DISCOGS_USER + "/collection/folders";
    this.sendRequest(callback);
};

Discogs.prototype.getCustomFields = function(callback) {
  this.https_options.path = '/users/' + process.env.DISCOGS_USER + "/collection/fields";
  this.sendRequest(callback);
}

Discogs.prototype.mountStorage = async function() {
  await this.storage.init();
  console.log('Discogs mounted storage');
}

// Called in app.js
Discogs.prototype.preload = async function() {
  // TODO fetch from api
  var folders = require("./data/folders.js");
  var fields = require("./data/custom_fields.js");

  // stash in global discogs object for laziness
  this.folders = folders;
  this.fields = fields;

  // persist it too while you're at it
  await this.storage.init();
  await this.storage.setItem("folders", folders);
  await this.storage.setItem("fields", fields);

  // this.getFolders(async (json) => {
  //   this.folders = json['folders'];
  //   console.log(this.folders);
  //   this.getCustomFields(async (json) => {
  //     this.fields = json['fields'];
  //     console.log(this.fields);
  //   });
  // });
};

Discogs.prototype.getFolder = function(folder_id) {
  var folder_arr = this.folders.filter((folder) => { return folder['id'] == folder_id; });
  return folder_arr[0];
}

Discogs.prototype.getReleases = function(folder_id, callback) {
  this.https_options.path = '/users/' + process.env.DISCOGS_USER + "/collection/folders/" + folder_id + "/releases"
  this.sendRequest(callback);
};

Discogs.prototype.getRelease = function(release_id, callback) {
  https_options.path = '/releases/' + release_id;
  this.sendRequest(callback);
};

// Common to all endpoints
Discogs.prototype.sendRequest = function(callback) {
    var req = https.request(https_options, (res) => {
    if (res.statusCode !== 200) {
      console.error(`
        Did not get an OK from the server. Code: ${res.statusCode}
          path: https://${req.host}${req.path}
          headers: ${JSON.stringify(req.getHeaders(), null, 2)}
      `);
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