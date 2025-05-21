const { Schema, model } = require('mongoose')

const Chat = new Schema({
  advertisementId: { type: String, ref: 'Advertisement', required: true },
  buyerId: { type: String, ref: 'User', required: true },
  sellerId: { type: String, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isArchived: { type: Boolean, default: false },
  lastMessage: {
    content: String,
    senderId: { type: String, ref: 'User' },
    sentAt: Date
  }
});

module.exports = model('Chats', Chat);