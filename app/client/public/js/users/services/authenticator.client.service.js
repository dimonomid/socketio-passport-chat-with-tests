'use strict';

(function(){
  angular.module('users')
  .factory('authenticator', authenticator);

  authenticator.$inject = [ '$q', '$http' ];
  function authenticator($q, $http){
    var ret = {
      /**
       * Returns the promise that is resolved to boolean value, representing
       * whether the user is authenticated.
       *
       * If possible, it merely checks local boolean variable, without sending
       * request to the server. But if the value is unknown yet, then it
       * asks the server.
       *
       * NOTE: the promise is rejected if only some unexpected error has
       * happened.  If user is not authenticated, it is resolved to false.
       */
      isAuthenticated: isAuthenticated,

      /**
       * Returns the promise:
       *
       * - If user is authenticated, promise is resolved to user id
       * - If user is not authenticated, promise is rejected
       */
      getCurrentUserId: getCurrentUserId,

      /**
       * Returns the promise:
       *
       * - If user is authenticated, promise is resolved to object representing
       *   current user
       * - If user is not authenticated, promise is rejected
       */
      getCurrentUser: getCurrentUser,

      /**
       * Synchronous version of getCurrentUser() : instead of returning
       * a promise, it immediately returns the object representing current user,
       * or throws an error if authenticator service didn't have a chance yet
       * to fetch current user from the server.
       */
      getCurrentUserSync: getCurrentUserSync,


      /**
       * It's like getCurrentUserSync(), but return just a single user property
       * instead of the whole user object.
       *
       * It is needed for a little optimization: we can't just return a
       * reference to user object, because the client may change it, and
       * the change would affect internal service data. Instead, we copy
       * the object before returning. If we often call getCurrentUserSync()
       * just to get a single property, it might be much better to retrieve
       * just this property.
       *
       * @param {String} prop property of user to return value of
       */
      getCurrentUserPropertySync: getCurrentUserPropertySync,

      /**
       * Just like `isAuthenticated()`, but this function always sends
       * request to the server.
       */
      isAuthenticatedRecheck: isAuthenticatedRecheck,

      /**
       * Refresh local user information from the server, so, `...Sync`
       * functions will return up-to-date information.
       *
       * Technically, it is just a synonym for `isAuthenticatedRecheck()`, but
       * with the name that represents an intent more clearly.
       */
      refreshCurrentUser: refreshCurrentUser,

      /**
       * Takes username and password, and sends request to the server.
       *
       * Returns the promise:
       *    - if authentication succeeded, the promise is resolved to
       *      the userId
       *    - if authentication failed, the promise is rejected
       */
      authenticate: authenticate,

      /**
       * Sends request to the server to logout.
       *
       * Returns the promise, which normally should always
       * be resolved.
       */
      logout: logout,

    };

    return ret;



    function isAuthenticated(){
      if (_authenticated === null){
        //-- we don't know yet whether the user is already logged in,
        //   so, recheck
        console.log('we do not know whether user is logged in, checking..');
        return isAuthenticatedRecheck();
      } else {
        console.log('returning authenticated: ', _authenticated);

        var deferred = $q.defer();
        deferred.resolve(_authenticated);
        return deferred.promise;
      }

    }

    function getCurrentUserId(){
      var deferred = $q.defer();

      isAuthenticated()
      .then(function(authenticated){
        deferred.resolve(_user._id);
      })
      .catch(function(){
        deferred.reject();
      });

      return deferred.promise;
    }

    function getCurrentUser(){
      var deferred = $q.defer();

      isAuthenticated()
      .then(function(authenticated){
        deferred.resolve(_user);
      })
      .catch(function(){
        deferred.reject();
      });

      return deferred.promise;
    }

    function getCurrentUserSync(){
      //-- check if we actually know current user data
      _checkCurrentUserIsKnown();
      return angular.copy(_user);
    }

    function getCurrentUserPropertySync(prop){
      //-- check if we actually know current user data
      _checkCurrentUserIsKnown();
      return angular.copy(_user[prop]);
    }

    function isAuthenticatedRecheck(){

      var deferred = $q.defer();

      console.log('requesting loggedin..');
      $http.get('/api/loggedin')
      .success(function(data, status, headers, config){
        _authenticated = data.loggedin;

        if (_authenticated){
          _user = data.user;
        } else {
          _user = null;
        }
        deferred.resolve(_authenticated);
      })
      .error(function(data, status, headers, config){
        console.log('error', status);
        _authenticated = false;
        deferred.reject();
      })
      ;

      return deferred.promise;
    }

    function refreshCurrentUser(){
      return isAuthenticatedRecheck();
    }

    function authenticate(username, password){

      var deferred = $q.defer();

      $http.post(
        '/api/login',
        {
          username: username,
          password: password
        }
      )
      .success(function(data, status, headers, config){
        console.log("auth succeed");
        _authenticated = true;
        _user = data.user;
        deferred.resolve(_user._id);
      })
      .error(function(data, status, headers, config){
        console.log("auth failed, status: ", status);
        _authenticated = false;
        _user = null;
        deferred.reject();
      })
      ;

      return deferred.promise;
    }

    function logout(){

      var deferred = $q.defer();

      $http.get('/api/logout')
      .success(function(data, status, headers, config){
        console.log("logout succeed");
        _authenticated = false;
        _user = null;
        deferred.resolve();
      })
      .error(function(data, status, headers, config){
        console.log("logout failed, status: ", status);
        deferred.reject();
      })
      ;

      return deferred.promise;
    }
  }






  var _authenticated = null;

  //-- an object representing current user data, it is updated
  //   when one of these functions is called:
  //
  //    - `refreshCurrentUser()`
  //    - `isAuthenticatedRecheck()`
  var _user = null;

  function _checkCurrentUserIsKnown() {
    if (_authenticated === null){
      throw new Error(
        "getCurrentUserSync() is called when we don't know current user data"
      );
    }
  }


})();

