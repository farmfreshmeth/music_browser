/*
  routes/tags.test.js
*/

const request = require("supertest");
const app = require("../../app.js");

describe("tags route", () => {
  it("should return all tags", async () => {
    const res = await request(app).get("/tags").send();
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain('#aliqua');
  });

  it("should return notes for tag", async () => {
    const res = await request(app).get("/tags/%23aliqua").send();
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain('#aliqua');
    expect(res.text).toContain('Aoife Nessa Frances');
  });

  it("should not post if not authenticated", async () => {
    const res = await request(app).post("/notes").send({
      resource_type: 'item',
      resource_id: '23300',
      note: 'testy test #mofo'
    });
    expect(res.statusCode).toEqual(401);
    expect(res.header['www-authenticate']).toBe('/login');
  });

  it("should post if authenticated", async () => {
    let res = await request(app).post("/login").send({
      email: 'person@farmfreshmeth.com',
      password: process.env.TEST_PASSWORD,
    });
    expect(res.header['set-cookie'][0]).not.toBe(undefined);
    session = res.header['set-cookie'][0];

    res = await request(app).post("/notes").set('Cookie', session).send({
      resource_type: 'item',
      resource_id: '23300',
      note: 'testy test #mofo'
    }).redirects(1);
    expect(res.text).toContain('testy test #mofo');
  });

  it("should delete", async () => {
    let res = await request(app).post('/note').send({
      id: 3,
      method: 'delete'
    });
    expect(res.header['location']).toBe('/item/5396731');
  });
});
