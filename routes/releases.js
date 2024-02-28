var express = require('express');
var router = express.Router();
var Discogs = require('../discogs.js');

/* GET releases listing. */
router.param('folder_id', function (req, res, next, folder_id) {
  req.folder_id = folder_id;
  next()
})

router.get('/releases/:folder_id', function(req, res, next) {
  var discogs = new Discogs();
  discogs.getReleases(req.folder_id, (data) => {
    res.render('releases', {
      pagination: data["pagination"],
      releases: data["releases"],
      folder_name: req.app.locals.discogs.folders[req.folder_id]
    });
  });
});

module.exports = router;
