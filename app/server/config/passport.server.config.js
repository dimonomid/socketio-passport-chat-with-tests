'use strict';

var appRoot = require('app-root-path') + '/app/server';

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var users = require(appRoot + '/users/users.server.controller.js');
var User = require(appRoot + '/users/user.server.model.js');


//-- passport init

passport.use(new LocalStrategy(
  {
    usernameField: 'username',
    passwordField: 'password'
  },
  users.passportVerifyCallback
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});



module.exports = passport;


