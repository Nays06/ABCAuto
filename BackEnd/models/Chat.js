const { Schema, model } = require('mongoose')

const Chat = new Schema({
  advertisementId: { type: Schema.Types.ObjectId, ref: 'Cars', required: true },
  buyerId: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
  sellerId: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isArchived: { type: Boolean, default: false },
  lastMessage: {
    content: String,
    senderId: { type: Schema.Types.ObjectId, ref: 'Users' },
    sentAt: Date
  }
});

module.exports = model('Chats', Chat);