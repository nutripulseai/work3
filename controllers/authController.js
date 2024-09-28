const bcrypt = require('bcryptjs'); // Make sure you use bcryptjs for consistency
const connectDB = require('../config/db'); // Make sure this is properly set up

// Function to register a new user
async function registerUser(username, password) {
  try {
    const db = await connectDB();
    const users = db.collection('users');
    
    // Check if the user already exists
    const existingUser = await users.findOne({ username });
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into the database
    await users.insertOne({ username, password: hashedPassword });
  } catch (err) {
    throw new Error(`Registration failed: ${err.message}`);
  }
}

// Function to log in a user
async function loginUser(username, password) {
  try {
    const db = await connectDB();
    const users = db.collection('users');
    
    // Find the user by username
    const user = await users.findOne({ username });
    if (user && await bcrypt.compare(password, user.password)) {
      return user; // Return user if credentials are correct
    }
    return null; // Return null if credentials are incorrect
  } catch (err) {
    throw new Error(`Login failed: ${err.message}`);
  }
}

module.exports = { registerUser, loginUser };
