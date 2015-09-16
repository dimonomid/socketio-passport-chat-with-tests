'use strict';

(function(){

  var repoRoot = require('app-root-path') + '';
  var path = require('path');
  var mkdirp = require('mkdirp');

  var config = {};


  config.sidCookieName = 'k-connect-sid';
  config.sessionSecret = 'secret TODO';


  //-- paths --------------------------------------

  config.paths = {};

  config.paths.public = path.join(repoRoot, 'app/client/public');


  //-- create all needed paths
  for (var key in config.paths){
    if (config.paths.hasOwnProperty(key)){
      //console.log('create path: ', config.paths[key]);
      mkdirp(config.paths[key], printIfError);
    }
  }

  function printIfError(err) {
    if (err){
      console.error(err);
    }
  }


  //-- expressjs --------------------------------------

  config.express = {};
  if (process.env.NODE_ENV === 'test'){
    config.express.port = 7082;
  } else if (process.env.NODE_ENV === 'test_protractor'){
    config.express.port = 7083;
  } else if (
    process.env.NODE_ENV === 'production'
      || process.env.NODE_ENV === 'development'
  )
  {
    config.express.port = 7081;
  } else {
    throw new Error('unknown NODE_ENV');
  }



  //-- mongoose --------------------------------------

  config.mongoose = {};
  config.mongoose.host = 'localhost';
  config.mongoose.port = 27017;

  if (process.env.NODE_ENV === 'test'){
    config.mongoose.db = 'simple-chat-test';
  } else if (process.env.NODE_ENV === 'test_protractor'){
    config.mongoose.db = 'simple-chat-test-protractor';
  } else if (
    process.env.NODE_ENV === 'production'
      || process.env.NODE_ENV === 'development'
  )
  {
    config.mongoose.db = 'simple-chat';
  } else {
    throw new Error('unknown NODE_ENV');
  }



  //---------------------------------------------------

  module.exports = config;

})();

