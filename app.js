require('dotenv').config();

var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");

var lessMiddleware = require("less-middleware");
if (process.env.NODE_ENV == "development") {
  var lessConfig = {
    render: { compress: false },
    force: true,
    debug: true
  };
} else {
  var lessConfig = {
    render: { compress: true }
  };
}

var lessConfig = {};
var logger = require("morgan");
var Discogs = require("./discogs.js");

// Container page routes
var foldersRouter = require("./routes/folders");
var releasesRouter = require("./routes/releases");
var releaseRouter = require("./routes/release");

var app = express();

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
app.use(releasesRouter);
app.use(releaseRouter);

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

// global Discogs object, prefetches dictionary data
app.locals.discogs = new Discogs();
app.locals.discogs.mountStorage(async () => {
  app.locals.discogs.buildFolderListFromCollection();
});

module.exports = app;
