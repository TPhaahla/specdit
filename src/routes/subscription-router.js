const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscription-controllers');
const { authenticateToken } = require('../middleware/auth-middleware');
const { decodeHashId } = require('../middleware/hash-middleware');

router.post('/', authenticateToken, subscriptionController.subscribe);
router.delete('/:subredditId', authenticateToken, decodeHashId('subredditId'), subscriptionController.unsubscribe);
router.get('/', authenticateToken, subscriptionController.getUserSubscriptions);

module.exports = router; 