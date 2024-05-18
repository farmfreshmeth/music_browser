/*
  routes/wants.test.js
*/

const request = require("supertest");
const app = require("../../app.js");

describe("wants route", () => {
  it("should return wants", async () => {
    const res = await request(app).get("/wantlist").send();
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain('Red Medicine');
  });
});
