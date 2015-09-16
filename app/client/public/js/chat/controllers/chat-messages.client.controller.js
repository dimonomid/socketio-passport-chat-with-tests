'use strict';

(function(){

  angular.module('chat')
  .controller('ChatMessagesController', ChatMessagesController);



  ChatMessagesController.$inject = [ '$scope', 'chatService' ];
  function ChatMessagesController($scope, chatService){
    var vm = this;

    //-- array of chat messages. Will be filled later by
    //   loadNextPage() calls, which will be made by
    //   infinite scroll.
    vm.messages = [];

    //-- when new chat message arrives, add it to our array
    chatService.on('chatMessage', onNewMessage);

    //-- when scope is destroyed, remove listener
    $scope.$on('$destroy', function() {
      chatService.removeListener('chatMessage', onNewMessage);
    });

    //-- will be updated from chatService.isSendingMessage()
    vm.isSendingMessage = false;

    //-- listen on `chatService.isSendingMessage()`
    //
    //   TODO: we can probably get rid of this watch: for this, we
    //   need to maintain vm.isSendingMessage manually: set it when
    //   message is going to be sent, and clear when it's sent or when
    //   some error occurred
    $scope.$watch(
      chatService.isSendingMessage,
      function(newValue) {
        vm.isSendingMessage = newValue;
      }
    );



    /**
     * @private
     *
     * Called when chatService receives new chat message
     */
    function onNewMessage(message) {
      vm.messages.push(message);
    }

  }

})();

