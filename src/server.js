const express = require('express');
const app = express();

// Import routers
const authRouter = require('./routes/auth-router');
const subredditRouter = require('./routes/subreddit-router');
const subscriptionRouter = require('./routes/subscription-router');
const postRouter = require('./routes/post-router');
const voteRouter = require('./routes/vote-router');
const commentRouter = require('./routes/comment-router');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.json({ message: 'Hello from Specdit API. A simple mock of the Reddit API' });
});

// Use routers
app.use('/api/auth', authRouter);
app.use('/api/subreddits', subredditRouter);
app.use('/api/subscriptions', subscriptionRouter);
app.use('/api/posts', postRouter);
app.use('/api', voteRouter);  // Note: vote routes handle both posts and comments
app.use('/api', commentRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});