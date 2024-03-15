var express = require('express');
var router = express.Router();

router.get('/release/:release_id', async function(req, res, next) {
  var release = await req.app.locals.collection.release(req.params["release_id"]);
  res.render('release', { release: release });
});

module.exports = router;
