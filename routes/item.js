var express = require('express');
var router = express.Router();

router.get('/item/:item_id', async function(req, res, next) {
  var item = await req.app.locals.collection.item(req.params["item_id"]);
  console.log(item);
  res.render('item', { item: item });
});

module.exports = router;
