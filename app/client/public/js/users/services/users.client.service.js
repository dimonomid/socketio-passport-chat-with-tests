'use strict';

(function(){
  angular.module('users')
  .factory('usersService', usersService);

  usersService.$inject = [ '$q', '$http', '$resource', 'Upload', 'authenticator' ];
  function usersService($q, $http, $resource, Upload, authenticator){

    var User = $resource(
      '/api/users/:collectionController:userId',
      {
        userId: '@_id',
        collectionController: '@collectionController'
      },
      {
        update: { method: 'PUT' },
        current: {
          method: 'GET',
          params: {
            collectionController: 'current'
          }
        }
      }
    );

    return {
      register:       register,
      usernameExists: usernameExists,
      getCurrentUser: getCurrentUser,
    };


    /**
     * @param password
     *
     * Try to register user with given credentials.
     *
     * Returns promise which gets resolved (to nothing) if registration
     * succeeds, or rejected if registration fails.
     */
    function register(username, password){

      var deferred = $q.defer();

      var user = new User({
        username: username,
        password: password
      });
      user.$save()
      .then(
        function(result){
          //console.log("registration succeed, result: ", result);
          deferred.resolve(result);
        }
      )
      .catch(
        function(err){
          console.log("registration failed, status: ", err.status);
          deferred.reject(err);
        }
      )
      ;

      return deferred.promise;
    }

    /**
     * @param username
     *
     * Returns promise which is normally resolved to true or false.
     * (Obviously, it is resolved to true if given username already exists)
     *
     * If something unexpected happens, promise is rejected.
     */
    function usernameExists(username){

      var deferred = $q.defer();

      $http.get('/api/users/username_exists?username=' + username)
      .success(function(data, status, headers, config){
        if (data){
          //-- got expected response, resolve
          //   promise with the result
          deferred.resolve(data.username_exists);
        } else {
          //-- got some unexpected response from the server
          deferred.reject();
        }
      })
      .error(function(data, status, headers, config){
        deferred.reject();
      })
      ;

      return deferred.promise;
    }

    /**
     * Requests data of current user from the server.
     * Current user's id is taken by authenticator.getCurrentUserId().
     */
    function getCurrentUser(){
      return User.current();
    }

  }


})();

