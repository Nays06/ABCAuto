const Chat = require("../models/Chat");
const Message = require("../models/Message");
const Car = require("../models/Car");
const User = require("../models/User");

const { getIO } = require("../socket");

class chatController {
  async createOrGetChat(req, res) {
    const { advertisementId, buyerId, sellerId } = req.body;

    try {
      let chat = await Chat.findOne({
        advertisementId,
        buyerId,
        sellerId,
      });

      if (!chat) {
        chat = new Chat({
          advertisementId,
          buyerId,
          sellerId,
        });
        await chat.save();
      }

      res.status(200).json(chat);
    } catch (error) {
      res.status(500).json({ error: "Ошибка при создании чата" });
      console.log(error);
    }
  }

  async sendMessage(req, res) {
    const {
      chatId,
      senderId,
      recipientId,
      content,
      attachments = [],
    } = req.body;

    try {
      const message = new Message({
        chatId,
        senderId,
        recipientId,
        content,
        attachments,
      });
      await message.save();

      const io = getIO();
      io.to(chatId).emit("newMessage", message);

      await Chat.findByIdAndUpdate(chatId, {
        updatedAt: new Date(),
        lastMessage: {
          content,
          senderId,
          sentAt: new Date(),
        },
      });

      res.status(201).json(message);
    } catch (error) {
      res.status(500).json({ error: "Ошибка при отправке сообщения" });
      console.log(error);
    }
  }

async getUserChats(req, res) {
  const userId = req.user.id;

  try {
    const chats = await Chat.find({
      $or: [{ buyerId: userId }, { sellerId: userId }],
    })
      .sort({ updatedAt: -1 })
      .limit(20)
      .populate('advertisementId', 'images brand model price')
      .populate('buyerId', 'avatar name surname')
      .populate('sellerId', 'avatar name surname')
      .populate('lastMessage.senderId', 'avatar name surname');

    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ error: "Ошибка при получении чатов" });
    console.log(error);
  }
}

  async getChatToId(req, res) {
    try {
      const chatId = req.params.chatId;

      const chatInfo = await Chat.findById(chatId);

      const chatMessages = await Message.find({ chatId }).sort({ createdAt: 1 });

      const advertisementInfo = await Car.findById(chatInfo.advertisementId).select('make model year price images');

      const sellerInfo = await User.findById(chatInfo.sellerId).select('name surname avatar');

      res.status(200).json({ chatInfo, chatMessages, advertisementInfo, sellerInfo });
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: "Ошибка вывода одного чата" });
    }
  }
}

module.exports = new chatController();
