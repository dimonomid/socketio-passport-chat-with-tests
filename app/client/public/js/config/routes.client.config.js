'use strict';

(function(){

  angular.module('app')
  .config(routesConfig);


  routesConfig.$inject = [ '$stateProvider', '$urlRouterProvider' ];
  function routesConfig($stateProvider, $urlRouterProvider){
    $urlRouterProvider.otherwise('/chat/login');

    $stateProvider
    .state('chat', {
      abstract: true,
      url: '/chat',
      templateUrl: 'partials/chat/chat.html'
    })
    .state('chat.login', {
      url: '/login',
      views: {
        chat: {
          templateUrl: 'partials/chat/views/chat-messages.html',
          controller: 'ChatMessagesController as vm',
        },
        control: {
          templateUrl: 'partials/chat/views/chat-login.html',
          controller: 'LoginController as vm'
        },
      },

      resolve: {
        authCheck: resolveIfNotAuthenticated
      }
    })
    .state('chat.register', {
      url: '/register',
      views: {
        chat: {
          templateUrl: 'partials/chat/views/chat-messages.html',
          controller: 'ChatMessagesController as vm',
        },
        control: {
          templateUrl: 'partials/chat/views/chat-register.html',
          controller: 'RegisterController as vm'
        },
      },

      resolve: {
        authCheck: resolveIfNotAuthenticated
      }
    })
    .state('chat.main', {
      url: '/main',
      views: {
        chat: {
          templateUrl: 'partials/chat/views/chat-messages.html',
          controller: 'ChatMessagesController as vm',
        },
        control: {
          templateUrl: 'partials/chat/views/chat-post.html',
          controller: 'ChatPostController as vm'
        },
      },

      resolve: {
        authCheck: resolveIfAuthenticated
      }
    })

    .state('logout', {
      url: '/logout',
      controller: 'LogoutController as logout'
    })

    ;
  }


  /**
   * Checks whether user is authenticated by calling
   * authenticator.isAuthenticatedRecheck() function: it requests
   * the server to find out whether the user is logged in.
   */
  resolveIfAuthenticated.$inject = [ '$q', '$state', 'authenticator' ];
  function resolveIfAuthenticated($q, $state, authenticator) {
    var deferred = $q.defer();

    authenticator.isAuthenticatedRecheck()
    .then(function(authenticated){
      if (authenticated){
        deferred.resolve();
      } else {
        deferred.reject();
        $state.go('chat.login');
      }
    })
    .catch(function(){
      deferred.reject();
    })
    ;

    return deferred.promise;
  }

  /**
   * Checks whether user is authenticated by calling
   * authenticator.isAuthenticatedRecheck() function: it requests
   * the server to find out whether the user is logged in.
   */
  resolveIfNotAuthenticated.$inject = [ '$q', '$state', 'authenticator' ];
  function resolveIfNotAuthenticated($q, $state, authenticator) {
    var deferred = $q.defer();

    authenticator.isAuthenticatedRecheck()
    .then(function(authenticated){
      if (!authenticated){
        deferred.resolve();
      } else {
        deferred.reject();
        $state.go('chat.main');
      }
    })
    .catch(function(){
      deferred.reject();
    })
    ;

    return deferred.promise;
  }

})();


