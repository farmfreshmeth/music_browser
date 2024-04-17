/*
  wants.js

  Wantlist router
*/

var express = require('express');
var router = express.Router();

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
  res.render('wantlist', {wants: pg_res.rows});
});

module.exports = router;