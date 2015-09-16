'use strict';

(function(){

 /**
  * Module exports.
  * @public
  */

  exports.expressLoggedin = expressLoggedin;
  exports.expressLogin = expressLogin;
  exports.expressLogout = expressLogout;

  exports.expressCheckAuth = expressCheckAuth;
  exports.expressCheckCurrentUser = expressCheckCurrentUser;
  exports.expressHandleSpecialUserIds = expressHandleSpecialUserIds;

  exports.filterSocketsBySid = filterSocketsBySid;



  /**
   * Module dependencies.
   * @private
   */

  var appRoot = require('app-root-path') + '/app/server';

  var debug = require('debug')('k:auth.server.controller');
  var passportSocketIo = require('passport.socketio');
  var express = require(appRoot + '/config/express.server.config');
  var users = require(appRoot + '/users/users.server.controller.js');
  var config = require(appRoot + '/config/app.server.config');
  var cookie = require('cookie');





  /**
   * Express middleware, called when the user has just logged in
   */
  function expressLogin(req, res, next) {
    //-- when this middleware is called, the user has just logged in
    //   (because route contains passport.authenticate() before this middleware)

    //-- disconnect sockets with the Sid from current request,
    //   so that clients will re-connect and their sockets will
    //   have new authentication data
    _disconnectSocketsBySid(req.cookies[config.sidCookieName]);

    res.send({
      user: req.user
    });
  }


  /**
   * Express middleware used to logout
   */
  function expressLogout(req, res, next) {

    var curUsername = '';
    if (req.user){
      curUsername = req.user.username;
    }

    //-- perform logout
    req.logOut();

    //-- disconnect sockets with the Sid from current request,
    //   so that clients will re-connect and their sockets will
    //   not have obsolete authentication data
    _disconnectSocketsBySid(req.cookies[config.sidCookieName]);

    res.sendStatus(200);
  }


  /**
   * Check if user is authorized. If yes, next() is called;
   * otherwise, 401 is sent
   */
  function expressCheckAuth(req, res, next) {
    if (!req.isAuthenticated()){
      res.sendStatus(401);
    } else {
      next();
    }
  }


  /**
   * Check if current user's id is equal to req.params.userId.
   * If yes, next() is called; otherwise, 401 is sent.
   */
  function expressCheckCurrentUser(req, res, next) {
    if (!req.isAuthenticated()){
      //console.log('not auth');
      res.sendStatus(401);
    } else if (req.user.id !== req.params.userId){
      //console.log('current user id:', req.user.id, ', need:', req.params.userId);
      res.sendStatus(401);
    } else {
      next();
    }
  }


  /**
   * Convert special userId values, like "current",
   * to real user ids.
   *
   * If something illegal is requested (for example,
   * "current" userId while user is not logged in),
   * then 401 Unauthorized is returned.
   */
  function expressHandleSpecialUserIds(req, res, next) {
    if (req.params.userId === 'current'){
      if (req.user){
        req.params.userId = req.user.id;
        //console.log('set userId:', req.params.userId);
        next();
      } else {
        res.sendStatus(401);
      }
    } else {
      next();
    }
  }


  /**
   * Check whether user is currently logged in.
   * Sends an object through res:
   * {
   *   loggedin: {Boolean},
   *   userId: {String}, if only loggedin is true.
   * }
   */
  function expressLoggedin(req, res, next) {
    var ret = {
      loggedin: !!req.isAuthenticated()
    };

    if (ret.loggedin){

      //-- additionally, return current user
      //   (NOTE: we can't just return req.user, since it contains
      //   password and probably other non-public fields)
      users.getUserById(req.user._id)
      .then(
        function(user) {
          ret.user = user;

          res.send(ret);
        },
        function(err) {
          console.log('user requesting err: ', err);
        }
      )
      ;

    } else {
      res.send(ret);
    }

  }


  /**
   * Filter socket by given sid (session id), returns array containing matching
   * sockets. It should typically be an array of 1 element.
   */
  function filterSocketsBySid(sid) {
    var key;
    var result = [];

    debug('filtering sockets by sid:', sid);

    for (key in express.io.sockets.connected){
      if (express.io.sockets.connected.hasOwnProperty(key)){
        var socket = express.io.sockets.connected[key];

        //-- get socket cookies object
        var socketCookies = cookie.parse(socket.handshake.headers.cookie);

        debug('cur socket cookies: ', socketCookies);

        if (socketCookies[ config.sidCookieName ] == sid){
          //-- sid match
          debug('found! ', socketCookies[ config.sidCookieName ]);
          result.push(socket);
        }

      }
    }

    return result;
  }


  /**
   * @private
   *
   * Disconnect socket by sid (session id). Used when user logs in/out,
   * so that client will reconnect
   */
  function _disconnectSocketsBySid(sid) {
    var socketsBySid = filterSocketsBySid(sid)
    socketsBySid.forEach(function(socket) {
      socket.disconnect();
    });
  }


})();
