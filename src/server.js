const express = require('express');
const authController = require('./controllers/auth-controllers');
const subredditController = require('./controllers/subreddit-controllers');
const subscriptionController = require('./controllers/subscription-controllers');
const postController = require('./controllers/post-controller');
const voteController = require('./controllers/vote-controller');
const commentController = require('./controllers/comment-controllers');

const { authenticateToken } = require('./middleware/auth-middleware');
const { decodeHashId } = require('./middleware/hash-middleware');
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
app.put('/api/subreddits/:id', authenticateToken, decodeHashId('id'), subredditController.editSubreddit);
app.delete('/api/subreddits/:id', authenticateToken, decodeHashId('id'), subredditController.deleteSubreddit);
app.get('/api/subreddits/', subredditController.getAllSubreddits);
app.get('/api/subreddits/:id', decodeHashId('id'), subredditController.getSubredditById);

app.post('/api/subscriptions', authenticateToken, subscriptionController.subscribe);
app.delete('/api/subscriptions/:subredditId', authenticateToken, decodeHashId('subredditId'), subscriptionController.unsubscribe);
app.get('/api/subscriptions', authenticateToken, subscriptionController.getUserSubscriptions);

app.post('/api/posts', authenticateToken, postController.createPost);
app.put('/api/posts/:id', authenticateToken, decodeHashId('id'), postController.updatePost);
app.delete('/api/posts/:id', authenticateToken, decodeHashId('id'), postController.deletePost);
app.get('/api/posts/me', authenticateToken, postController.getCurrentUserPosts);
app.get('/api/posts/user/:username', postController.getPostsByUsername);
app.get('/api/posts/votes/me', authenticateToken, postController.getVotedPosts);
app.get('/api/posts/:id', decodeHashId('id'), postController.getPostById);

app.post('/api/posts/:postId/vote', authenticateToken, decodeHashId('postId'), voteController.votePost);
app.get('/api/posts/:postId/votes', decodeHashId('postId'), voteController.getPostVotes);

app.post('/api/posts/:postId/comments', authenticateToken, decodeHashId('postId'), commentController.createComment);
app.delete('/api/comments/:id', authenticateToken, decodeHashId('id'), commentController.deleteComment);
app.get('/api/posts/:postId/comments', decodeHashId('postId'), commentController.getPostComments);

app.post('/api/comments/:commentId/vote', authenticateToken, voteController.voteComment);
app.get('/api/comments/votes/me', authenticateToken, voteController.getVotedComments);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});