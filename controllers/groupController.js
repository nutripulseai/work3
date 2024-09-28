const Group = require('../models/Group');
const User = require('../models/User');

// Create a new group
exports.createGroup = async (req, res) => {
    const { name, creatorId } = req.body;

    try {
        // Check if the creator exists
        const creator = await User.findById(creatorId);
        if (!creator) {
            return res.status(404).json({ error: 'Creator not found' });
        }

        const group = new Group({
            name,
            creator: creatorId,
            members: [creatorId],
        });
        await group.save();
        res.status(201).json({ message: 'Group created successfully', group });
    } catch (err) {
        res.status(500).json({ error: 'Group creation failed', err });
    }
};

// Join a group
exports.joinGroup = async (req, res) => {
    const { groupId, userId } = req.body;

    try {
        // Check if the group exists
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        // Check if the user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Add user to group if not already a member
        if (!group.members.includes(userId)) {
            group.members.push(userId);
            await group.save();
        }

        res.status(200).json({ message: 'Joined group successfully', group });
    } catch (err) {
        res.status(500).json({ error: 'Failed to join group', err });
    }
};

// Search for groups by name
exports.searchGroups = async (req, res) => {
    const { name } = req.query;

    try {
        const groups = await Group.find({ name: new RegExp(name, 'i') });
        res.status(200).json(groups);
    } catch (err) {
        res.status(500).json({ error: 'Search failed', err });
    }
};
