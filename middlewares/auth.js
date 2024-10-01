const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // Get the Authorization header
    const token = req.headers['authorization'];

    // Log the received token for debugging
    console.log('Received token:', token);

    if (!token) {
        console.error('No token provided');
        return res.status(403).send('No token provided');
    }

    // Extract the token after 'Bearer '
    const bearerToken = token.startsWith('Bearer ') ? token.split(' ')[1] : token;

    // Verify the token
    jwt.verify(bearerToken, process.env.SECRET_KEY, (err, decoded) => {
        if (err) {
            console.error('Token verification error:', err); // Log verification error
            return res.status(401).send('Unauthorized: Invalid token');
        }

        req.userId = decoded.id; // Attach user ID to the request
        next(); // Proceed to the next middleware or route handler
    });
};
