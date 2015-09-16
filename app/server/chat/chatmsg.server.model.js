'use strict';

(function() {

  var mongoose = require('mongoose');

  var chatMsgSchema = new mongoose.Schema({
    text: {
      type: String,
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  });


  module.exports = mongoose.model('ChatMsg', chatMsgSchema);

})();

