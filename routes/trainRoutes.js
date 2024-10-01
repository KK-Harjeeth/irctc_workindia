const express = require('express');
const { getAvailableTrains, bookSeat } = require('../controllers/trainController');
const auth = require('../middlewares/auth');  // Middleware to protect routes with JWT
const router = express.Router();

// Route to get available trains based on source and destination
router.get('/', getAvailableTrains);

// Route to book a seat (protected route, requires login)
router.post('/book', auth, bookSeat);

module.exports = router;
