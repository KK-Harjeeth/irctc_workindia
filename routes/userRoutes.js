const express = require('express');
const { registerUser, loginUser, getBookings } = require('../controllers/userController');
const auth = require('../middlewares/auth'); // Ensure you're using the auth middleware
const router = express.Router();

// Route to register a user
router.post('/register', registerUser);

// Route to login a user
router.post('/login', loginUser);

// Route to get user bookings (protected)
router.get('/bookings', auth, getBookings); // Make sure auth middleware is applied

module.exports = router;
