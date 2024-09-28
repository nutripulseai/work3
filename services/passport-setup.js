const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User'); // Adjust the path if needed

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'http://localhost:3456/auth/google/callback' // Match this with your redirect URI
}, async (accessToken, refreshToken, profile, done) => {
  // Check if user already exists in our db
  const existingUser = await User.findOne({ googleId: profile.id });
  if (existingUser) {
    // User already exists
    return done(null, existingUser);
  }

  // If user does not exist, create a new user
  const newUser = await new User({ googleId: profile.id }).save();
  done(null, newUser);
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});
