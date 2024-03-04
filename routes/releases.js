var express = require('express');
var router = express.Router();

/* GET releases listing. */
router.param('folder_id', function (req, res, next, folder_id) {
  req.folder_id = Number(folder_id);
  next()
})

router.get('/releases/:folder_id', function(req, res, next) {
  req.app.locals.discogs.getReleases(req.folder_id, (data) => {
    res.render('releases', {
      pagination: data["pagination"],
      releases: data["releases"],
      folder: req.app.locals.discogs.getFolder(req.folder_id)
    });
  });
});

module.exports = router;
