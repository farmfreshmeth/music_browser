/*
  Genius API client (lyrics)
    https://docs.genius.com/#/getting-started-h1
*/

require("dotenv").config();
const https = require("https");

let https_options = {
  hostname: "",
  port: 443,
  path: "",
  method: "GET",
  headers: {},
};

var Genius = function () {};

Genius.prototype.getLyrics = async function() {
  // TODO
};

module.export = Genius;