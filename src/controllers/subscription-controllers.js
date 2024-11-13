const prisma = require('../lib/prisma').prisma;

// Subscribe to a subreddit
exports.subscribe = async (req, res) => {
    const { subredditId } = req.body;
    const userId = req.user.id;

    try {
        // Check if subreddit exists
        const subreddit = await prisma.subreddit.findUnique({
            where: { id: subredditId }
        });

        if (!subreddit) {
            return res.status(404).json({
                success: false,
                message: 'Subreddit not found'
            });
        }

        // Check if subscription already exists
        const existingSubscription = await prisma.subscription.findUnique({
            where: {
                userId_subredditId: {
                    userId,
                    subredditId
                }
            }
        });

        if (existingSubscription) {
            return res.status(400).json({
                success: false,
                message: 'Already subscribed to this subreddit'
            });
        }

        // Create subscription
        const subscription = await prisma.subscription.create({
            data: {
                userId,
                subredditId
            }
        });

        res.status(201).json({
            success: true,
            message: 'Successfully subscribed to subreddit',
            data: subscription
        });
    } catch (error) {
        console.error('Subscription error:', error);
        res.status(500).json({
            success: false,
            message: 'Error subscribing to subreddit'
        });
    }
};

// Unsubscribe from a subreddit
exports.unsubscribe = async (req, res) => {
    const { subredditId } = req.params;
    const userId = req.user.id;

    try {
        // Check if subscription exists
        const subscription = await prisma.subscription.findUnique({
            where: {
                userId_subredditId: {
                    userId,
                    subredditId
                }
            }
        });

        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found'
            });
        }

        // Delete subscription
        await prisma.subscription.delete({
            where: {
                userId_subredditId: {
                    userId,
                    subredditId
                }
            }
        });

        res.status(200).json({
            success: true,
            message: 'Successfully unsubscribed from subreddit'
        });
    } catch (error) {
        console.error('Unsubscribe error:', error);
        res.status(500).json({
            success: false,
            message: 'Error unsubscribing from subreddit'
        });
    }
};

// Get user's subscriptions
exports.getUserSubscriptions = async (req, res) => {
    const userId = req.user.id;

    try {
        const subscriptions = await prisma.subscription.findMany({
            where: { userId },
            include: {
                subreddit: true
            }
        });

        res.status(200).json({
            success: true,
            data: subscriptions
        });
    } catch (error) {
        console.error('Get subscriptions error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching subscriptions'
        });
    }
}; 