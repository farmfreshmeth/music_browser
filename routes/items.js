/*
  items.js router
*/

var express = require('express');
var router = express.Router();
let OGTools = require('../og_tools.js');
let og = new OGTools();


// GET /items?search_str=10%20Classic%20Rock&search_target=folder
router.get('/items', async function(req, res, next) {
  let items = await req.app.locals.collection.search(req.query.search_str, req.query.search_target);
  res.render('items', {
    title: 'Studio 84',
    items: items,
    search_str: req.query.search_str,
    search_target: req.query.search_target,
    count: items.length,
    fullUrl: og.fullUrl(req),
    logoUrl: og.logoUrl(req),
  });
});

module.exports = router;
