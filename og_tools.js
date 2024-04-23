/*
  og_tools.js

  Utilities for Open Graph tag creation.  Common to all routers
*/

const OGTools = function () {};

OGTools.fullUrl = function (req) {
  return req.protocol + '://' + req.get('host') + req.originalUrl;
};

OGTools.logoUrl = function (req) {
  return req.protocol + '://' + req.get('host') + '/images/studio_84_logo.png';
};

OGTools.randomWant = function (wants) {
  let i = Math.floor(Math.random() * wants.length);
  return wants[i];
};

module.exports = OGTools;