const rateLimit = require('express-rate-limit');

// Default limiter for general endpoints
const defaultLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Stricter limiter for auth endpoints
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Limit each IP to 5 requests per windowMs
    message: {
        success: false,
        message: 'Too many authentication attempts, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Limiter for voting endpoints
const voteLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // Limit each IP to 10 votes per minute
    message: {
        success: false,
        message: 'Too many vote attempts, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Limiter for post/comment creation
const contentLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 30, // Limit each IP to 30 posts/comments per hour
    message: {
        success: false,
        message: 'You have reached the content creation limit, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    defaultLimiter,
    authLimiter,
    voteLimiter,
    contentLimiter
}; 