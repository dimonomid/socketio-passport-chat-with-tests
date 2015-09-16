'use strict';

(function () {

  var repoRoot = require('app-root-path') + '';
  var appRoot = require('app-root-path') + '/app/server';

  var debug = require('debug')('k:chat.server.controller.test');

  var should = require('should');
  var io = require('socket.io-client');
  var config = require(appRoot + '/config/app.server.config');
  var request = require('supertest');
  var cookiejar = require('cookiejar');
  var authHelper = require(repoRoot + '/test/server/unit_helpers/auth.server.test.helper');
  var User = require(appRoot + '/users/user.server.model.js');

  var app = require(appRoot + '/server');
  var socketUrl = 'http://localhost:' + config.express.port;
  debug('url:', socketUrl);

  var options = {
    transports: ['websocket'],
    autoConnect: true,//false,
    forceNew: true,
  };



  var sessionId;



  var testUser1;
  var testUser1Id;

  var testUser1Username = 'user1';
  var testUser1Password = 'mypassword';

  var testUser2;
  var testUser2Id;

  var testUser2Username = 'user2';
  var testUser2Password = 'mypassword';

  var userData1 = {
    agent: request.agent(app),
  };
  var userData2 = {
    agent: request.agent(app),
  };

  describe("Chat server controller", function () {

    before(function(done) {

      //-- create test users

      testUser1 = new User({
        username:   testUser1Username,
        password:   testUser1Password,
      });
      testUser1.save(function(user) {
        testUser1Id = testUser1.id;
        //-- if both users were created, continue
        _checkUsersCreated();
      });

      testUser2 = new User({
        username:   testUser2Username,
        password:   testUser2Password,
      });
      testUser2.save(function(user) {
        testUser2Id = testUser2.id;
        //-- if both users were created, continue
        _checkUsersCreated();
      });

      //-- if both users were created, continue
      function _checkUsersCreated() {
        if (testUser1Id && testUser2Id){
          done();
        }
      }
    });

    //-- after tests, remove all users
    after(function(done) {
      User.remove(function() {
        done();
      });
    });


    describe("Both users logged in", function () {

      //-- before tests, reset user data
      before(function(done) {
        _resetUserDataAll();
        done();
      });


      //-- login user1
      authHelper.agentLogin(
        userData1.agent,
        testUser1Username,
        testUser1Password,
        _agentLoginCallback,
        userData1
      );

      //-- login user2
      authHelper.agentLogin(
        userData2.agent,
        testUser2Username,
        testUser2Password,
        _agentLoginCallback,
        userData2
      );



      //-- connect both clients to socket
      _socketConnectAll();

      //-- try to broadcast messages, user2 is logged in
      _tryBroadcastMessages(true);

      //-- disconnect from socket
      _socketDisonnectAll();


      //-- logout user1
      authHelper.agentLogout(
        userData1.agent
      );

      //-- logout user2
      authHelper.agentLogout(
        userData2.agent
      );

    });



    describe("User1 is logged in, but User2 is not", function () {

      //-- before tests, reset user data
      before(function(done) {
        _resetUserDataAll();
        done();
      });

      //-- login user1
      authHelper.agentLogin(
        userData1.agent,
        testUser1Username,
        testUser1Password,
        _agentLoginCallback,
        userData1
      );

      //-- connect both clients to socket
      _socketConnectAll();

      //-- try to broadcast messages, user2 is not logged in
      _tryBroadcastMessages(false);

      //-- disconnect clients from sockets
      _socketDisonnectAll();

      //-- logout user1
      authHelper.agentLogout(
        userData1.agent
      );


    });

  });





  function _agentLoginCallback(res, done, userData) {
    var accessInfo = new cookiejar.CookieAccessInfo();

    //-- get signed cookie value, like 's:my-session-id-bla-bla.hash-foo-bar'
    var sessionIdSigned = unescape(
      userData.agent.jar.getCookie(
        config.sidCookieName,
        accessInfo
      ).value
    );

    //-- get cookie value without checking the hash, like 'my-session-id-bla-bla'
    userData.sessionId = sessionIdSigned
    .slice(0, sessionIdSigned.lastIndexOf('.')) //-- remove hash
    .slice(2) //-- remove "s:" from the beginning
    ;


    debug('sessionId:', userData.sessionId);

    done();
  }

  function _socketConnectUser(userData, checkDone) {
    userData.socket = io(
      socketUrl + '?session_id=' + userData.sessionId,
      options
    );

    userData.socket.on('connect', function (data) {
      userData.connected = true;
      checkDone();
    });
  }

  function _socketConnectAll() {
    it("Should connect to socket", function(done) {
      //-- open socket
      _socketConnectUser(userData1, checkDone);
      _socketConnectUser(userData2, checkDone);

      function checkDone(){
        if (userData1.connected && userData2.connected){
          done();
        }
      }
    });
  }

  function _socketDisonnectAll() {
    it("Should disconnect", function(done) {

      userData1.socket.disconnect();
      userData2.socket.disconnect();

      done();
    });
  }

  /**
   * Try to broadcast messages, and check the following:
   *
   *   - Messages from logged-in users are broadcasted
   *   - Messages from non-logged-in users are NOT broadcasted
   *   - Users get notified about whether or not message
   *     sending was successful
   */
  function _tryBroadcastMessages(user2LoggedIn) {
    it("Should broadcast messages", function(done) {
      var chatMessage = {
        text:             'hello',
        messageClientId:  123,
      };
      //var messages = 0;

      var subscribeOnChatMessage = function(userData){

        //-- new chat message received
        userData.socket.on('chatMessage', function(msg){
          msg.text.should.equal(chatMessage.text);

          //-- remember received message
          userData.messagesReceived.push(msg);
        });

        //-- chat message sent
        userData.socket.on('chatMessageSent', function(data){

          data.messageClientId.should.equal(chatMessage.messageClientId);

          //-- remember sent message
          userData.messagesSent.push(data);
        });

        //-- chat message sending failed
        userData.socket.on('chatMessageSendError', function(data){

          data.messageClientId.should.equal(chatMessage.messageClientId);

          //-- remember sent message
          userData.messagesFailed.push(data);
        });
      };

      //-- subscribe both users on chat events
      subscribeOnChatMessage(userData1);
      subscribeOnChatMessage(userData2);

      //-- make users to send some messages
      userData1.socket.emit('chatMessage', chatMessage);
      userData1.socket.emit('chatMessage', chatMessage);
      userData2.socket.emit('chatMessage', chatMessage);

      //-- Note: we ue setTimeout here intead of checking current numbers
      //   every time socket event is received, because it would not
      //   catch the error if we get more events than expected.
      //
      //   Plus, it gives us much more informative error messages,
      //   unlike plain "timeout of 2000 ms exceeded".
      var checkTimerId = setTimeout(
        function () {
          if (user2LoggedIn){
            //-- both users should receive messages from both of them
            userData1.messagesReceived.length.should.equal(3);
            userData2.messagesReceived.length.should.equal(3);

            //-- user 1 should have 2 messages sent,
            //   user 2 should have 1 message sent.
            userData1.messagesSent.length.should.equal(2);
            userData2.messagesSent.length.should.equal(1);

            //-- nobody should have any failed messages
            userData1.messagesFailed.length.should.equal(0);
            userData2.messagesFailed.length.should.equal(0);
          } else {
            //-- both users should receive only messages from user 1
            //   (even though user 2 is not logged in, he/she should still
            //   receive messages), but messages from user 2 should be ignored
            userData1.messagesReceived.length.should.equal(2);
            userData2.messagesReceived.length.should.equal(2);

            //-- user 1 should have 2 messages sent,
            //   but user 2 should not have any messages sent
            userData1.messagesSent.length.should.equal(2);
            userData2.messagesSent.length.should.equal(0);

            //-- user 1 should not have failed messages,
            //   but user 2 should have.
            userData1.messagesFailed.length.should.equal(0);
            userData2.messagesFailed.length.should.equal(1);
          }

          done();
        },
        100
      );

    });
  }

  function _resetUserDataAll() {

    userData1.sessionId = null;
    userData1.socket = null;
    userData1.connected = false;
    userData1.messagesReceived = [];
    userData1.messagesSent = [];
    userData1.messagesFailed = [];

    userData2.sessionId = null;
    userData2.socket = null;
    userData2.connected = false;
    userData2.messagesReceived = [];
    userData2.messagesSent = [];
    userData2.messagesFailed = [];

  }


}());

