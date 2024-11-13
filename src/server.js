const express = require('express');
const { randomUUID } = require('crypto');
const bcrypt = require('bcryptjs');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', ({res}) => {
	res.json({ message: 'Hello from Specdit API. A simple mock of the Reddit API' });
});

const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
// const prisma = require('../lib/prisma').prisma


// Helper function to generate JWT token
const generateToken = (user) => {
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

const authenticateToken = async (req, res, next) => {
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

app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);


        // Create new user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                emailVerified: null,
                username: randomUUID(),
                hashedPassword
            }
        });

        // Create account
        await prisma.account.create({
            data: {
                userId: user.id,
                type: 'credentials',
                provider: 'credentials',
                providerAccountId: user.id,
            }
        });

        const token = generateToken(user);
        res.status(201).cookie('Authorization', 'Bearer ' + token, {
            expires: new Date(Date.now() + 8 * 3600000),
            httpOnly: true,
            secure: true,
        }).json({ user, token });

    }
    catch (error) {
        res.status(500).json({ error: JSON.stringify(error) });
        }
});

app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
  
      if (!email || !password) {
        return res.status(400).json({ 
          error: 'Email and password are required' 
        });
      }
  
      const user = await prisma.user.findUnique({
        where: { email }
      });
      if (!user) {
        return res.status(401).json({ 
          error: 'Invalid credentials' 
        });
      }
  
      const validPassword = await bcrypt.compare(
        password,
        user.hashedPassword
      );
  
      if (!validPassword) {
        return res.status(401).json({ 
          error: 'Invalid credentials' 
        });
      }

      const token = generateToken(user);
   
      res.status(200).cookie('Authorization', 'Bearer ' + token, {
        expires: new Date(Date.now() + 8 * 3600000),
        httpOnly: true,
        secure: true,
    }).json({
        message: 'Login successful',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          token: token
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ 
        error: 'Error during login' 
      });
    }
  });

app.post('/api/auth/logout', async (req, res)=>{
    return res
    .clearCookie('Authorization')
    .status(200)
    .json({ success: true, message: 'logged out successfully' });
});

app.patch('/api/auth/change-password', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id; // Get authenticated user's ID
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ 
                success: false, 
                message: 'Old password and new password are required' 
            });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        const validPassword = await bcrypt.compare(oldPassword, user.hashedPassword);
        if (!validPassword) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid credentials' 
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        await prisma.user.update({
            where: { id: userId },
            data: { hashedPassword }
        });

        return res.status(200).json({ 
            success: true, 
            message: 'Password updated successfully' 
        });
    } catch (error) {
        console.error('Change password error:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Error updating password' 
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
