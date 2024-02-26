var express = require('express');
var router = express.Router();
var Discogs = require('../discogs.js');

router.get('/', function(req, res, next) {
  var discogs = new Discogs();
  discogs.getFolders((data) => {
    res.render('folders', { title: 'Studio84', folders: JSON.parse(data)['folders'] });
  })
});

module.exports = router;
