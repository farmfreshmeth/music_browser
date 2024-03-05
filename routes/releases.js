var express = require('express');
var router = express.Router();

router.get('/releases/:encoded_name', async function(req, res, next) {
  let folder_name = decodeURIComponent(req.params["encoded_name"]);
  let releases = await req.app.locals.discogs.getReleases(folder_name);
  res.render('releases', {
    releases: releases,
    folder: folder_name
  });
});

module.exports = router;
