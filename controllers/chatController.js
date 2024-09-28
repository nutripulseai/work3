const Message = require('../models/Message');
const Group = require('../models/Group');

// Send a message in a group
exports.sendMessage = async (req, res) => {
    const { groupId, userId, message } = req.body;

    try {
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        const newMessage = new Message({
            group: groupId,
            user: userId,
            message,
        });

        await newMessage.save();
        res.status(201).json({ message: 'Message sent', newMessage });
    } catch (err) {
        res.status(500).json({ error: 'Message sending failed', err });
    }
};

// Get messages for a group
exports.getMessages = async (req, res) => {
    const { groupId } = req.params;

    try {
        const messages = await Message.find({ group: groupId }).populate('user', 'name');
        res.status(200).json(messages);
    } catch (err) {
        res.status(500).json({ error: 'Failed to get messages', err });
    }
};
