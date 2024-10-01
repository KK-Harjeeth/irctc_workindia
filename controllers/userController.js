const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const connection = require('../db'); // Ensure the path to your database connection is correct

// Register a new user
exports.registerUser = (req, res) => {
    const { username, email, password } = req.body;

    // Check for missing fields
    if (!username || !email || !password) {
        return res.status(400).send('Please provide username, email, and password');
    }

    // Hash the password
    const hashedPassword = bcrypt.hashSync(password, 8);
    const query = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;

    connection.query(query, [username, email, hashedPassword], (err, results) => {
        if (err) return res.status(500).send('Error registering user');
        res.status(201).send({ message: 'User registered successfully' });
    });
};

// Login a user
exports.loginUser = (req, res) => {
    const { email, password } = req.body;
    const query = `SELECT * FROM users WHERE email = ?`;

    connection.query(query, [email], (err, results) => {
        if (err || results.length === 0) {
            return res.status(404).send('User not found');
        }

        const user = results[0];
        const validPassword = bcrypt.compareSync(password, user.password);
        if (!validPassword) return res.status(401).send('Invalid password');

        // Generate token
        const token = jwt.sign({ id: user.id }, process.env.SECRET_KEY, {
            expiresIn: '1h',
        });

        console.log('Generated token:', token); // Log the generated token for debugging
        res.status(200).send({ token });
    });
};

// Book a seat
exports.bookSeat = (req, res) => {
    const { train_id } = req.body;
    const userId = req.userId; // Get user ID from the request object

    console.log('User ID from token:', userId); // Log the user ID
    console.log('Attempting to book seat for train ID:', train_id); // Log the train ID

    // Start transaction
    connection.beginTransaction((err) => {
        if (err) return res.status(500).send('Transaction error');

        // Check available seats
        const checkSeatsQuery = `SELECT seats FROM trains WHERE id = ? FOR UPDATE`;
        connection.query(checkSeatsQuery, [train_id], (err, results) => {
            if (err || results.length === 0) {
                return connection.rollback(() => res.status(404).send('Train not found'));
            }

            const seatsAvailable = results[0].seats;
            console.log('Seats available:', seatsAvailable); // Log available seats

            if (seatsAvailable > 0) {
                // Update seats
                const updateSeatsQuery = `UPDATE trains SET seats = seats - 1 WHERE id = ?`;
                connection.query(updateSeatsQuery, [train_id], (err) => {
                    if (err) {
                        return connection.rollback(() => res.status(500).send('Error updating seats'));
                    }

                    // Insert booking record into the bookings table
                    const insertBookingQuery = `INSERT INTO bookings (user_id, train_id) VALUES (?, ?)`;
                    connection.query(insertBookingQuery, [userId, train_id], (err) => {
                        if (err) {
                            console.error('Error creating booking record:', err); // Log error if insertion fails
                            return connection.rollback(() => res.status(500).send('Error creating booking record'));
                        }

                        // Commit transaction
                        connection.commit((err) => {
                            if (err) {
                                return connection.rollback(() => res.status(500).send('Commit error'));
                            }
                            res.status(200).send('Seat booked successfully');
                        });
                    });
                });
            } else {
                connection.rollback(() => res.status(400).send('No seats available'));
            }
        });
    });
};

// Get bookings for the logged-in user
exports.getBookings = (req, res) => {
    const userId = req.userId; // Get user ID from the request object

    console.log('User ID:', userId); // Log user ID for debugging
    const query = `SELECT * FROM bookings WHERE user_id = ?`;

    connection.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Database query error:', err); // Log any SQL errors
            return res.status(500).send('Error fetching bookings');
        }

        // Log results to check if any bookings were found
        console.log('Booking results:', results);
        if (results.length === 0) {
            return res.status(404).send('No bookings found for this user');
        }

        res.status(200).send({ bookings: results });
    });
};
