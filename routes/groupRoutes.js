const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController'); // Import the groupController

// Create a new group
router.post('/create', groupController.createGroup);

// Join a group
router.post('/join', groupController.joinGroup);

// Search for groups by name
router.get('/search', groupController.searchGroups);

// Render groups page (e.g., list all groups or provide a form to create/join groups)
router.get('/', async (req, res) => {
    try {
        const groups = await Group.find(); // Fetch all groups or apply necessary filters
        res.render('groups', { groups }); // Render groups.ejs template with groups data
    } catch (err) {
        res.status(500).json({ error: 'Failed to load groups', err });
    }
});

module.exports = router;
