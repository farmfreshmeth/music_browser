var express = require('express');
var router = express.Router();
let OGTools = require('../og_tools.js');
let og = new OGTools();

router.get('/', async function(req, res, next) {
  let folders = await req.app.locals.collection.folders();

  res.render('folders', {
    title: 'Studio 84',
    folders: folders,
    fullUrl: og.fullUrl(req),
    logoUrl: og.logoUrl(req),
    imgClass: 'logo-lg',
  });
});

module.exports = router;
