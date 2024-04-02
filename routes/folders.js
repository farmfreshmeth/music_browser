var express = require('express');
var router = express.Router();

router.get('/', async function(req, res, next) {
  let folders = await req.app.locals.collection.folders();
  res.render('folders', { title: 'Studio84', folders: folders });
});

module.exports = router;
