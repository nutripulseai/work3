const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcryptjs');
const flash = require('connect-flash');
const paypal = require('@paypal/checkout-server-sdk');
const authRoutes = require('./routes/authRoutes');
const groupRoutes = require('./routes/groupRoutes');
const chatRoutes = require('./routes/chatRoutes');
const User = require('./models/User');
const checkSubscription = require('./middleware/checkSubscription');



 // Ensure you have this to load environment variables



// Load environment variables
require('dotenv').config();

// Create an instance of Express
const app = express();
const port = 3456; // Port number

// Middleware setup
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'homeworkout')));
app.use('/ai-fitness-app', express.static(path.join(__dirname, 'ai-fitness-app', 'public')));
app.use('/nutrition-menu-builder', express.static(path.join(__dirname, 'nutrition-menu-builder', 'public')));

// View engine setup
// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use('/audio', express.static(path.join(__dirname, 'views/audio')));

app.use('/Traininggif', express.static(path.join(__dirname, 'views/Traininggif')));

app.use('/gypplanimg', express.static(path.join(__dirname, 'views/gypplanimg')));
// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'default-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' }
}));

app.use(express.json());
// Flash messages
app.use(flash());

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy({
    usernameField: 'email',
}, async (email, password, done) => {
    try {
        const user = await User.findOne({ email });
        if (!user) return done(null, false, { message: 'No user found with that email' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return done(null, false, { message: 'Incorrect password' });

        return done(null, user);
    } catch (err) {
        return done(err);
    }
}));

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback",
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const existingUser = await User.findOne({ googleId: profile.id });
        if (existingUser) {
            return done(null, existingUser);
        }

        const newUser = new User({
            googleId: profile.id,
            email: profile.emails[0].value,
            profilePicture: profile._json.picture,
            subscriptionStatus: 'free',
        });

        await newUser.save();
        done(null, newUser);
    } catch (err) {
        done(err);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});



function client() {
    if (process.env.PAYPAL_MODE === 'live') {
        return new paypal.core.PayPalHttpClient(new paypal.core.LiveEnvironment(
            process.env.PAYPAL_CLIENT_ID,
            process.env.PAYPAL_CLIENT_SECRET
        ));
    } else {
        return new paypal.core.PayPalHttpClient(new paypal.core.SandboxEnvironment(
            process.env.PAYPAL_CLIENT_ID,
            process.env.PAYPAL_CLIENT_SECRET
        ));
    }
}

// Middleware to ensure the user is authenticated
// Middleware to ensure user is authenticated before accessing protected routes
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next(); // User is authenticated, proceed to the next middleware or route handler
    }
    req.flash('error_msg', 'Please log in to access this resource'); // Flash a message if not authenticated
    res.redirect('/auth/login'); // Redirect to login if not authenticated
}

// Flash messages middleware to pass flash messages and user details to views
app.use((req, res, next) => {
    // Pass flash messages to the response local variables, accessible in templates
    res.locals.flashMessages = req.flash();
    // Make the user object globally available in views
    res.locals.user = req.user || null; // req.user is set by the passport authentication
    next();
});

// PayPal configuration: creates a PayPal client for handling API requests


// Function to define the PayPal environment (sandbox or live based on credentials)
function environment() {
    return new paypal.core.SandboxEnvironment(
        process.env.PAYPAL_CLIENT_ID,   // Your PayPal Client ID (must be set in your environment variables)
        process.env.PAYPAL_CLIENT_SECRET // Your PayPal Client Secret (must be set in your environment variables)
    );
}



// Middleware to check if the user has an active subscription
function checkActiveSubscription(req, res, next) {
    if (req.user && req.user.subscriptionStatus === 'active') {
      next(); // Allow access if the subscription is active
    } else {
      res.redirect('/subscription-required'); // Redirect to subscription-required page if not active
    }
  }
  
  // Protect the /homeworkBurn200 route
  app.get('/homeworkBurn200', checkActiveSubscription, (req, res) => {
    // Serve the workout page only if the user has an active subscription
    res.sendFile(__dirname + '/public/homeworkout/Burn200.html');
  });
  


// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error:", err));

// Endpoint to check if a user has an active subscription
app.get('/check-subscription', async (req, res) => {
    const email = req.query.email; // Assume email is passed as a query parameter

    // Check if the email parameter is provided
    if (!email) {
        return res.status(400).json({ message: 'Email is required.' });
    }

    try {
        // Find the user by email
        const user = await User.findOne({ email });

        // Handle the case where the user is not found
        if (!user) {
            return res.status(404).json({ active: false, message: 'User not found.' });
        }

        // Check the subscription status
        const now = new Date();
        const expirationDate = new Date(user.subscriptionDetails?.expirationDate);

        // Determine subscription status based on the expiration date
        if (user.subscriptionStatus === 'active' && expirationDate > now) {
            return res.json({ active: true });
        } else {
            return res.json({ active: false, message: 'Subscription is not active.' });
        }
    } catch (err) {
        // Log the error for debugging
        console.error('Error checking subscription:', err.message);

        // Return a server error response
        return res.status(500).json({ message: 'Internal server error. Please try again later.' });
    }
});




// Route for capturing PayPal payment
app.post('/capture-order', async (req, res) => {
    const { orderId, email } = req.body;
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    try {
        const capture = await client().execute(request);

        // Notify the User Management Server about the subscription update
        await axios.post('http://localhost:3456/update-subscription', {
            email,
            subscriptionDetails: capture.result
        });

        res.json(capture.result);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error capturing order');
    }
});

// Route for handling OpenAI chat completions
app.post('/ask', async (req, res) => {
    const userMessage = req.body.message;

    // Validate input
    if (!userMessage || typeof userMessage !== 'string') {
        return res.status(400).send('Invalid message');
    }

    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: userMessage }],
            max_tokens: 1500
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        res.json({ reply: response.data.choices[0].message.content });
    } catch (error) {
        console.error('Error communicating with OpenAI:', error.message);
        res.status(500).send('Error communicating with OpenAI');
    }
});

app.post('/create-order', async (req, res) => {
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');

    // Assuming subscription price is fixed; replace with dynamic values if needed
    const amount = '9.90'; // Replace with dynamic amount if necessary

    request.requestBody({
        intent: 'CAPTURE',
        purchase_units: [{
            amount: {
                currency_code: 'USD',
                value: amount
            }
        }]
    });

    try {
        const order = await client().execute(request);
        res.status(200).json({ id: order.result.id });
    } catch (err) {
        console.error('Error creating PayPal order:', err.response ? err.response.data : err.message);
        res.status(500).json({ message: 'Error creating PayPal order', error: err.message });
    }
});

// Route to capture a PayPal order after payment confirmation
app.post('/capture-order', async (req, res) => {
    const { orderId, email } = req.body;

    // Basic validation to check if the necessary fields are present
    if (!orderId || !email) {
        return res.status(400).json({ message: 'Order ID and email are required.' });
    }

    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({}); // Required empty body for PayPal order capture

    try {
        // Capture the payment through PayPal
        const capture = await client().execute(request);

        // Assuming a 1-year subscription from the current date
        const subscriptionDetails = {
            expirationDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
            orderId: orderId,
            status: capture.result.status
        };

        // Log capture success for debugging
        console.log('Payment capture successful:', capture.result);

        // Notify the User Management Server to update subscription in MongoDB
        try {
            const updateResponse = await axios.post('http://localhost:3456/update-subscription', {
                email,
                subscriptionDetails
            });
            console.log('Subscription updated:', updateResponse.data);

            // Send the capture result back to the client
            res.status(200).json(capture.result);
        } catch (subscriptionUpdateErr) {
            console.error('Error updating subscription:', subscriptionUpdateErr.message);
            // Rollback logic can be implemented here if necessary
            res.status(500).json({ 
                message: 'Payment was captured but failed to update subscription',
                error: subscriptionUpdateErr.message 
            });
        }
    } catch (err) {
        console.error('Error capturing PayPal payment:', err.response ? err.response.data : err.message);
        res.status(500).json({ 
            message: 'Error capturing PayPal payment', 
            error: err.message 
        });
    }
});




// Routes for authentication, groups, and chat
app.use('/auth', authRoutes);
app.use('/groups', groupRoutes);
app.use('/chat', chatRoutes);

// Home route
// Home route


app.get('/purchase-subscription', (req, res) => {
    res.render('purchase-subscription'); // Renders purchase-subscription.ejs
});


// Route for the home page
app.get('/', (req, res) => {
    res.render('house', { user: req.user });
});

// Menu Builder route
// Route for the menu builder - Only accessible to logged-in users
app.get('/menu-builder', ensureAuthenticated, (req, res) => {
    try {
        // Render the menu builder page with user data
        res.render('menubuilder', {
            user: req.user,  // Pass the authenticated user data to the view
        });
    } catch (err) {
        console.error('Error loading menu builder page:', err.message);
        res.status(500).send('Internal Server Error');
    }
});


// Profile route - Only accessible to logged-in users
app.get('/profile', ensureAuthenticated, (req, res) => {
    res.render('profile', { user: req.user });
});

// Burn Calories route
// Correct filename should be without spaces or special characters
// Verify the filename and path
app.get('/burncalories', (req, res) => {
    res.render('Burncalories', { user: req.user });
});

// Update this route if it exists
app.get('/ai-fitness-app/gptaifitness', (req, res) => {
    res.render('gptaifitness'); // Render the EJS template
});


app.get('/plan', (req, res) => {
    res.render('plan', { subscriptionStatus: 'free' });  // Hardcoded status for testing
});


// Homeworkout route
app.get('/homeworkout/work', (req, res) => {
    res.render('work', { user: req.user });
});

// Serve static HTML files directly from the homeworkout folder
app.get('/homeworkout/*', (req, res) => {
    const filePath = path.join(__dirname, 'homeworkout', req.params[0]);
    res.sendFile(filePath, err => {
        if (err) {
            console.error(`File not found: ${filePath}`);
            res.status(404).render('404', { user: req.user });
        }
    });
});


app.get('/profile', ensureAuthenticated, (req, res) => {
    res.render('profile', { user: req.user });
});

// Burn Calories route

// GPT AI Fitness App route
app.get('/ai-fitness-app/gptaifitness', (req, res) => {
    res.render('gptaifitness'); // Render the EJS template
});

// Subscription plan route

// Homeworkout route


// Other informational pages
app.get('/some-route', (req, res) => {
    res.render('footer/PrivacyPolicy'); // This will render views/footer/PrivacyPolicy.ejs
});

app.get('/PrivacyPolicy', (req, res) => {
    res.render('PrivacyPolicy'); // Assuming you have a PrivacyPolicy.ejs file
});

app.get('/CookiesNotice', (req, res) => {
    res.render('CookiesNotice'); // Assuming you have a CookiesNotice.ejs file
});

app.get('/Disclaimer', (req, res) => {
    res.render('Disclaimer'); // Assuming you have a Disclaimer.ejs file
});

app.get('/RefundPolicy', (req, res) => {
    res.render('RefundPolicy'); // Assuming you have a RefundPolicy.ejs file
});

app.get('/SubscriptionTerms', (req, res) => {
    res.render('SubscriptionTerms'); // Assuming you have a SubscriptionTerms.ejs file
});

app.get('/TermsofService', (req, res) => {
    res.render('TermsofService'); // Assuming you have a TermsofService.ejs file
});

app.get('/aboutus', (req, res) => {
    res.render('aboutus'); // Assuming you have an aboutus.ejs file
});

app.get('/homeworkBurn1000', (req, res) => {
    res.render('homeworkBurn1000'); // Ensure this matches the new view name
});

app.get('/homeworkBurn900', (req, res) => {
    res.render('homeworkBurn900'); // Ensure this matches the new view name
});

app.get('/homeworkBurn800', (req, res) => {
    res.render('homeworkBurn800'); // Ensure this matches the new view name
});

app.get('/homeworkBurn700', (req, res) => {
    res.render('homeworkBurn700'); // Ensure this matches the new view name
});

app.get('/homeworkBurn600', (req, res) => {
    res.render('homeworkBurn600'); // Ensure this matches the new view name
});

app.get('/homeworkBurn500', (req, res) => {
    res.render('homeworkBurn500'); // Ensure this matches the new view name
});

app.get('/homeworkBurn400', (req, res) => {
    res.render('homeworkBurn400'); // Ensure this matches the new view name
});

app.get('/homeworkBurn300', (req, res) => {
    res.render('homeworkBurn300'); // Ensure this matches the new view name
});

app.get('/homeworkBurn200', (req, res) => {
    res.render('homeworkBurn200'); // Ensure this matches the new view name
});
  
// Protect the /homeworkBurn200 route
app.get('/homeworkBurn200', checkActiveSubscription, (req, res) => {
    res.sendFile(__dirname + '/public/homeworkout/Burn200.html'); // Or render the appropriate EJS/HTML file
  });
  
  
// Serve static files from ai-fitness-app/public directory
app.get('/ai-fitness-app/*', (req, res) => {
    const filePath = path.join(__dirname, 'ai-fitness-app', 'public', req.params[0]);
    res.sendFile(filePath, err => {
        if (err) {
            console.error(`File not found: ${filePath}`);
            res.status(404).render('404', { user: req.user });
        }
    });
});

app.get('/plan', async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            throw new Error('User not logged in or session expired');
        }

        const user = await User.findById(req.user.id);

        if (!user) {
            throw new Error('User not found');
        }

        res.render('plan', {
            subscriptionStatus: user.subscriptionStatus // Pass subscription status to the front-end
        });
    } catch (err) {
        console.error('Error fetching plan data:', err);  // Log full error
        res.status(500).send('Something went wrong!');  // User-friendly error message
    }
});




// Add this to your `app.js` file
app.get('/profile', ensureAuthenticated, checkSubscription, async (req, res) => {
    try {
        // Your existing code for handling profile route
        const user = await User.findOne({ email: req.user.email });
        if (!user) {
            return res.status(404).send('User not found');
        }
        // Update subscription status and render profile
        let subscriptionStatus = 'free';
        if (user.subscriptionDetails && user.subscriptionDetails.expirationDate) {
            const now = new Date();
            const expirationDate = new Date(user.subscriptionDetails.expirationDate);
            if (expirationDate > now) {
                subscriptionStatus = 'active';
            } else {
                subscriptionStatus = 'expired';
            }
        }
        user.subscriptionStatus = subscriptionStatus;
        await user.save();
        res.render('profile', { user });
    } catch (err) {
        console.error('Error retrieving profile:', err.message);
        res.status(500).send('An error occurred while retrieving your profile. Please try again later.');
    }
});

// Apply checkSubscription middleware to the /menu-builder route
app.get('/menu-builder', ensureAuthenticated, checkSubscription, (req, res) => {
    try {
        res.render('menubuilder', { user: req.user });
    } catch (err) {
        console.error('Error loading menu builder page:', err.message);
        res.status(500).send('Internal Server Error');
    }
});




// Endpoint for updating subscription from ai-fitness-app server
app.post('/update-subscription', async (req, res) => {
    const { email, subscriptionDetails } = req.body;

    // Basic validation: Ensure email and subscription details are provided
    if (!email || !subscriptionDetails || !subscriptionDetails.expirationDate) {
        return res.status(400).json({
            message: 'Email, subscription details, and expiration date are required.'
        });
    }

    try {
        // Find the user by email in the database
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Validate and parse the expiration date to ensure it's a valid date
        const expirationDate = new Date(subscriptionDetails.expirationDate);
        if (isNaN(expirationDate.getTime())) {
            return res.status(400).json({ message: 'Invalid expiration date format.' });
        }

        // Update user's subscription details (plan, expiration date, etc.)
        user.subscriptionDetails = subscriptionDetails;

        // Compare the current date with the expiration date
        const now = new Date();
        if (expirationDate > now) {
            user.subscriptionStatus = 'active';  // Subscription is active
        } else {
            user.subscriptionStatus = 'expired';  // Subscription has expired
        }

        // Save the updated user information to the MongoDB database
        await user.save();

        // Log subscription update for debugging or audit purposes (optional)
        console.log(`User ${email}'s subscription updated to ${user.subscriptionStatus}. Expiration: ${expirationDate}`);

        // Respond to the client with updated subscription status and expiration date
        res.status(200).json({
            message: 'Subscription updated successfully.',
            subscriptionStatus: user.subscriptionStatus,
            expirationDate: expirationDate.toISOString()
        });

    } catch (err) {
        // Handle and log any errors that occur during the process
        console.error('Error updating subscription:', err.message);
        res.status(500).json({ message: 'Internal server error. Please try again later.' });
    }
});





app.get('/purchase-subscription', ensureAuthenticated, (req, res) => {
    try {
        // Render a subscription purchase page (you can create a new EJS file for this)
        res.render('purchase-subscription', {
            user: req.user,  // Pass the user data to the view
        });
    } catch (err) {
        console.error('Error loading purchase subscription page:', err.message);
        res.status(500).send('Internal Server Error');
    }
});
// Catch-all route for 404 errors
app.use((req, res, next) => {
    console.log(`404 Not Found - ${req.method} ${req.originalUrl}`);
    res.status(404).render('404');
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

// Start server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
