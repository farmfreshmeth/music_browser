var express = require('express');
var router = express.Router();

router.get('/item/:item_id', async function(req, res, next) {
  var items = await req.app.locals.collection.item(req.params["item_id"]); // return list
  res.render('item', { item: items[0] });
});

module.exports = router;
