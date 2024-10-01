const express = require('express');
const { addTrain } = require('../controllers/trainController');
const apiKeyAuth = require('../middlewares/apiKeyAuth');
const router = express.Router();

router.post('/addTrain', apiKeyAuth, addTrain);  // Admin-only route

module.exports = router;
