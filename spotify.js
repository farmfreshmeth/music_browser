/*
  spotify.js

    Spotify API client.  See https://developer.spotify.com/documentation/web-api
    Spotify URL example http://open.spotify.com/track/6rqhFgbbKwnb9MLmUQDhG6
    Search endpoint:  https://developer.spotify.com/documentation/web-api/reference/search

    Use Client Credentials auth flow:  https://developer.spotify.com/documentation/web-api/tutorials/client-credentials-flow
*/

require("dotenv").config();
const https = require("https");

const Spotify = function () {};

Spotify.prototype.getClientAccessToken = function (callback) {
  const form_data = new URLSearchParams({
    grant_type: "client_credentials",
  });

  const options = {
    hostname: "accounts.spotify.com",
    path: "/api/token",
    port: 443,
    method: "POST",
    auth: `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };

  const req = https.request(options, (res) => {
    let data = "";

    if (res.statusCode !== 200) {
      console.error(`
        Did not get an OK from the server. Code: ${res.statusCode}
          path: https://${req.host}${req.path}
          headers: ${JSON.stringify(req.getHeaders(), null, 2)}
      `);
      return;
    }

    res.on("data", (chunk) => {
      data += chunk;
    });

    res.on("end", () => {
      data = JSON.parse(data);
      this.access_token = data.access_token;
      this.token_type = data.token_type;
      this.expires_in = data.expires_in;
      let now = new Date();
      this.expires_at = now.setSeconds(now.getSeconds() + data.expires_in);
      callback(data);
    });
  })
  .on("error", (err) => {
    console.log("Error: ", err.message);
  });

  req.write(form_data.toString());
  req.end();
};

Spotify.prototype.search = function (artist, album, callback) {
  let path = '/v1/search';
  let query = `q=album:${album} artist:${artist}&type=album&limit=1`;

  this.sendRequest(path, query, (data) => {
    callback(data);
  });
};

// Common to API endpoints
Spotify.prototype.sendRequest = function (path, query, callback) {

  let https_options = {
    hostname: 'api.spotify.com',
    path: path + '?' + new URLSearchParams(query),
    port: 443,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${this.access_token}`,
    },
  };

  let json = {};
  let req = https.request(https_options, (res) => {
    if (res.statusCode !== 200) {
      console.error(`
        Did not get an OK from the server. Code: ${res.statusCode}
          path: https://${req.host}${req.path}
          headers: ${JSON.stringify(req.getHeaders(), null, 2)}
      `);
      req.end();
    }

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

module.exports = Spotify;
