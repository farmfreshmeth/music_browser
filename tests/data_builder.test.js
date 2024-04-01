/*
  data_builder.test.js
*/

let Builder = require("../data_builder.js");
let builder = {};

beforeAll(async () => {
  builder = new Builder({ env: 'test', flush: false });
  await builder.mount();
});

test("buildFoldersList", async () => {
  // TODO
});

afterAll(async () => {
  await builder.unmount();
});