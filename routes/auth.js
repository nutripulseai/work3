const express = require('express');
const passport = require('passport');
const { loginUser, registerUser } = require('../controllers/authController'); // Assuming these controller functions handle authentication logic
const router = express.Router();

// Register route
router.post('/register', async (req, res) => {
    const { email, password } = req.body;
    try {
        // Use the registerUser function to register a new user
        await registerUser(email, password);
        req.flash('success', 'Registration successful. Please log in.');
        res.redirect('/login');  // Redirect to login after successful registration
    } catch (err) {
        console.error('Error registering user:', err);
        req.flash('error', 'Registration failed. Please try again.');
        res.status(500).render('register', { error: 'Registration failed' });  // Render registration page with error message
    }
});

// Login route
router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true // Enable flash messages for errors
}));

// Google OAuth route
router.get('/google', 
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google OAuth callback
router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        try {
            // Store user info in session after successful Google login
            req.session.user = req.user;
            req.flash('success', 'Successfully logged in with Google');
            res.redirect('/');  // Redirect to home page after Google login
        } catch (err) {
            console.error('Error during Google OAuth callback:', err);
            req.flash('error', 'Google OAuth login failed. Please try again.');
            res.status(500).render('login', { error: 'OAuth login failed' });  // Render login page with error message
        }
    }
);

// Logout route
router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error('Error during logout:', err);
            req.flash('error', 'Logout failed. Please try again.');
            return res.status(500).render('profile', { error: 'Logout failed' });
        }
        req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying session:', err);
                req.flash('error', 'Session destruction failed. Please try again.');
                return res.status(500).render('profile', { error: 'Session destruction failed' });
            }
            req.flash('success', 'Successfully logged out.');
            res.redirect('/');  // Redirect to home page after logout
        });
    });
});

module.exports = router;
