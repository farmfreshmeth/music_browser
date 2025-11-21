/*
  routes/reports.test.js
*/

const request = require("supertest");
const app = require("../../app.js");

beforeAll(async () => {
  let res = await request(app).post("/login").send({
    email: 'person@farmfreshmeth.com',
    password: process.env.TEST_PASSWORD,
  });
  expect(res.header['set-cookie'][0]).not.toBe(undefined);
  session = res.header['set-cookie'][0];
});

describe("reports route", () => {

  it("should render reports list", async () => {
    res = await request(app).get("/reports").set('Cookie', session).send();
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain('Reports');
  });

  it("should render by_collection", async () => {
    res = await request(app).get("/reports/by_owner?limit=10").set('Cookie', session).send();
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain('By Collection Owner');
  });

});
