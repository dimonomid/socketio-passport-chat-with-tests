'use strict';

if (!process.env.NODE_ENV){
  process.env.NODE_ENV = 'production';
  console.warn(""
              + "Warning: no NODE_ENV is set. "
              + "Please set it to either 'production', "
              + "'development' or 'test'. "
              + "Now, 'production' is assumed."
             );
}

var appRoot = require('app-root-path') + '/app/server';

var config = require(appRoot + '/config/app.server.config');

var db = require(appRoot + '/config/mongoose.server.config').db;
var server = require(appRoot + '/config/express.server.config').server;

//-- seed database with test users
require(appRoot + '/config/mongoose_test_data.server.config').seed();






db.on('error', function (err) {
  console.log('db connection error: ', err);
  throw err;
});

db.once('open', function () {
  console.log('connected to db');
  server.listen(config.express.port);
});

module.exports = server;


