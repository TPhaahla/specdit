const express = require('express');
const authController = require('./controllers/auth-controllers');
const subredditController = require('./controllers/subreddit-controllers');
const subscriptionController = require('./controllers/subscription-controllers');
const postController = require('./controllers/post-controller');
const voteController = require('./controllers/vote-controller');
const commentController = require('./controllers/comment-controllers');

const { authenticateToken } = require('./middleware/auth-middleware');
const { 
    defaultLimiter, 
    authLimiter, 
    voteLimiter, 
    contentLimiter 
} = require('./middleware/rate-limit');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply default rate limiter to all routes
app.use(defaultLimiter);

app.get('/', ({res}) => {
	res.json({ message: 'Hello from Specdit API. A simple mock of the Reddit API' });
});

app.post('/api/auth/login', authLimiter, authController.login);
app.post('/api/auth/logout', authLimiter, authController.logout);
app.post('/api/auth/register', authLimiter, authController.register);
app.patch('/api/auth/change-password', authLimiter, authenticateToken, authController.changePassword);

app.post('/api/subreddits/', contentLimiter, authenticateToken, subredditController.createSubreddit);
app.put('/api/subreddits/:id', authenticateToken, subredditController.editSubreddit);
app.delete('/api/subreddits/:id', authenticateToken, subredditController.deleteSubreddit);
app.get('/api/subreddits/', subredditController.getAllSubreddits);
app.get('/api/subreddits/:id', subredditController.getSubredditById);

app.post('/api/subscriptions', authenticateToken, subscriptionController.subscribe);
app.delete('/api/subscriptions/:subredditId', authenticateToken, subscriptionController.unsubscribe);
app.get('/api/subscriptions', authenticateToken, subscriptionController.getUserSubscriptions);

app.post('/api/posts', contentLimiter, authenticateToken, postController.createPost);
app.put('/api/posts/:id', authenticateToken, postController.updatePost);
app.delete('/api/posts/:id', authenticateToken, postController.deletePost);
app.get('/api/posts/me', authenticateToken, postController.getCurrentUserPosts);
app.get('/api/posts/user/:username', postController.getPostsByUsername);
app.get('/api/posts/votes/me', authenticateToken, postController.getVotedPosts);
app.get('/api/posts/:id', postController.getPostById);

app.post('/api/posts/:postId/vote', voteLimiter, authenticateToken, voteController.votePost);
app.get('/api/posts/:postId/votes', voteController.getPostVotes);

app.post('/api/posts/:postId/comments', contentLimiter, authenticateToken, commentController.createComment);
app.delete('/api/comments/:id', authenticateToken, commentController.deleteComment);
app.get('/api/posts/:postId/comments', commentController.getPostComments);

app.post('/api/comments/:commentId/vote', voteLimiter, authenticateToken, voteController.voteComment);
app.get('/api/comments/votes/me', authenticateToken, voteController.getVotedComments);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});