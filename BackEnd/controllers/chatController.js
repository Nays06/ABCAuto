const Chat = require("../models/Chat");
const Message = require("../models/Message");

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
      console.log(error)
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
      console.log(error)
    }
  }

  async getUserChats(req, res) {
    const userId = req.user.id;

    try {
      const chats = await Chat.find({
        $or: [{ buyerId: userId }, { sellerId: userId }],
      }).sort({ updatedAt: -1 });

      res.status(200).json(chats);
    } catch (error) {
      res.status(500).json({ error: "Ошибка при получении чатов" });
      console.log(error)
    }
  }

  async getChatMessages(req, res) {
    const { chatId } = req.params;

    try {
      const messages = await Message.find({ chatId }).sort({ createdAt: 1 });
      res.status(200).json(messages);
    } catch (error) {
      res.status(500).json({ error: "Ошибка при получении сообщений" });
      console.log(error)
    }
  }
}

module.exports = new chatController();
