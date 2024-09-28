const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController'); // Import the chatController

// Send a message in a group
router.post('/send', chatController.sendMessage);

// Get messages for a group
router.get('/:groupId/messages', chatController.getMessages);

module.exports = router;
