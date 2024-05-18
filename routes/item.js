/*
  item.js router
*/

var express = require('express');
var router = express.Router();
const Note = require('../note.js');

router.get('/item/:item_id', async function(req, res, next) {
  var item = await req.app.locals.collection.item(req.params["item_id"]);
  var notes = await Note.getNotesForResource('item', req.params.item_id);

  if (item) {
    res.render('item', {
      artist: item.artists[0].name,
      release_title: item.title,
      title: `${item.artists[0].name} - ${item.title}`,
      item: item,
      fullUrl: res.locals.fullUrl,
      current_user: res.locals.current_user,
      notes: notes,
    });
  } else {
    res.status(404).send("Not found.");
  }
});

router.get('/item/:item_id/track/:track_position', async function(req, res, next) {
  var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
  let item = await req.app.locals.collection.item(req.params["item_id"]);

  if (!item) {
    res.status(404).send("Not found.");
    return;
  }

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
    fullUrl: res.locals.fullUrl,
    current_user: res.locals.current_user,
  });
});

router.get('/random', async function (req, res, next) {
  let count = await req.app.locals.collection.length();
  let offset = Math.floor(Math.random() * count);
  let pg_res = await req.app.locals.collection.pg.client.query(`
      SELECT key FROM items OFFSET $1 LIMIT 1
    `, [offset]);
  res.redirect(`/item/${pg_res.rows[0].key}`);
});

module.exports = router;
