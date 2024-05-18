/*
  tags.js router (should be notes.js)
*/

var express = require('express');
var router = express.Router();
const Note = require('../note.js');

router.get('/tags', async function (req, res, next) {
  res.render('tags', { tags: await Note.allTags() });
});

router.get('/tags/:tag', async function (req, res, next) {
  res.render('notes', { tag: req.params.tag, notes: await Note.getNotesForTag(req.params.tag)});
});

router.post('/notes', async function (req, res, next) {
  if (res.locals.current_user.authenticated) {
    try {
      let note = new Note(
        res.locals.current_user.id,
        'item',
        req.body.resource_id,
        req.body.note
        );
      note.set();
      res.redirect('/item/' + req.body.resource_id);

      // TODO set flash message prior to redirect

    } catch (err) {
      console.log(err);
      res.sendStatus(500);
    }
  } else {
    res.append('WWW-Authenticate', '/login');
    res.sendStatus(401);
  }
});

module.exports = router;
