'use strict';

(function(){

  angular.module('app')
  .config(routesConfig);


  routesConfig.$inject = [ '$stateProvider', '$urlRouterProvider' ];
  function routesConfig($stateProvider, $urlRouterProvider){
    $urlRouterProvider.otherwise('/chat/login');

    $stateProvider
    .state('chat', {
      url: '/chat',
      templateUrl: 'partials/chat/chat.html',
    })
    .state('chat.chatControlAbstract', {
      abstract: true,
      views: {
        'chat': {
          templateUrl: 'partials/chat/views/chat-messages.html',
          controller: 'ChatMessagesController as vm',
        },

        'control': {
          template: '<div ui-view="actualControl"></div>',
        }
      }
    })
    .state('chat.chatControlAbstract.login', {
      url: '/login',
      views: {
        'actualControl': {
          templateUrl: 'partials/chat/views/chat-login.html',
          controller: 'LoginController as vm'
        },
      },

      resolve: {
        authCheck: resolveIfNotAuthenticated
      }
    })
    .state('chat.chatControlAbstract.register', {
      url: '/register',
      views: {
        'actualControl': {
          templateUrl: 'partials/chat/views/chat-register.html',
          controller: 'RegisterController as vm'
        },
      },

      resolve: {
        authCheck: resolveIfNotAuthenticated
      }
    })
    .state('chat.chatControlAbstract.main', {
      url: '/main',
      views: {
        'actualControl': {
          templateUrl: 'partials/chat/views/chat-post.html',
          controller: 'ChatPostController as vm'
        },
      },

      resolve: {
        authCheck: resolveIfAuthenticated
      }
    })
    .state('chat.chatControlAbstract.logout', {
      url: '/logout',
      views: {
        'actualControl': {
          controller: 'LogoutController as vm'
        },
      },
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
        $state.go('chat.chatControlAbstract.login');
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
        $state.go('chat.chatControlAbstract.main');
      }
    })
    .catch(function(){
      deferred.reject();
    })
    ;

    return deferred.promise;
  }

})();


