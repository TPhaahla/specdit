const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const utils = require('../lib/utils')
const prisma = require('../lib/prisma').prisma
const { randomUUID } = require('crypto');



exports.register = async (req, res) => {
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

        const token = utils.generateToken(user);
        res.status(201).cookie('Authorization', 'Bearer ' + token, {
            expires: new Date(Date.now() + 8 * 3600000),
            httpOnly: true,
            secure: true,
        }).json({ user, token });

    }
    catch (error) {
        res.status(500).json({ error: JSON.stringify(error) });
        }
};

exports.login = async (req, res) => {
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

      const token = utils.generateToken(user);
   
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
  };

exports.logout = async (req, res)=>{
    return res
    .clearCookie('Authorization')
    .status(200)
    .json({ success: true, message: 'logged out successfully' });
}

exports.changePassword = async (req, res) => {
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
};