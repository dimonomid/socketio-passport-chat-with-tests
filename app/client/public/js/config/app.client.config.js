'use strict';

(function(){

  angular.module('app')
  .config(httpInterceptorConfig)
  ;

  httpInterceptorConfig.$inject = [ '$httpProvider' ];
  function httpInterceptorConfig($httpProvider){
    $httpProvider.interceptors.push(redirectIfUnauthorized);
  }


  redirectIfUnauthorized.$inject = [ '$q', '$location' ];
  function redirectIfUnauthorized($q, $location) {
    return {
      response: function(response) {
        //-- do something on success
        return response;
      },
      responseError: function(response) {
        if (response.status === 401){
          $location.url('/chat/login');
          console.log('go to login');
        }
        return $q.reject(response);
      }
    };
  }


}());

