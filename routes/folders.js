var express = require('express');
var router = express.Router();
var Discogs = require('../discogs.js');

router.get('/', function(req, res, next) {
  var discogs = new Discogs();
  res.render('folders', { title: 'Studio84', folders:  discogs.getFolders()});
});

module.exports = router;
