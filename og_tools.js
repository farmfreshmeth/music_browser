/*
  og_tools.js

  Utilities for Open Graph tag creation.  Common to all routers
*/

const OGTools = function () {};

OGTools.prototype.fullUrl = function (req) {
  return req.protocol + '://' + req.get('host') + req.originalUrl;
};

OGTools.prototype.logoUrl = function (req) {
  return req.protocol + '://' + req.get('host') + '/images/studio_84_logo.png';
};

module.exports = OGTools;