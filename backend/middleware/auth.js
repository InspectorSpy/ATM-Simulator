// Middleware for auth

const jwt = require('jsonwebtoken');

// Middleware to auth token
function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization; // Bearer token
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });

    const [scheme, token] = authHeader.split(' ');
    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({ error: 'Malformed Authorization header' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
        return res.status(500).json({ error: 'JWT secret not configured' });
    }

    try {
        const payload = jwt.verify(token, secret);
        req.user = payload;
        return next();
    } catch (err) {
        return res.status(401).json({ error: 'invalid token' });
    }
}

module.exports = { authenticateToken };