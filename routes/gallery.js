/*
  gallery.js
*/

var express = require('express');
var router = express.Router();

router.get('/gallery', async function(req, res, next) {
  res.render('gallery', {});
});

module.exports = router;
