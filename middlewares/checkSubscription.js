// middlewares/checkSubscription.js
const User = require('../models/User'); // Import the User model

const checkSubscription = async (req, res, next) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).send('User not authenticated');
        }

        // Fetch the user from the database
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).send('User not found');
        }

        // Check subscription status
        if (user.subscriptionStatus === 'active') {
            return next(); // User is subscribed, proceed
        } else {
            return res.status(403).send('Subscription required to access this content.');
        }
    } catch (error) {
        console.error('Error in checkSubscription middleware:', error);
        return res.status(500).send('Server error. Please try again later.');
    }
};

module.exports = checkSubscription;
