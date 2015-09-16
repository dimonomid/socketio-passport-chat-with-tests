'use strict';

(function(){

  /**
   * Module exports.
   * @public
   */

  exports.expressRegister = expressRegister;
  exports.expressUsernameExists = expressUsernameExists;
  exports.expressGetUserById = expressGetUserById;

  exports.getUserById = getUserById;

  exports.passportVerifyCallback = passportVerifyCallback;



  /**
   * Module dependencies.
   * @private
   */

  var debug = require('debug')('k:users.server.controller');
  var fs = require('fs');
  var repoRoot = require('app-root-path') + '';
  var appRoot = require('app-root-path') + '/app/server';
  var config = require(appRoot + '/config/app.server.config');
  var path = require('path');

  var User = require('./user.server.model.js');




  //-- User fields that are returned by the api endpoints
  var PUBLIC_USER_FIELDS_ARR = [
    '_id',
    'username',
  ];
  var PUBLIC_USER_FIELDS = PUBLIC_USER_FIELDS_ARR.join(' ');


  /**
   * Try to register new user.
   *
   * @param password
   *
   * @return object with results:
   * In case of success: Code 200, and data:
   *       { result: 'ok' }
   *
   * In case of normal error: Code 422 (unprocessable entity), and data:
   *       {
   *          result: 'error',
   *          error: 'some_error_code', //-- this code will not change in the future
   *          errorMsg: 'Some error message' //-- it may change in the future
   *       }
   *
   * In case of unexpected error: Code 500 (internal server error) with no data
   */
  function expressRegister(req, res, next) {

    var userToRegister = new User(
      {
        username: req.body.username,
        password: req.body.password,
      }
    );
    userToRegister.save({safe: false})
    .then(
      //-- promise resolved
      function(registeredUser){

        //-- get user that was just registered
        //   (NOTE: we can't just return registeredUser, since it contains
        //   password and probably other non-public fields)
        getUserById(registeredUser._id)
        .then(
          function(userToReturn) {
            var obj = {
              result: 'ok',
              user: userToReturn
            };
            res.send(obj);
          },
          function(err) {
            console.log('user requesting err: ', err);
            res.status(500);
            res.send({err: err});
          }
        )
        ;
      },
      //-- promise rejected
      function(err) {
        var errDetails = _getMongooseErrorDetails(err);

        res.status(errDetails.error !== 'unknown' ? 422 : 500);
        res.send(errDetails);
      }
    );

  }


  /**
   * Check whether user with given username already exists
   *
   * @return
   *       { username_exists: true/false }
   */
  function expressUsernameExists(req, res, next) {

    var dbQuery = User.find({
      username: req.query.username
    })
    .select('username')
    ;

    if (req.isAuthenticated()){
      //-- for authenticated users, we should ignore
      //   our own username
      dbQuery.where('_id').ne(req.user.id);
    }

    dbQuery.exec()
    .then(
      function(users_with_given_username) {
        var ret = {
          username_exists: (users_with_given_username.length > 0)
        };
        res.send(ret);
      },
      function(err) {
        console.log('err: ', err);
        res.sendStatus(500);
      }
    )
    ;

  }


  function expressGetUserById(req, res, next) {
    getUserById(req.params.userId)
    .then(
      function(user) {
        //console.log('user: ', user);
        res.send(user);
      },
      function(err) {
        console.log('user requesting err: ', err);
        if (err.name === 'CastError'){
          //-- wrong userId
          res.sendStatus(400);
        } else {
          //-- unknown error
          res.sendStatus(500);
        }
      }
    );
  }


  /**
   * Callback that is used by passport's LocalStrategy
   */
  function passportVerifyCallback(username, password, done) {

    if (username === '' || password === '') {
      return done(null, false, { message: 'username or password is empty' });
    }

    User.findOne({username: username}, function (err, user) {
      if (err) {
        return done(err);
      }

      if (!user){
        debug("no user with username", username);
        return done(null, false, { message: 'Incorrect username' });
      }

      user.comparePassword(password, function(isMatch) {
        if (!isMatch) {
          debug("Attempt failed to login with username", user.username);
          return done(null, false, { message: 'Incorrect password' });
        }

        return done(null, user);
      });

    });
  }

  function _getMongooseErrorDetails(err){
    var error = '';
    var errorMsg = '';

    switch (err.code){
      case 11000:
      case 11001:
        error    = 'already_exists';
        errorMsg = 'Username is already in use';
        break;

      default:
        //-- should never be here
        error    = 'unknown';
        errorMsg = 'Unknown error';
        break;
    }

    return {
      result: 'error',
      error: error,
      errorMsg: errorMsg
    };
  }

  function getUserById(userId){
    var ret = User.findOne({_id: userId})
    .select(PUBLIC_USER_FIELDS)
    .exec()
    ;

    return ret;
  }

}());

