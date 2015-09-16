'use strict';

(function(){

  angular.module('app', [
    'ui.router',
    'users',
    'chat',
    'ngMessages',
    'ngAnimate',
    'luegg.directives'
  ]);
  angular.module('users', ['ngResource', 'ngCookies']);
  angular.module('mySocket', []);
  angular.module('chat', ['mySocket']);

})();

