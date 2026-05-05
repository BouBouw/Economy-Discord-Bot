const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'discord-activity-dev-secret';

/**
 * Middleware: verify JWT Bearer token.
 * Attaches req.userId and req.discordAccessToken on success.
 */
function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.slice(7);
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.userId = payload.userId;
        req.discordAccessToken = payload.accessToken;
        next();
    } catch {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

module.exports = requireAuth;
