const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

router.post('/chats', chatController.createOrGetChat);
router.post('/messages', chatController.sendMessage);
router.get('/chats/:userId', chatController.getUserChats);
router.get('/messages/:chatId', chatController.getChatMessages);

module.exports = router;
