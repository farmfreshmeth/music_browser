/*
  admin.js router
*/

var express = require('express');
var router = express.Router();
const User = require('../user.js');

router.get('/login', async function (req, res, next) {
  if (req.session.user && req.session.user.authenticated) {
    res.redirect('/');
  } else {
    res.render('login', {});
  }
});

router.post('/login', async function (req, res, next) {
  let user = await User.authenticate(req.body.email, req.body.password);
  if (user) {
    req.session.user = user;
    res.redirect('/');
  } else {
    res.render('login', { error: 'Invalid email/password', email: req.body.email });
  }
});

router.get('/logout', async function (req, res) {
  req.session.destroy();
  res.render('login', { message: 'Logged out' });
});

module.exports = router;