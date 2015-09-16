'use strict';

(function(){

  angular.module('users')
  .controller('RegisterController', RegisterController);


  RegisterController.$inject = [ '$state', 'usersService', 'authenticator' ];
  function RegisterController($state, usersService, authenticator){
    var vm = this;

    vm.username = '';
    vm.password = '';

    //-- options for validations:
    //   validate after 1 second after last typed character,
    //   or immediately on blur
    vm.ngModelOptions = {
      updateOn: 'default blur',
      debounce: {'default': 500, 'blur': 0}
    };

    vm.serverErrorMsg = '';

    vm.submit = function(){
      console.log('submitting auth..');
      usersService.register(
        vm.username,
        vm.password
      )
      .then(function() {
        console.log('reg succeed, authenticating..');
        return authenticator.authenticate(
          vm.username,
          vm.password
        );
      })
      .then(function(){
        console.log('auth succeed');
        $state.go('chat.main');
      })
      .catch(function(res){
        console.log('error', res);
        vm.serverErrorMsg = res.data.errorMsg;
      });
    };
  }

})();

