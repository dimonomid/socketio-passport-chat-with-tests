'use strict';

/*
 * Events that are supported by on() / removeListener() :
 *
 * - chatMessage
 * - chatMessageSent
 *
 */

(function(){
  angular.module('chat')
  .factory('chatService', chatService);

  chatService.$inject = [ '$resource', '$timeout', 'ksocket' ];
  function chatService($resource, $timeout, ksocket){

    console.log('add:', on);

    var chatMsg = $resource(
      '/api/chat/msgs/:collectionController:chatMsgId',
      {
        chatMsgId: '@_id',
        collectionController: '@collectionController'
      }
    );

    /**
     * @type {Object}
     *
     * this object gets populated when some message is going to be sent.
     * It is needed because chat messages with images are not sent immediately,
     * so we have to wait until images are uploaded, and then, if there
     * were no errors, sent the message text.
     */
    var messageBeingSent = null;

    /**
     * @type {number}
     *
     * this number is needed just for the client to identify events
     * from the server. When message is going to send,
     * messageBeingSent.messageClientId is set to current value of
     * messageClientId, and messageClientId is incremented.  When
     * server responds some event (for example, chatMessageSent),
     * the client can identify to which message this event relates.
     */
    var messageClientId = 0;

    var callbacks = {
      chatMessage: [],
      chatMessageSent: [],
      chatMessageSendError: [],
    };

    ksocket.on('chatMessage', function(data){
      _emit('chatMessage', data);
    });

    ksocket.on('chatMessageSent', function(data){
      if (messageBeingSent.messageClientId === data.messageClientId){
        //-- messageClientId is as expected, so,
        //   call client-provided callback
        _emit('chatMessageSent', data);

        _resetMessageBeingSent();
      } else {
        console.error('chatMessageSent is emitted with unexpected messageClientId');
      }
    });

    ksocket.on('chatMessageSendError', function(data){
      if (messageBeingSent.messageClientId === data.messageClientId){
        //-- messageClientId is as expected, so,
        //   call client-provided callback
        _emit('chatMessageSendError', data);

        _resetMessageBeingSent();
      } else {
        console.error('chatMessageSendError is emitted with unexpected messageClientId');
      }
    });


    return {
      find: find,
      on: on,
      removeListener: removeListener,
      sendMessage: sendMessage,
      isSendingMessage: isSendingMessage,
    };



    /**
     * Returns empty array which will be populated later
     * (poweder by $resource)
     *
     * @param {Object} queryData
     *    Object that can contain various keys to narrow
     *    query.
     *    See chat.server.controller.js, expressQuery
     *    function, for details on these keys.
     */
    function find(queryData){
      return chatMsg.query(queryData);
    }

    /**
     * Add event listener.
     *
     * @param {string} type
     *    event type
     * @param {function} callback
     *    callback to call when new event occurs
     *
     * @throws {Error} if given event type doesn't exist
     */
    function on(type, callback) {
      _ensureEventExists(type);

      callbacks[type].push(callback);
    }

    /**
     * Remove event listener that was previously registered
     * with on()
     *
     * @param {string} type
     *    event type
     * @param {function} callback
     *    callback unregister
     *
     * @throws {Error} if given event type doesn't exist
     */
    function removeListener(type, callback) {
      _ensureEventExists(type);

      var cb = callbacks[type];
      for (var i = 0; i < cb.length; i++){
        if (cb[i] === callback){
          cb.splice(i, 1);
          break;
        }
      }
    }

    /**
     * Send new message
     *
     * @param {string} text
     *    New message text
     */
    function sendMessage(text) {

      //-- check if we're not already transmitting a message at the moment
      if (messageBeingSent === null){

        //-- check if text is not empty
        if (text){

          messageBeingSent = {
            //-- see comments for messageClientId above
            messageClientId: messageClientId,

            //-- message text
            text: text,
          };

          //-- increment messageClientId
          messageClientId++;

          $timeout(function() {
            ksocket.emit('chatMessage', messageBeingSent);
          });

        }
      }
    }

    /**
     * Returns whether the chat message sending is in progress
     */
    function isSendingMessage() {
      return (messageBeingSent !== null);
    }




    /**
     * Private function:
     *
     * Reset message that is currently being send. Should be called on success
     * or on error.
     */
    function _resetMessageBeingSent() {
      messageBeingSent = null;
    }

    /**
     * @private
     *
     * Generic emit function, for any type of events: it takes an event
     * type and an arbitrary number of event arguments
     *
     * @param {string} eventType
     *    Type of event to emit
     *
     * @param {mixed} ...
     *    All the rest arguments will be given to each registered
     *    event handler
     *
     * @throws {Error} if given eventType doesn't exist
     */
    function _emit(eventType /*, ... */) {
      //-- self-check: make sure we have such event
      _ensureEventExists(eventType);

      //-- get event arguments (all other arguments after eventType)
      //   we must reference Array.prototype.slice explicitly
      //   because `arguments` is not an Array, but an Array-like object.
      var eventArgs = Array.prototype.slice.call(arguments, 1);

      //-- call each registered event handler
      for (var i = 0; i < callbacks[eventType].length; i++){
        callbacks[eventType][i].apply(null, eventArgs);
      }

    }

    /**
     * @private
     *
     * Ensure given event type exists. If it doesn't exist, exception
     * is thrown. Otherwise, the function does nothing.
     */
    function _ensureEventExists(eventType) {
      if (!(eventType in callbacks)){
        throw new Error("unknown event type: " + eventType);
      }
    }

  }


}());


