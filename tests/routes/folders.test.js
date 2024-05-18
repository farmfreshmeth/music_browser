/*
  routes/folders.test.js
*/

const request = require("supertest");
const app = require("../../app.js");

describe("folder routes", () => {
  it("should render the landing page", async () => {
    const res = await request(app).get("/").send();
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain('Browse Crates & Folders');
  });
});
