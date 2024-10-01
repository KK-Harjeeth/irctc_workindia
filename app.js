const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');
const trainRoutes = require('./routes/trainRoutes');
const adminRoutes = require('./routes/adminRoutes');

dotenv.config();

const app = express();
app.use(bodyParser.json());

// Routes
app.use('/api/users', userRoutes); // User routes for register, login, booking
app.use('/api/trains', trainRoutes); // Routes for train-related actions
app.use('/api/admin', adminRoutes);  // Admin routes

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
