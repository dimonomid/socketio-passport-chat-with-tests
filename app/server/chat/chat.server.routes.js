'use strict';

(function() {

  var appRoot = require('app-root-path') + '/app/server';

  var feed = require(appRoot + '/feed/feed.server.controller.js');
  var auth = require(appRoot + '/auth/auth.server.controller.js');


  exports.setup = function(app){

    app.get(
      '/api/feed/msgs',
      auth.expressCheckAuth,
      feed.expressQuery
    );

    app.get (
      '/api/feed/msgs/:msgId/images/:imageFilename',
      auth.expressCheckAuth,
      feed.expressGetFeedImage
    );


  };


})();

