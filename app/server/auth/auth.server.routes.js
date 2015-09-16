'use strict';

(function() {

  var appRoot = require('app-root-path') + '/app/server';

  var passport = require('passport');
  var auth = require(appRoot + '/auth/auth.server.controller.js');


  exports.setup = function(app){

    //-- auth routes
    app.post(
      '/api/login',
      passport.authenticate('local'),
      auth.expressLogin
    );

    app.get('/api/loggedin', auth.expressLoggedin);

    app.get('/api/logout', auth.expressLogout);

  };


})();

