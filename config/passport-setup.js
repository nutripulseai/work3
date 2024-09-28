require('dotenv').config(); // Load environment variables from .env file

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User'); // Adjust the path to your User model

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID, // Use environment variable
  clientSecret: process.env.GOOGLE_CLIENT_SECRET, // Use environment variable
  callbackURL: '/auth/google/callback'
},
async (accessToken, refreshToken, profile, done) => {
  try {
    // Find user by Google ID
    let user = await User.findOne({ googleId: profile.id });

    if (!user) {
      // Create a new user if not found
      user = new User({
        googleId: profile.id,
        username: profile.displayName,
        email: profile.emails[0].value,
        profilePicture: profile.photos[0].value // Save the profile picture if needed
      });

      await user.save();
    }
    return done(null, user);
  } catch (err) {
    console.error('Error in Google Strategy:', err);
    return done(err, null);
  }
}));

// Serialize user by ID
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user by finding in the database
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
