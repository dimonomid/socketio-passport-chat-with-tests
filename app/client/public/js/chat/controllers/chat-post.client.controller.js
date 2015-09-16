'use strict';

(function(){

  angular.module('chat')
  .controller('ChatPostController', ChatPostController);



  ChatPostController.$inject = [ '$scope', 'chatService' ];
  function ChatPostController($scope, chatService){
    var vm = this;

    chatService.on('chatMessageSent', onMessageSent);
    chatService.on('chatMessageSendError', onMessageSendError);

    //-- when scope is destroyed, remove listener
    $scope.$on('$destroy', function() {
      chatService.removeListener('chatMessageSent', onMessageSent);
      chatService.removeListener('chatMessageSendError', onMessageSendError);
    });


    //-- text of new message (entered by user)
    vm.newMessageText = '';

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

