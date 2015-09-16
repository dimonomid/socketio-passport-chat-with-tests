'use strict';

var appRoot = require('app-root-path') + '/app/server';
var User = require(appRoot + '/users/user.server.model.js');

//-- add test user

exports.seed = function() {

  var user = new User({
    username:   'test1',
    password:   '1',
  });
  user.save({safe: false});

  var user = new User({
    username:   'test2',
    password:   '2',
  });
  user.save({safe: false});

};


