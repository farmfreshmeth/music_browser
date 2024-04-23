/*
  music_browser
*/

require("dotenv").config();
var express = require("express");

const PG = require("./pg.js");
var session = require('express-session')

var createError = require("http-errors");
var path = require("path");
var cookieParser = require("cookie-parser");
var lessMiddleware = require("less-middleware");
var logger = require("morgan");
var http = require('http');
var enforce = require('express-sslify');

const Collection = require("./collection.js");
let OGTools = require('./og_tools.js');

// Container page routes
var foldersRouter = require("./routes/folders");
var itemsRouter = require("./routes/items");
var itemRouter = require("./routes/item");
var wantsRouter = require("./routes/wants");
var adminRouter = require("./routes/admin");

var app = express();

// attach to pg and init Collection
(async () => {
  let pg = new PG();
  app.locals.collection = new Collection(pg);

  // init session store
  app.use(session({
    store: new (require('connect-pg-simple')(session))({
      pool: pg.client,
    }),
    secret: process.env.COOKIE_SECRET,
    resave: true,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }, // 30 days
    saveUninitialized: false,
  }));

  // app.locals.current_user = { first_name: 'Guest' };
})();

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

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(lessMiddleware(path.join(__dirname, "public"), lessConfig));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  res.locals.current_user = req.session.user;
  res.locals.fullUrl = OGTools.fullUrl(req);
  res.locals.logoUrl = OGTools.logoUrl(req);
  next();
});

app.use(foldersRouter);
app.use(itemsRouter);
app.use(itemRouter);
app.use(wantsRouter);
app.use(adminRouter);

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
  // NOOP
});

module.exports = app;
