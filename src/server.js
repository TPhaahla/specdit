const express = require('express');
const authController = require('./controllers/auth-controllers');
const { authenticateToken } = require('./middleware/auth-middleware');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', ({res}) => {
	res.json({ message: 'Hello from Specdit API. A simple mock of the Reddit API' });
});

app.post('/api/auth/login', authController.login);
app.post('/api/auth/logout', authController.logout);
app.post('/api/auth/register', authController.register);
app.patch('/api/auth/change-password', authenticateToken, authController.changePassword);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});