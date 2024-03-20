/*
  create_mock_data.js

  Use this to hit the live Discogs API to create
    new mock data in tests/mocks
*/

const Discogs = require("../discogs.js");
const discogs = new Discogs();
const dir = "./tests/mocks";

(() => {
  discogs.getExportURL((request_url) => {
    console.log("request_url: " + request_url);

    discogs.checkExport(request_url, (download_url) => {
      console.log("download_url: " + download_url);

      discogs.downloadExport(download_url, (res) => {
        console.log(`download ${res.status} ${res.message}: ${res.filepath}`);
      });
    })
  });

  // discogs.getExportURL((download_url) => {
  //   console.log("downloading export: " + download_url);
  //   discogs.downloadExport(download_url, (export_file) => {
  //     console.log("export downloaded " + export_file);
  //   });
  // });
})();
