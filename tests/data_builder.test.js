/*
  data_builder.test.js
*/

let Builder = require("../data_builder.js");
let builder = {};

beforeEach(() => {
  let opts = {
    env: "test",
    request_export: false,
    download: false,
    flush: false,
  }
  builder = new Builder(opts);
});

test("TODO", async () => {
  return true;
});
