/*
  routes/item.test.js
*/

const request = require("supertest");
const app = require("../../app.js");

describe("item route", () => {
  it("should return item", async () => {
    const res = await request(app).get("/item/219153").send();
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain('Brothers Johnson');
    expect(res.text).not.toContain('Sleeve Condition');
  });

  it("should show private data for authenticated users", async () => {
    let res = await request(app).post("/login").send({
      email: 'person@farmfreshmeth.com',
      password: process.env.TEST_PASSWORD,
    });
    expect(res.header['set-cookie'][0]).not.toBe(undefined);
    let session = res.header['set-cookie'][0];

    res = await request(app).get("/item/219153").set('Cookie', session).send();
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain('Sleeve Condition');
  });
});
