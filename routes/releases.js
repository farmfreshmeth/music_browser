var express = require('express');
var router = express.Router();

// GET /releases?search_str=10%20Classic%20Rock&search_target=folder
router.get('/releases', async function(req, res, next) {
  let releases = await req.app.locals.collection.search(req.query.search_str, req.query.search_target);
  res.render('releases', {
    releases: releases,
    search_str: req.query.search_str,
    search_target: req.query.search_target
  });
});

module.exports = router;
