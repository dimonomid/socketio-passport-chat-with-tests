'use strict';

(function(){

  /**
   * Module exports.
   * @public
   */

  exports.expressQuery = expressQuery;

  exports.clientConnect = clientConnect;





  /**
   * Module dependencies.
   * @private
   */

  var debug = require('debug')('k:chat.server.controller');

  var appRoot = require('app-root-path') + '/app/server';
  var config = require(appRoot + '/config/app.server.config');
  var ChatMsg = require(appRoot + '/chat/chatmsg.server.model.js');
  var path = require('path');
  var fs = require('fs');



  /**
   * Express middleware, queries chat messages and sends them
   *
   * URL query may contain the following:
   *    - limit: maximum number of messages to return
   *    - beforeId: if provided, then only those messages will
   *      be returned, whose id is less than the provided value
   *
   * @public
   */
  function expressQuery(req, res, next) {
    //-- build query data: if beforeId provided, take it
    //   into account
    var queryData = {};
    if (req.query.beforeId){
      queryData._id = {
        $lt: req.query.beforeId
      };
    }

    //-- create query, populating user and sorting in descending
    //   order by createdAt field (since we need to get latest
    //   messages)
    var query = ChatMsg.find(queryData)
    .populate('user')
    .sort('-createdAt')
    ;

    //-- if limit is provided, take it into account
    if (req.query.limit){
      var limit = req.query.limit * 1;
      if (limit > 0){
        query.limit(limit);
      }
    }

    //-- execute query
    query.exec()
    .then(function(chatMsgs) {
      //-- we have reversed array of messages (since we sorted it
      //   by createdAt in descending order), but client wants
      //   the array to be not reversed. So, reverse it back.
      chatMsgs = chatMsgs.reverse();

      //-- and send to the client
      res.send(chatMsgs);
    })
    ;

  }


  /**
   * Setup connection with client. Should be called whenever
   * new client socket connection is established.
   *
   * @param {Object} io
   *    server-side socket
   * @param {Object} clientSocket
   *    client socket connection
   *
   * @public
   */
  function clientConnect(io, clientSocket) {

    //-- register events
    clientSocket.on('chatMessage', _onChatMessage);
    clientSocket.on('disconnect', _onDisconnect);




    /**
     * Called when new message is received from the client
     *
     * @param {Object} msgFromClient
     *    Message from the client. It looks like this:
     *    {
     *      text: "message text",
     *      filesSent: [ file1, file2 ], //  see details below
     *      messageClientId: 0  // just an integer number
     *                          // unique for each particular client.
     *    }
     *
     *    files objects given as elements of the array filesSent:
     *    {
     *      fileNum: not very useful here: it's an index in the filesSent array,
     *      originalFilename: filename uploaded by user,
     *      actualFilename: filename saved by server,
     *      size: size of the file (might not be equal to size of saved file),
     *      type: string like ".jpg", or ".png", etc,
     *      completed: true if file upload is already completed (should be true here),
     *      success: true if completed without errors
     *    }
     *
     * @private
     */
    function _onChatMessage(msgFromClient) {

      debug('chat message:', msgFromClient);


      if (clientSocket.request.user && clientSocket.request.user._id){
        //-- construct new instance of ChatMsg
        var chatMsg = new ChatMsg({
          text: msgFromClient.text,
          user: clientSocket.request.user._id
        });

        //-- save it to the database
        chatMsg.save()
        .then(
          function(chatMsg) {
            //-- message is saved successfully

            //   notify all connected clients about new message
            chatMsg.user = clientSocket.request.user;
            clientSocket.emit('chatMessageSent', {
              messageClientId: msgFromClient.messageClientId,
            });
            //debug('emitting chatMessage:', chatMsg);
            io.emit('chatMessage', chatMsg);

          },
          function(err) {
            debug('chat message save err: ', err);
          }
        );

      } else {
        //-- user is not logged in
        debug('trying to sent message from non-logged-in user');

        //-- notify sender that message sending has failed, with the
        //   details
        clientSocket.emit('chatMessageSendError', {
          messageClientId: msgFromClient.messageClientId,
        });
      }


    }

    /**
     * Called when client disconnects
     *
     * @private
     */
    function _onDisconnect() {
      debug('user disconnected: ' + clientSocket.request.user.username);
    }

  }







})();

