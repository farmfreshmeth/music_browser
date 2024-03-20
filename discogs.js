/*
  Discogs.com API client
    https://www.discogs.com/developers/#
*/

require("dotenv").config();
const https = require("https");
const fs = require("fs");

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

// checks recent exports, if the newest is more than 24 hours old,
// request a new one
Discogs.prototype.getExportURL = function (callback) {
  this.listRecentExports((recents) => {
    let most_recent_ts = recents[0][0];
    if ((new Date() - new Date(most_recent_ts)) > 86400000) {
      this.requestExport((request_url) => {
        // TODO while checkExport is false (pause)
        // else callback(url)
      });
    } else {
      callback(recents[0][1]);
    };
  });
};

// TODO handle paginated results
Discogs.prototype.listRecentExports = function (callback) {
  https_options.path = "/inventory/export";
  this.sendRequest((data) => {
    let recent_exports = []; // [[ts, url], [ts, url],...]
    for (let i in data.items) {
      recent_exports.push([data.items[i]["created_ts"], data.items[i]["url"]]);
    }
    recent_exports = recent_exports.sort((a, b) => {
      let diff = new Date(b[0]) - new Date(a[0]);
      return diff;
    });
    callback(recent_exports);
  });
};

// TODO the api doc is BS.  Need to pass param "what=collection"
Discogs.prototype.requestExport = function (callback) {
  https_options.path = "/inventory/export";
  https_options.method = "POST";
  let req = https.request(https_options, (res) => {
    callback(res.headers.location);
  });
  req.end();
};

Discogs.prototype.checkExport = function (url, callback) {
  let real_url = new URL(url);
  https_options.path = real_url.pathname;
  this.sendRequest((data) => {
    if (data["status"] == "success") {
      callback(data["download_url"]);
    } else {
      console.log("gotta wait"); // TODO
    }
  });
};

// TODO getting Cloudfront 403s related to cookies, I think
Discogs.prototype.downloadExport = function (download_url, callback) {
  const match = download_url.match(/(\d+)\/download/);
  const filepath = `./local/export_${match[1]}.csv`; // TODO create local folder if necessary (in .gitignore)
  const file = fs.createWriteStream(filepath);
  const req = https.get(download_url, (res) => {
    console.log(res.headers);
    if (res.statusCode !== 200) {
      fs.unlink(filepath, () => {
        callback({
          "status": "error",
          "message": `Failed to get '${download_url}' (${res.statusCode})`,
          "filepath": null
        });
      });
      req.end();
    }

    res.pipe(file);
  });

  file.on("finish", () => {
    callback({
      "status": "success",
      "message": "noice!",
      "filepath": filepath
    });
  });

  file.on("error", () => {
    fs.unlink(filepath, () => {
      callback({
        "status": "error",
        "message": "write stream failure",
        "filepath": null
      });
    });
  });

  req.on("error", () => {
    fs.unlink(filepath, () => {
      callback({
        "status": "error",
        "message": "request failure",
        "filepath": null
      });
    });
  });

  req.end();
};

// Discogs.prototype.downloadFolders = function () {
//   https_options.path =
//     "/users/" + process.env.DISCOGS_USER + "/collection/folders";
//   this.sendRequest((data) => {
//     return data;
//   });
// };

// Discogs.prototype.downloadCustomFields = function () {
//   https_options.path =
//     "/users/" + process.env.DISCOGS_USER + "/collection/fields";
//   this.sendRequest((data) => {
//     return data;
//   });
// };

// For recording category disputes
Discogs.prototype.setCustomFieldValue = function () {
  // TODO
};

Discogs.prototype.downloadRelease = function (release_id, callback) {
  https_options.path = "/releases/" + release_id;
  this.sendRequest((release) => {
    callback(release);
  });
};

// Common to all endpoints.  Uses callbacks, not promises
Discogs.prototype.sendRequest = function (callback) {
  let json = {};
  let req = https.request(https_options, (res) => {
    if (res.statusCode !== 200) {
      console.error(`
        Did not get an OK from the server. Code: ${res.statusCode}
          path: https://${req.host}${req.path}
          headers: ${JSON.stringify(req.getHeaders(), null, 2)}
      `);

      return;
    };

    let data = "";
    res.on("data", (chunk) => {
      data += chunk;
    });

    res.on("close", () => {});

    res.on("end", () => {
      json = JSON.parse(data);
      callback(json); // only sends back the data, not the whole response
    });
  });

  req.on("error", (e) => {
    console.error(e);
  });
  req.end();
};

module.exports = Discogs;
