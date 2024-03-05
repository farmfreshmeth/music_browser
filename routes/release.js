var express = require('express');
var router = express.Router();

router.get('/release/:release_id', async function(req, res, next) {
  await req.app.locals.discogs.getRelease(req.params["release_id"], async (release) => {
    res.render('release', { release: release });
  })
});

module.exports = router;
