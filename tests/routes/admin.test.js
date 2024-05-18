/*
  routes/admin.test.js
*/

require("dotenv").config();
const request = require("supertest");
const app = require("../../app.js");

let session;

describe("admin routes", () => {
  it("should render the login page", async () => {
    const res = await request(app).get("/login").send();
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain('email');
  });

  it("should error on bad creds", async () => {
    const res = await request(app).post("/login").send({
      email: 'person@farmfreshmeth.com',
      password: 'notapassword'
    });
    expect(res.text).toContain('Invalid email/password');
  });

  it("should authenticate", async () => {
    let res = await request(app).post("/login").send({
      email: 'person@farmfreshmeth.com',
      password: process.env.TEST_PASSWORD,
    });
    expect(res.header['set-cookie'][0]).not.toBe(undefined);
    session = res.header['set-cookie'][0];
    expect(res.text).toContain('Found. Redirecting to /');
  });

  it("should logout", async () => {
    expect(session).not.toBe(undefined);
    res = await request(app).get("/logout").set('Cookie', session).send();
    expect(res.header['set-cookie']).toBe(undefined);
    expect(res.text).toContain('Logged out');
  });
});
