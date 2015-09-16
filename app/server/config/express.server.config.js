'use strict';

var repoRoot = require('app-root-path');
var appRoot = require('app-root-path') + '/app/server';
var config = require(appRoot + '/config/app.server.config');

var passport = require(appRoot + '/config/passport.server.config');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var express = require('express');
var morgan = require('morgan');
var path = require('path');
var expressSession = require('express-session');
var MongoStore = require('connect-mongo')(expressSession);
var db = require(appRoot + '/config/mongoose.server.config').db;

var app = express(db);

var server = require('http').Server(app);
var io = require('socket.io')(server);
var socketio = require(appRoot + '/config/socketio.server.config');

var mongoStore = new MongoStore({
  db: config.mongoose.db
});

var sessionMiddleware = expressSession({
  saveUninitialized: true,
  resave: true,
  name: config.sidCookieName,
  secret: config.sessionSecret,
  store: mongoStore
});

//-- log every request
if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test_protractor'){
  app.use(morgan('dev'));
}

//-- serve static files
app.use(express.static(config.paths.public));
app.use('/bower_components', express.static(repoRoot + "/bower_components"));

app.use(bodyParser.json());
app.use(cookieParser());
app.use(sessionMiddleware);

//-- use Passport middleware
app.use(passport.initialize());
app.use(passport.session());

//-- setup app routes
require(appRoot + '/config/routes.server.config').setup(app);



//-- NOTE: since we use socket.io, this export is not used anymore
module.exports.app = app;
module.exports.io = io;

socketio(server, io, mongoStore);
//socketio(io, sessionMiddleware);

module.exports.server = server;

