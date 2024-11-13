const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma').prisma


// Helper function to generate JWT token
exports.generateToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            email: user.email
        },
        process.env.JWT_SECRET,
        {
            expiresIn: '24h'
        }
    );
};

