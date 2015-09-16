'use strict';

(function(){

  angular.module('app', [
    'ui.router',
    'users',
    'chat',
    'ngMessages',
    'ngAnimate',
  ]);
  angular.module('users', ['ngResource', 'ngCookies']);
  angular.module('ksocket', []);
  angular.module('chat', ['ksocket']);

})();

