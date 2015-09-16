'use strict';

(function() {

  var appRoot = require('app-root-path') + '/app/server';

  var auth = require(appRoot + '/auth/auth.server.controller.js');

  var users = require(appRoot + '/users/users.server.controller.js');


  exports.setup = function(app){

    //-- register user
    app.post('/api/users', users.expressRegister);

    //-- check whether given username already exists
    app.get ('/api/users/username_exists', users.expressUsernameExists);

    /*
    //-- get user details by id
    app.get (
      '/api/users/:userId',
      auth.expressHandleSpecialUserIds,
      auth.expressCheckAuth,
      users.expressGetUserById
    );
    */

  };


})();

