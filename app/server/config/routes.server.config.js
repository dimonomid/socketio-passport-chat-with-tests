'use strict';

var appRoot = require('app-root-path') + '/app/server';

var userRoutes   = require(appRoot + '/users/users.server.routes.js');
//var myUtilRoutes = require(appRoot + '/myutil/myutil.server.routes.js');
var chatRoutes   = require(appRoot + '/chat/chat.server.routes.js');
var authRoutes   = require(appRoot + '/auth/auth.server.routes.js');
//var seedRoutes   = require(appRoot + '/seed/seed.server.routes.js');



exports.setup = function(app){

  userRoutes.setup(app);
  //myUtilRoutes.setup(app);
  chatRoutes.setup(app);
  authRoutes.setup(app);
  //seedRoutes.setup(app);

};

