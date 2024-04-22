var express = require('express');
var router = express.Router();

router.get('/', async function(req, res, next) {
  let folders = await req.app.locals.collection.folders();

  res.render('folders', {
    title: 'Studio 84',
    folders: folders,
    fullUrl: res.locals.fullUrl,
    logoUrl: res.locals.logoUrl,
    imgClass: 'logo-lg',
    current_user: res.locals.current_user,
  });
});

module.exports = router;
