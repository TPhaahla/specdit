const express = require('express');
const router = express.Router();
const subredditController = require('../controllers/subreddit-controllers');
const { authenticateToken } = require('../middleware/auth-middleware');
const { decodeHashId } = require('../middleware/hash-middleware');

router.post('/', authenticateToken, subredditController.createSubreddit);
router.put('/:id', authenticateToken, decodeHashId('id'), subredditController.editSubreddit);
router.delete('/:id', authenticateToken, decodeHashId('id'), subredditController.deleteSubreddit);
router.get('/', subredditController.getAllSubreddits);
router.get('/:id', decodeHashId('id'), subredditController.getSubredditById);

module.exports = router; 