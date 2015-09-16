'use strict';

(function(){

  angular.module('users')
  .directive('usernameExistsValidator', usernameExistsValidator);


  usernameExistsValidator.$inject = [ '$q', 'usersService' ];
  function usernameExistsValidator($q, usersService){
    return {
      require: 'ngModel',
      link : function(scope, element, attrs, ngModel) {

        ngModel.$asyncValidators.usernameExists = function(modelValue, viewValue){
          return usersService.usernameExists(viewValue)
          .then(
            function(username_exists) {
              //-- Since async validation system wants resolved/rejected
              //   promise, we have to convert here from true/false
              //   to resolved/rejected promise.
              return username_exists ? $q.reject() : $q.when();
            }
          );
        };
      }
    };
  }

})();


