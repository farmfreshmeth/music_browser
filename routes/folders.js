var express = require('express');
var router = express.Router();
var Discogs = require('../discogs.js');

// munges response JSON into simple id: name hash for global use
// [
//   {
//     "id": 0,
//     "count": 23,
//     "name": "All",
//     "resource_url": "https://api.discogs.com/users/example/collection/folders/0"
//   },
//   {
//     "id": 1,
//     "count": 20,
//     "name": "Uncategorized",
//     "resource_url": "https://api.discogs.com/users/example/collection/folders/1"
//   }
// ]
function makeFoldersHash(arr) {
  var hash = {};
  arr.forEach((item, index) => {
    hash[item['id']] = item['name'];
  })
  return hash;
};

router.get('/', function(req, res, next) {
  var discogs = new Discogs();
  discogs.getFolders((data) => {
    req.app.locals.folders = makeFoldersHash(data['folders']);
    res.render('folders', { title: 'Studio84', folders: data['folders'] });
  })
});

module.exports = router;
