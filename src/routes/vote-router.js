const express = require('express');
const router = express.Router();
const voteController = require('../controllers/vote-controller');
const { authenticateToken } = require('../middleware/auth-middleware');
const { decodeHashId } = require('../middleware/hash-middleware');

router.post('/posts/:postId/vote', authenticateToken, decodeHashId('postId'), voteController.votePost);
router.get('/posts/:postId/votes', decodeHashId('postId'), voteController.getPostVotes);
router.post('/comments/:commentId/vote', authenticateToken, voteController.voteComment);
router.get('/comments/votes/me', authenticateToken, voteController.getVotedComments);

module.exports = router; 