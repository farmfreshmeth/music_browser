/*
  Discogs.com API client
    https://www.discogs.com/developers/#

    API notes:
    - "/releases/:release_id" does not return custom data
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

// Dictionary of custom folder names
// Folder 0 = "all", Folder 1 = "uncategorized"
Discogs.prototype.downloadFolders = function (callback) {
  https_options.path =
    "/users/" + process.env.DISCOGS_USER + "/collection/folders";
  this.sendRequest((data) => {
    callback(data);
  });
};

// Dictionary of custom field names & dropdown values
Discogs.prototype.downloadCustomFields = function (callback) {
  https_options.path =
    "/users/" + process.env.DISCOGS_USER + "/collection/fields";
  this.sendRequest((data) => {
    callback(data);
  });
};

/* Collection items include custom data.  Folder 0 is "All".
    Uses "Collection Items by Folder" endpoint
    https://www.discogs.com/developers/#page:user-collection,header:user-collection-collection-items-by-folder

    Return data is paginated
*/
Discogs.prototype.downloadCollectionItems = function (folder_id = 0, callback) {
  let per_page = 3; // max allowed 100
  let page = 1; // let's start at the very beginning, a very good place to start
  let pages = undefined; // we don't know how many pages until we do the first GET
  let query = `?page=${page}&per_page=${per_page}&sort=artist&order=asc`;

  // TODO loop through pages
  https_options.path = `/users/${process.env.DISCOGS_USER}/collection/folders/${folder_id}/releases${query}`;
  this.sendRequest((collectionItems) => {
    callback(collectionItems);
  });
}

// Endpoint does not return custom data.  Uses "Release" endpoint
// https://www.discogs.com/developers/#page:database,header:database-release
Discogs.prototype.downloadRelease = function (release_id, callback) {
  https_options.path = "/releases/" + release_id;
  this.sendRequest((release) => {
    callback(release);
  });
};

// Common to most endpoints.  Uses callbacks, not promises
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
