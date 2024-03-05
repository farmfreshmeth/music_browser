/*
  Discogs.com/storage client.  https://www.discogs.com/developers/#

  'get' methods use local storage.  'download' methods hit the api

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
  this.collection = [];
 }

 Discogs.prototype.mountStorage = async function(callback = () => {}) {
  await storage.init();
  console.log('Discogs mounted storage');
  callback();
}

// TODO downloaExport
  // initiate new export
  // wait for finished signal
  // download

// TODO change to downloadFolders
Discogs.prototype.getFolders = function(callback) {
  this.https_options.path = '/users/' + process.env.DISCOGS_USER + "/collection/folders";
  this.sendRequest(callback);
};

// TODO change to downloadCustomFields
Discogs.prototype.getCustomFields = function(callback) {
  this.https_options.path = '/users/' + process.env.DISCOGS_USER + "/collection/fields";
  this.sendRequest(callback);
}

Discogs.prototype.buildFolderListFromCollection = async function() {
  let uniq_folders = await storage.valuesWithKeyMatch(/folder/);
  uniq_folders = uniq_folders[0]; // do not know why it's wrapped in an array element
  for (let i in uniq_folders) {
    uniq_folders[i]["encoded_name"] = encodeURIComponent(uniq_folders[i]["name"]);
  }
  this.folders = uniq_folders;
}

Discogs.prototype.getFolder = function(folder_id) {
  var folder_arr = this.folders.filter((folder) => { return folder['id'] == folder_id; });
  return folder_arr[0];
}

Discogs.prototype.getReleases = async function(folder_name) {
  var results = [];
  await storage.forEach(async (release) => {
    if (release.value.custom_fields &&
        release.value.custom_fields.folder == folder_name) {
      results.push(release.value);
    }
  });
  return results;
};

Discogs.prototype.downloadReleases = function(folder_id, callback) {
  this.https_options.path = '/users/' + process.env.DISCOGS_USER + "/collection/folders/" + folder_id + "/releases"
  this.sendRequest(callback);
}

Discogs.prototype.getRelease = async function(release_id_str, callback) {
  let release = await storage.getItem(release_id_str);
  callback(release);
}

Discogs.prototype.downloadRelease = function(release_id, callback) {
  // https_options.path = '/releases/' + release_id;
  // this.sendRequest(callback);
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