const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: function() { return !this.googleId; }, // Only required for local sign-in
    unique: true, // Ensure email is unique
    lowercase: true, // Convert to lowercase before saving
    validate: {
      validator: function(email) {
        // Basic email format validation
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      },
      message: 'Please provide a valid email address',
    },
  },
  password: {
    type: String,
    required: function() { return !this.googleId; }, // Only required for local sign-in
  },
  googleId: {
    type: String,
    unique: true, // Ensure googleId is unique if used
  },
  displayName: {
    type: String, // Store the display name from Google profile
  },
  profilePicture: {
    type: String, // Store profile picture URL from Google profile
  },
  subscriptionStatus: {
    type: String,
    enum: ['free', 'active', 'expired'], // Possible subscription statuses
    default: 'free', // Default status is 'free'
  },
  subscriptionDetails: {
    expirationDate: { type: Date, default: null }, // Expiration date for the subscription
    plan: { type: String, default: 'Free' }, // Plan details, defaults to 'Free'
  },
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

const User = mongoose.model('User', userSchema);

module.exports = User;

