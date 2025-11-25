/*
  routes/gallery.test.js
*/

const request = require("supertest");
const app = require("../../app.js");

describe("gallery route", () => {
  it("should render the gallery view", async () => {
    res = await request(app).get("/gallery").send();
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain('Gallery');
  });
});
