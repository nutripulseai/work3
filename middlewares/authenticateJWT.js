// middleware/authenticateJWT.js
const jwt = require('jsonwebtoken');

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1]; // Get the token from "Bearer <token>"

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).send('Invalid token');
      }
      req.user = user; // Attach decoded user information to the request
      next(); // Proceed to next middleware
    });
  } else {
    return res.status(401).send('Authentication token missing');
  }
};

module.exports = authenticateJWT;
