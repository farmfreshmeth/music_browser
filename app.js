/*
  music_browser
*/

require("dotenv").config();
var express = require("express");

const PG = require("./pg.js");
const Collection = require("./collection.js");
var DataBuilder = require("./data_builder.js");
const schedule = require("node-schedule");
var createError = require("http-errors");
var path = require("path");
var cookieParser = require("cookie-parser");
var lessMiddleware = require("less-middleware");
var logger = require("morgan");
var http = require('http');
var enforce = require('express-sslify');

// Container page routes
var foldersRouter = require("./routes/folders");
var itemsRouter = require("./routes/items");
var itemRouter = require("./routes/item");

var app = express();

if (process.env.NODE_ENV == "development") {
  var lessConfig = {
    render: { compress: false },
    force: true,
    debug: true,
  };
} else if (process.env.NODE_ENV == 'production') {
  var lessConfig = {
    render: { compress: true },
  };
  app.use(enforce.HTTPS({ trustProtoHeader: true }));
} else { // test
  // NOOP
}

// attach to collection singleton wrapper for storage
(async () => {
  let pg = new PG();
  await pg.connect();
  app.locals.collection = new Collection(pg);
})();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(lessMiddleware(path.join(__dirname, "public"), lessConfig));
app.use(express.static(path.join(__dirname, "public")));

app.use(foldersRouter);
app.use(itemsRouter);
app.use(itemRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

// startup tasks
app.on("listening", () => {

  // schedule periodic db rebuild
  if (process.env.NODE_ENV == "production") {
    // TODO
  };
});

module.exports = app;
