const prisma = require('../lib/prisma').prisma;

// Vote on a post (upvote or downvote)
exports.votePost = async (req, res) => {
    const { postId } = req.params;
    const { voteType } = req.body; // 'UP' or 'DOWN'
    const userId = req.user.id;

    if (!['UP', 'DOWN'].includes(voteType)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid vote type. Must be UP or DOWN'
        });
    }

    try {
        // Check if post exists
        const post = await prisma.post.findUnique({
            where: { id: postId }
        });

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        // Check if user has already voted
        const existingVote = await prisma.vote.findUnique({
            where: {
                userId_postId: {
                    userId,
                    postId
                }
            }
        });

        if (existingVote) {
            if (existingVote.type === voteType) {
                // Remove vote if clicking the same type again
                await prisma.vote.delete({
                    where: {
                        userId_postId: {
                            userId,
                            postId
                        }
                    }
                });

                return res.status(200).json({
                    success: true,
                    message: 'Vote removed successfully'
                });
            } else {
                // Update vote if changing vote type
                await prisma.vote.update({
                    where: {
                        userId_postId: {
                            userId,
                            postId
                        }
                    },
                    data: {
                        type: voteType
                    }
                });
            }
        } else {
            // Create new vote
            await prisma.vote.create({
                data: {
                    type: voteType,
                    userId,
                    postId
                }
            });
        }

        // Get updated vote count
        const upvotes = await prisma.vote.count({
            where: {
                postId,
                type: 'UP'
            }
        });

        const downvotes = await prisma.vote.count({
            where: {
                postId,
                type: 'DOWN'
            }
        });

        res.status(200).json({
            success: true,
            message: 'Vote recorded successfully',
            data: {
                upvotes,
                downvotes,
                score: upvotes - downvotes
            }
        });
    } catch (error) {
        console.error('Vote error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing vote'
        });
    }
};

// Get vote count for a post
exports.getPostVotes = async (req, res) => {
    const { postId } = req.params;

    try {
        const upvotes = await prisma.vote.count({
            where: {
                postId,
                type: 'UP'
            }
        });

        const downvotes = await prisma.vote.count({
            where: {
                postId,
                type: 'DOWN'
            }
        });

        res.status(200).json({
            success: true,
            data: {
                upvotes,
                downvotes,
                score: upvotes - downvotes
            }
        });
    } catch (error) {
        console.error('Get votes error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching votes'
        });
    }
}; 