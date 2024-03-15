/*
  Discogs.com API client
    https://www.discogs.com/developers/#
*/

require("dotenv").config();
const https = require("https");

let https_options = {
  hostname: "api.discogs.com",
  port: 443,
  path: "",
  method: "GET",
  headers: {
    "User-Agent":
      "FFMBrowser/1.0 +https://github.com/farmfreshmeth/music_browser",
    Authorization: "Discogs token=" + process.env.DISCOGS_PERSONAL_ACCESS_TOKEN,
  },
};

var Discogs = function () {};

Discogs.prototype.requestExport = async function () {};

Discogs.prototype.checkExport = async function () {};

Discogs.prototype.downloadExport = async function () {};

Discogs.prototype.downloadFolders = function () {
  https_options.path =
    "/users/" + process.env.DISCOGS_USER + "/collection/folders";
  this.sendRequest((data) => {
    return data;
  });
};

Discogs.prototype.downloadCustomFields = function () {
  https_options.path =
    "/users/" + process.env.DISCOGS_USER + "/collection/fields";
  this.sendRequest((data) => {
    return data;
  });
};

// For recording category disputes
Discogs.prototype.setCustomFieldValue = function () {
  // TODO
};

Discogs.prototype.downloadRelease = function (release_id) {
  https_options.path = "/releases/" + release_id;
  this.sendRequest((data) => {
    return data;
  });
};

// Common to all endpoints.  Uses callbacks, not promises
Discogs.prototype.sendRequest = function (callback) {
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

    let data = "";

    res.on("data", (chunk) => {
      data += chunk;
    });

    res.on("close", () => {
      callback(JSON.parse(data));
    });
  });

  req.on("error", (e) => {
    console.error(e);
  });
  req.end();
};

module.exports = Discogs;
