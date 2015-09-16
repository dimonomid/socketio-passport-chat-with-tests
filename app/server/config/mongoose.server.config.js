'use strict';

var appRoot = require('app-root-path') + '/app/server';
var config = require(appRoot + '/config/app.server.config');
var mongoose = require('mongoose');


mongoose.connect(
  'mongodb://'
  + config.mongoose.host
  + ':' + config.mongoose.port
  + '/' + config.mongoose.db
);



module.exports.db = mongoose.connection;



