/*
  wants.js

  Wantlist router
*/

var express = require('express');
var router = express.Router();
let OGTools = require('../og_tools.js');
let og = new OGTools();

router.get('/wantlist', async function(req, res, next) {
  let query = `
    SELECT
      key,
      value -> 'artists' -> 0 ->> 'name' AS artist,
      value ->> 'title' AS title,
      value
    FROM wants
    ORDER BY
      artist ASC,
      title ASC
  `;
  let pg_res = await req.app.locals.collection.pg.client.query(query);
  let random = OGTools.randomWant(pg_res.rows);
  res.render('wantlist', {
    wants: pg_res.rows,
    current_user: res.locals.current_user,
    fullUrl: og.fullUrl(req),
    random: random,
  });
});

module.exports = router;
