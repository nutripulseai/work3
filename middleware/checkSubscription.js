// middleware/checkSubscription.js

const User = require('../models/User'); // Import the User model

const checkSubscription = async (req, res, next) => {
  try {
    // Log req.user to check if it contains the expected data
    console.log('User Data:', req.user); // Added a label for clarity

    // Ensure req.user exists before trying to access _id
    if (!req.user || !req.user._id) {
      return res.status(401).send('User not authenticated'); // Return 401 if user is not authenticated
    }

    const userId = req.user._id; 

    // Fetch the user from the database by their ID
    const user = await User.findById(userId);

    // If the user is not found, return a 404 error
    if (!user) {
      return res.status(404).send('User not found');
    }

    // Check if the user's subscription status is active
    if (user.subscriptionStatus === 'active') {
      return next(); // Proceed to the next middleware or route
    } else {
      return res.status(403).send('Subscription required to access this content.');
    }
  } catch (error) {
    // Log the full error for debugging purposes
    console.error('Error in checkSubscription middleware:', error);
    return res.status(500).send('Server error. Please try again later.');
  }
};

module.exports = checkSubscription;
