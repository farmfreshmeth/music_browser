var express = require('express');
var router = express.Router();

router.param('release_id', function (req, res, next, release_id) {
  req.release_id = release_id;
  next()
})

router.get('/release/:release_id', function(req, res, next) {
  req.app.locals.discogs.getRelease(req.release_id, (data) => {
    res.render('release', { release: data });
  })
});

module.exports = router;
