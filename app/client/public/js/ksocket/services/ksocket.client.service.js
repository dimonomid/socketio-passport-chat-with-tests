'use strict';

/**
 * Socket.io wrapper service for kamishy.
 * Provides lazy loading: when the service in injected first time, the connection
 * will be established.
 */
(function(){

  angular.module('ksocket')
  .factory('ksocket', ksocket);

  ksocket.$inject = [ '$timeout', 'authenticator' ];
  function ksocket($timeout, authenticator){

    var _socket = null;

    //-- connect to the server socket.
    //   This way, the connection is established first time the service
    //   is injected somewhere. So, we have lazy loading.
    _socket = io();

    _socket.on('connect', function(data) {
      console.log('socket connected');
    });

    _socket.on('disconnect', function(reason) {
      console.log('socket disconnected, reason:', reason);

      if (reason === 'io server disconnect'){
        //-- we get here when the server explicitly calls `disconnect()`. It
        //   does so when user logs in / out, and we need to reconnect again,
        //   so that authentication information in the socket will be
        //   up-to-date.
        console.log('try to reconnect');
        _socket.connect();
      } else {
        //-- any other reason, for example, when the server goes down. Just
        //   don't do anything here, since it is all taken care about.
        //
        //   Note: if we try to explicitly connect again by calling
        //   _socket.connect(), then the connection will not be re-established
        //   after server goes up again. If we don't do anything, it will
        //   be re-established.
        console.log('do not do anything special');
      }
    });

    console.log('ksocket loaded');

    return {
      on: on,
      emit: emit,
      removeListener: removeListener,
    };




    function on(eventName, callback) {
      if (_socket){
        _socket.on(eventName, function(data) {
          $timeout(function() {
            callback(data);
          });
        });
      }
    }

    function emit(eventName, data) {
      if (_socket){
        _socket.emit(eventName, data);
      }
    }

    function removeListener(eventName) {
      if (_socket){
        _socket.removeListener(eventName);
      }
    }

  }

})();

