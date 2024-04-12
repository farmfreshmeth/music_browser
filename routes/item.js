/*
  item.js router
*/

var express = require('express');
var router = express.Router();

router.get('/item/:item_id', async function(req, res, next) {
  var item = await req.app.locals.collection.item(req.params["item_id"]);
  res.render('item', {
    artist: item.artists[0].name,
    release_title: item.title,
    title: `${item.artists[0].name} - ${item.title}`,
    item: item,
    path: req.path,
  });
});

router.get('/item/:item_id/track/:track_position', async function(req, res, next) {
  let item = await req.app.locals.collection.item(req.params["item_id"]);
  let track;
  for (let i = 0; i < item.tracklist.length; i++) {
    if (item.tracklist[i].position == req.params['track_position']) {
      track = item.tracklist[i];
      break;
    }
  }
  res.render('track', {
    artist: item.artists[0].name,
    release_title: item.title,
    title: `${item.artists[0].name} - ${item.title}`,
    item: item,
    track: track,
    parentURL: `/item/${req.params["item_id"]}`,
  });
});

module.exports = router;
