var express = require('express');
var router = express.Router();
var Discogs = require('../discogs.js');

router.param('release_id', function (req, res, next, release_id) {
  req.release_id = release_id;
  next()
})

router.get('/release/:release_id', function(req, res, next) {
  var discogs = new Discogs();
  discogs.getRelease(req.release_id, (data) => {
    res.render('release', { release: data });
  })
});

module.exports = router;
