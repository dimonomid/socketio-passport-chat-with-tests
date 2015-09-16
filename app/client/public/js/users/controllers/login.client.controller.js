'use strict';

(function(){

  angular.module('users')
  .controller('LoginController', LoginController);


  LoginController.$inject = [ '$state', 'authenticator' ];
  function LoginController($state, authenticator){
    var vm = this;

    //-- will be set to true if user submits wrong credentials
    vm.wrongLogin = false;

    vm.username = '';
    vm.password = '';

    vm.submit = function(){
      console.log('submitting auth..');
      authenticator.authenticate(
        vm.username,
        vm.password
      )
      .then(function(){
        console.log('auth succeed');
        $state.go('chat.main');
      })
      .catch(function(){
        //console.log('error');
        vm.wrongLogin = true;
      });
    };
  }

})();

