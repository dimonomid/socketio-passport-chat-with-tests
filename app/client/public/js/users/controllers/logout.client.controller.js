'use strict';

(function(){

  angular.module('users')
  .controller('LogoutController', LogoutController);


  LogoutController.$inject = [ '$state', 'authenticator' ];
  function LogoutController($state, authenticator){
    console.log('submitting logout..');
    authenticator.logout()
    .then(function(){
      console.log('logout succeed');
      $state.go('chat.login');
    })
    .catch(function(){
      //console.log('error');
    });
  }

})();

