'use strict';

(function() {

  var appRoot = require('app-root-path') + '/app/server';

  var chat = require(appRoot + '/chat/chat.server.controller.js');
  var auth = require(appRoot + '/auth/auth.server.controller.js');


  exports.setup = function(app){

    app.get(
      '/api/chat/msgs',
      chat.expressQuery
    );

  };


})();

