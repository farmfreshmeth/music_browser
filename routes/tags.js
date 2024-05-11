/*
  tags.js router
*/

var express = require('express');
var router = express.Router();
const Note = require('../note.js');

router.get('/tags', async function(req, res, next) {
  res.render('tags', { tags: Note.allTags() });
});

module.exports = router;