/*
  routes/items.test.js
*/

const request = require("supertest");
const app = require("../../app.js");

describe("items routes", () => {
  it("should search folder", async () => {
    const res = await request(app).get("/items").query({
      search_target: 'folder',
      search_str: '01 Grateful Dead'
    });
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain('American Beauty');
  });

  it("should search artist", async () => {
    const res = await request(app).get("/items").query({
      search_target: 'artist',
      search_str: 'Billy Joel'
    });
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain('Glass Houses');
  });

  it("should search release title", async () => {
    const res = await request(app).get("/items").query({
      search_target: 'item_title',
      search_str: 'Glass Houses'
    });
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain('Glass Houses');
  });

  it("should search track title", async () => {
    const res = await request(app).get("/items").query({
      search_target: 'track_title',
      search_str: 'Only the Good Die Young'
    });
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain('The Stranger');
  });

  it("should search collection_notes", async () => {
    const res = await request(app).get("/items").query({
      search_target: 'collection_notes',
      search_str: 'incididunt'
    });
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain('Aretha Franklin');
  });
});
