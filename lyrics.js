/*
  Lyrist API client
    https://lyrist.vercel.app/guide
*/

require("dotenv").config();
const https = require("https");

let https_options = {
  hostname: "lyrist.vercel.app",
  port: 443,
  path: "/api/",
  method: "GET",
  headers: {},
};

var Lyrics = function () {};

Lyrics.prototype.get = async function(title, artist, callback) {
  https_options.path = '/api/' + encodeURIComponent(title) + '/' + encodeURIComponent(artist);

  let json = {};
  let req = https.request(https_options, (res) => {
    if (res.statusCode !== 200) {
      console.error(`
        Did not get an OK from the server. Code: ${res.statusCode}
          path: https://${req.host}${req.path}
          headers: ${JSON.stringify(req.getHeaders(), null, 2)}
      `);
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

module.exports = Lyrics;