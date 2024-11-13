const express = require('express');
const authController = require('./controllers/auth-controllers');
const subredditController = require('./controllers/subreddit-controllers');
const subscriptionController = require('./controllers/subscription-controllers');
const postController = require('./controllers/post-controller');
const voteController = require('./controllers/vote-controller');

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

app.post('/api/subreddits/', authenticateToken, subredditController.createSubreddit);
app.put('/api/subreddits/:id', authenticateToken, subredditController.editSubreddit);
app.delete('/api/subreddits/:id', authenticateToken, subredditController.deleteSubreddit);
app.get('/api/subreddits/', subredditController.getAllSubreddits);
app.get('/api/subreddits/:id', subredditController.getSubredditById);

app.post('/api/subscriptions', authenticateToken, subscriptionController.subscribe);
app.delete('/api/subscriptions/:subredditId', authenticateToken, subscriptionController.unsubscribe);
app.get('/api/subscriptions', authenticateToken, subscriptionController.getUserSubscriptions);

app.post('/api/posts', authenticateToken, postController.createPost);
app.put('/api/posts/:id', authenticateToken, postController.updatePost);
app.delete('/api/posts/:id', authenticateToken, postController.deletePost);
app.get('/api/posts/me', authenticateToken, postController.getCurrentUserPosts);
app.get('/api/posts/user/:username', postController.getPostsByUsername);
app.get('/api/posts/votes/me', authenticateToken, postController.getVotedPosts);

app.post('/api/posts/:postId/vote', authenticateToken, voteController.votePost);
app.get('/api/posts/:postId/votes', voteController.getPostVotes);


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});