/*
  tags.js router
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

module.exports = router;
