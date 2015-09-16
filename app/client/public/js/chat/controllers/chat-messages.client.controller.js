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

    //-- text of new message (entered by user)
    vm.newMessageText = '';

    //-- will be set to true while ajax request is in progress
    vm.busyLoading = false;

    //-- when new chat message arrives, add it to our array
    chatService.on('chatMessage', onNewMessage);
    chatService.on('chatMessageSent', onMessageSent);
    chatService.on('chatMessageSendError', onMessageSendError);

    //-- when scope is destroyed, remove listener
    $scope.$on('$destroy', function() {
      chatService.removeListener('chatMessage', onNewMessage);
      chatService.removeListener('chatMessageSent', onMessageSent);
      chatService.removeListener('chatMessageSendError', onMessageSendError);
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
     * Send chat message with data from the view form.
     * If message text is empty, does nothing.
     */
    vm.sendMessage = function sendMessage() {
      if (vm.newMessageText !== ''){

        //-- and send the message
        chatService.sendMessage(
          vm.newMessageText
        );
      }
    };


    /**
     * @private
     *
     * Called when chatService receives new chat message
     */
    function onNewMessage(message) {
      vm.messages.push(message);
    }

    /**
     * @private
     *
     * Called when chatService receives confirmation from the server
     * that message was successfully sent
     */
    function onMessageSent(message) {
      vm.newMessageText = '';
      vm.fileSelCtrl.reset();
    }

    /**
     * @private
     *
     * Called when chatService receives notification from the server
     * that there were errors message
     */
    function onMessageSendError(data) {
      console.log('message send error:', data);
    }

  }

})();

