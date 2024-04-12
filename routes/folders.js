var express = require('express');
var router = express.Router();

router.get('/', async function(req, res, next) {
  let folders = await req.app.locals.collection.folders();
  res.locals.req = req;
  res.render('folders', { title: 'Studio 84', folders: folders, path: req.path });
});

module.exports = router;
