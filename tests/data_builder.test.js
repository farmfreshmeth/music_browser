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

test("parseExport with good csv succeeds", async () => {
  let rows = await builder.parseExport("./tests/test_export.csv");
  expect(rows).toBeDefined();
  expect(rows.length).toBe(49);
});
