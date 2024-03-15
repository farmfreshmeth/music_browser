var express = require('express');
var router = express.Router();

router.get('/', async function(req, res, next) {
  res.render('folders', { title: 'Studio84', folders: await req.app.locals.collection.folders() });
});

module.exports = router;
