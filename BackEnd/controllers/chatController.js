const Chat = require("../models/Chat");
const Message = require("../models/Message");
const Car = require("../models/Car");
const User = require("../models/User");
const mailer = require("../nodemailer")
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
        
        const io = getIO();
        io.to(buyerId).emit("newChat", chat);
        io.to(sellerId).emit("newChat", chat);

        setTimeout(async () => {
          const seller = await User.findById(sellerId)
          const buyer = await User.findById(buyerId)
          const car = await Car.findById(advertisementId)
          const firstMessage = await Message.findOne({ chatId: chat._id })

          console.log(`У вас новое сообщение по поводу объявления о продаже автомобиля ${car.brand} ${car.model} от ${buyer.name} ${buyer.surname}: ${firstMessage.content}`)

          const message = {
            to: seller.email,
            subject: "Новое сообщение",
            text: `У вас новое сообщение по поводу объявления о продаже автомобиля ${car.brand} ${car.model} от ${buyer.name} ${buyer.surname}: ${firstMessage.content}`,
          };
          mailer(message);
        }, 1000);
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
      const messageData = message.toObject();
      messageData.senderName = req.body.senderName;
      messageData.senderSurName = req.body.senderSurName;
      io.to(chatId).emit("newMessage", messageData);

      await Chat.findByIdAndUpdate(chatId, {
        updatedAt: new Date(),
        lastMessage: {
          content,
          senderId,
          isRead: false,
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
        .populate("advertisementId", "images brand model price")
        .populate("buyerId", "avatar name surname")
        .populate("sellerId", "avatar name surname")
        .populate("lastMessage.senderId", "avatar name surname");

      res.status(200).json(chats);
    } catch (error) {
      res.status(500).json({ error: "Ошибка при получении чатов" });
      console.log(error);
    }
  }

  async getChatToId(req, res) {
    try {
      const chatId = req.params.chatId;

      if (chatId.length !== 24) {
        return res
          .status(404)
          .json({ message: "Чата с таким ID не существует!" });
      }

      const chatInfo = await Chat.findById(chatId);

      if (!chatInfo) {
        return res
          .status(404)
          .json({ message: "Чата с таким ID не существует!" });
      }

      const chatMessages = await Message.find({ chatId }).sort({
        createdAt: 1,
      });

      const advertisementInfo = await Car.findById(
        chatInfo.advertisementId
      ).select("make model year price images");

      const sellerInfo = await User.findById(chatInfo.sellerId).select(
        "name surname avatar"
      );

      const buyerInfo = await User.findById(chatInfo.buyerId).select(
        "name surname avatar"
      );

      res
        .status(200)
        .json({ chatInfo, chatMessages, advertisementInfo, sellerInfo, buyerInfo });
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: "Ошибка вывода одного чата" });
    }
  }

  async readMessage(req, res) {
    const { chatId, messageIds } = req.body;
    try {
      await Message.updateMany(
        { _id: { $in: messageIds }, chatId },
        { $set: { isRead: true } }
      );
      res.status(200).send({ success: true });
    } catch (error) {
      res.status(500).send({ error: "Ошибка при прочтении сообщения" });
    }
  }
}

module.exports = new chatController();
