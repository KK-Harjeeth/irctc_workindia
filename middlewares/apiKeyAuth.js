module.exports = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (apiKey && apiKey === process.env.ADMIN_API_KEY) {
        return next();
    }
    return res.status(403).send('Forbidden: Invalid API key');
};

