const express = require('express');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const User = require('../models/User'); // Updated path to User model
const router = express.Router();

// GET Register route - Render the registration form
router.get('/register', (req, res) => {
    res.render('register'); // Render the register.ejs view
});

// GET Login route - Render the login form
router.get('/login', (req, res) => {
    res.render('login'); // Render the login.ejs view
});

// POST Register route - Handle registration logic
router.post('/register', async (req, res) => {
    const { email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            req.flash('error', 'Email is already in use');
            return res.redirect('/auth/register'); // Redirect to registration page with flash message
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ email, password: hashedPassword });
        await newUser.save();

        req.flash('success', 'Registration successful! Please log in.');
        res.redirect('/auth/login'); // Redirect to login page after successful registration
    } catch (err) {
        console.error('Error registering user:', err);
        req.flash('error', 'An error occurred during registration. Please try again.');
        res.redirect('/auth/register'); // Redirect to registration page with error message
    }
});

// POST Login route - Handle login logic
router.post('/login', passport.authenticate('local', {
    successRedirect: '/', // Redirect to home page upon successful login
    failureRedirect: '/auth/login', // Redirect back to login page with error message
    failureFlash: true // Enable flash messages for errors
}));

// Google OAuth route
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth callback
router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/auth/login' }),
    async (req, res) => {
        // Ensure user session is saved after successful Google login
        try {
            req.session.user = req.user;  // Store user info in session after successful Google login
            res.redirect('/');  // Redirect to home page after Google login
        } catch (err) {
            console.error('Error during Google login:', err);
            req.flash('error', 'Failed to login with Google.');
            res.redirect('/auth/login');
        }
    }
);

// Logout route
router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error('Error during logout:', err);
            req.flash('error', 'Logout failed. Please try again.');
            return res.redirect('/profile'); // Redirect to profile page if logout fails
        }
        req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying session:', err);
                req.flash('error', 'Session destruction failed. Please try again.');
                return res.redirect('/profile');
            }
            res.redirect('/');  // Redirect to home page after successful logout
        });
    });
});

module.exports = router;
