const express = require('express');
const router = express.Router();
const commentController = require('../controllers/comment-controllers');
const { authenticateToken } = require('../middleware/auth-middleware');
const { decodeHashId } = require('../middleware/hash-middleware');

router.post('/posts/:postId/comments', authenticateToken, decodeHashId('postId'), commentController.createComment);
router.delete('/:id', authenticateToken, decodeHashId('id'), commentController.deleteComment);
router.get('/posts/:postId/comments', decodeHashId('postId'), commentController.getPostComments);

module.exports = router; 