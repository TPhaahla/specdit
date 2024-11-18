const express = require('express');
const router = express.Router();
const postController = require('../controllers/post-controller');
const { authenticateToken } = require('../middleware/auth-middleware');
const { decodeHashId } = require('../middleware/hash-middleware');

router.post('/', authenticateToken, postController.createPost);
router.put('/:id', authenticateToken, decodeHashId('id'), postController.updatePost);
router.delete('/:id', authenticateToken, decodeHashId('id'), postController.deletePost);
router.get('/me', authenticateToken, postController.getCurrentUserPosts);
router.get('/user/:username', postController.getPostsByUsername);
router.get('/votes/me', authenticateToken, postController.getVotedPosts);
router.get('/:id', decodeHashId('id'), postController.getPostById);

module.exports = router; 