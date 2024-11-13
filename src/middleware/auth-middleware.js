const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma').prisma

exports.authenticateToken = async (req, res, next) => {
    try {
        let token;
        
        // Check Authorization header first
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        } 
        // If no header, check cookies
        else if (req.headers.cookie) {
            const cookies = req.headers.cookie.split(';');
            const authCookie = cookies.find(cookie => cookie.trim().startsWith('Authorization='));
            if (authCookie) {
                const cookieValue = decodeURIComponent(authCookie.trim().split('=')[1]);
                if (cookieValue.startsWith('Bearer ')) {
                    token = cookieValue.split(' ')[1];
                }
            }
        }

        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'Authentication required' 
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user from database
        const user = await prisma.user.findUnique({
            where: { id: decoded.id }
        });

        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        // Attach user to request object
        req.user = {
            id: user.id,
            email: user.email,
            emailVerified: user.emailVerified
        };

        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid token' 
            });
        }
        
        console.error('Authentication error:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Error authenticating user' 
        });
    }
};