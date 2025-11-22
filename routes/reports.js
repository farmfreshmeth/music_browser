/*
  reports.js

  Reports router
*/

var express = require('express');
var router = express.Router();
const PG = require('../pg.js');
let pg = new PG();

// Gotta restart yer server every time this changes...
const REPORTS = {
  "by_owner": {
    name: "By Collection Owner",
    sql: `
      SELECT
        jsonb_path_query(items.value, '$.custom_data[*] ? (@.field_id == 4)."value"') AS owner,
        items.value -> 'folder' ->> 'name' AS folder,
        ((items.value ->> 'artists_sort') || ' -- ' || (items.value ->> 'title')) AS "artist -- title"
      FROM items
      ORDER BY owner ASC, folder ASC, "artist -- title" ASC
    `
  },

  "crate_map": {
    name: "Crates and Sections",
    sql: `
      SELECT
        items.value -> 'folder' ->> 'name' AS folder,
        COUNT (*) AS count
      FROM items
      GROUP BY folder
      ORDER BY folder ASC
    `
  },

  "count_by_crate": {
    name: "Count by Crate",
    sql: `
      SELECT
        SUBSTRING(items.value -> 'folder' ->> 'name', 1, 2) AS crate,
        COUNT (*) AS count
      FROM items
      GROUP BY crate
      ORDER BY crate ASC
    `
  },

  "total_count": {
    name: "Total Count",
    sql: `
      SELECT COUNT(*) AS items
      FROM items
    `
  },

  "count_by_artist": {
    name: "Count by Artist",
    sql: `
      SELECT
        items.value ->> 'artists_sort' AS artist,
        COUNT(*) AS count
      FROM items
      GROUP BY artist
      ORDER BY count DESC, artist ASC
    `
  }
};

router.get('/reports', async function(req, res, next) {
  if (req.session.user && req.session.user.authenticated) {
    res.render('reports', {
      reports: REPORTS,
      current_user: res.locals.current_user,
      fullUrl: res.locals.fullUrl
    });
  } else {
    res.send(401, "Not authorized");
  }
});


router.get('/reports/:report_key', async function(req, res, next) {
  if (req.session.user && req.session.user.authenticated) {
    let report = REPORTS[req.params.report_key];
    let query_res = await pg.client.query(report.sql);
    res.render('report', {
      report: report,
      data: query_res.rows,
      current_user: res.locals.current_user,
      fullUrl: res.locals.fullUrl
    });
  } else {
    res.send(401, "Not authorized");
  }
});

module.exports = router;
