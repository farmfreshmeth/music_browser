var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('folders', { title: 'Studio84', folders: req.app.locals.discogs.folders });
});

module.exports = router;
