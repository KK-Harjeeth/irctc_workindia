const connection = require('../db');

// Admin: Add a new train
exports.addTrain = (req, res) => {
    const { train_name, source, destination, seats } = req.body;

    // Check for missing fields
    if (!train_name || !source || !destination || !seats) {
        return res.status(400).send('Please provide train_name, source, destination, and seats');
    }

    const query = `INSERT INTO trains (train_name, source, destination, seats) VALUES (?, ?, ?, ?)`;

    connection.query(query, [train_name, source, destination, seats], (err, results) => {
        if (err) {
            console.error('Error adding train:', err);
            return res.status(500).send('Error adding train');
        }
        res.status(201).send({ message: 'Train added successfully' });
    });
};

// User: Book a seat on a specific train
exports.bookSeat = (req, res) => {
    const { train_id } = req.body;

    // Check for missing fields
    if (!train_id) {
        return res.status(400).send('Please provide a valid train_id');
    }

    connection.beginTransaction((err) => {
        if (err) {
            console.error('Error starting transaction:', err);
            return res.status(500).send('Transaction error');
        }

        // Check seat availability with a row lock for concurrency
        const checkSeatsQuery = `SELECT seats FROM trains WHERE id = ? FOR UPDATE`;

        connection.query(checkSeatsQuery, [train_id], (err, results) => {
            if (err || results.length === 0) {
                return connection.rollback(() => res.status(404).send('Train not found'));
            }

            const seatsAvailable = results[0].seats;

            if (seatsAvailable > 0) {
                // Decrement the seat count
                const updateSeatsQuery = `UPDATE trains SET seats = seats - 1 WHERE id = ?`;

                connection.query(updateSeatsQuery, [train_id], (err, results) => {
                    if (err) {
                        return connection.rollback(() => {
                            console.error('Error updating seats:', err);
                            res.status(500).send('Error booking seat');
                        });
                    }

                    // Commit the transaction after updating seats
                    connection.commit((err) => {
                        if (err) {
                            return connection.rollback(() => {
                                console.error('Error committing transaction:', err);
                                res.status(500).send('Error committing transaction');
                            });
                        }
                        res.status(200).send('Seat booked successfully');
                    });
                });
            } else {
                // If no seats are available, rollback the transaction
                connection.rollback(() => res.status(400).send('No seats available'));
            }
        });
    });
};

// User: Get available trains based on source and destination
exports.getAvailableTrains = (req, res) => {
    const { source, destination } = req.query;

    // Check for missing fields
    if (!source || !destination) {
        return res.status(400).send('Please provide both source and destination');
    }

    const query = `SELECT * FROM trains WHERE source = ? AND destination = ?`;

    connection.query(query, [source, destination], (err, results) => {
        if (err) {
            console.error('Error fetching trains:', err);
            return res.status(500).send('Error fetching trains');
        }

        if (results.length === 0) {
            return res.status(404).send('No trains found');
        }

        res.status(200).send(results);
    });
};
