const prisma = require('../lib/prisma').prisma;
const { transformIds } = require('../lib/hash-ids');

// Create a comment
exports.createComment = async (req, res) => {
    const { postId } = req.params;
    const { text, replyToId } = req.body;
    const authorId = req.user.id;

    if (!text) {
        return res.status(400).json({
            success: false,
            message: 'Comment text is required'
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

        // If this is a reply, check if parent comment exists
        if (replyToId) {
            const parentComment = await prisma.comment.findUnique({
                where: { id: replyToId }
            });

            if (!parentComment) {
                return res.status(404).json({
                    success: false,
                    message: 'Parent comment not found'
                });
            }
        }

        const comment = await prisma.comment.create({
            data: {
                text,
                authorId,
                postId,
                replyToId
            },
            include: {
                author: {
                    select: {
                        username: true,
                        name: true
                    }
                },
                votes: true,
                replies: {
                    include: {
                        author: {
                            select: {
                                username: true,
                                name: true
                            }
                        }
                    }
                }
            }
        });

        res.status(201).json({
            success: true,
            data: transformIds(comment)
        });
    } catch (error) {
        console.error('Create comment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating comment'
        });
    }
};

// Delete a comment
exports.deleteComment = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const comment = await prisma.comment.findUnique({
            where: { id }
        });

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        if (comment.authorId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this comment'
            });
        }

        await prisma.comment.delete({
            where: { id }
        });

        res.status(200).json({
            success: true,
            message: 'Comment deleted successfully'
        });
    } catch (error) {
        console.error('Delete comment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting comment'
        });
    }
};

// Get all comments for a post
exports.getPostComments = async (req, res) => {
    const { postId } = req.params;

    try {
        const comments = await prisma.comment.findMany({
            where: {
                postId,
                replyToId: null // Only get top-level comments
            },
            include: {
                author: {
                    select: {
                        username: true,
                        name: true
                    }
                },
                votes: true,
                replies: {
                    include: {
                        author: {
                            select: {
                                username: true,
                                name: true
                            }
                        },
                        votes: true
                    }
                }
            }
        });

        // Calculate scores and sort comments
        const commentsWithScores = comments.map(comment => {
            const upvotes = comment.votes.filter(vote => vote.type === 'UP').length;
            const downvotes = comment.votes.filter(vote => vote.type === 'DOWN').length;
            const score = upvotes - downvotes;

            // Calculate and sort replies
            const repliesWithScores = comment.replies.map(reply => {
                const replyUpvotes = reply.votes.filter(vote => vote.type === 'UP').length;
                const replyDownvotes = reply.votes.filter(vote => vote.type === 'DOWN').length;
                const replyScore = replyUpvotes - replyDownvotes;

                return {
                    ...reply,
                    votes: {
                        upvotes: replyUpvotes,
                        downvotes: replyDownvotes,
                        score: replyScore
                    }
                };
            });

            // Sort replies by score
            repliesWithScores.sort((a, b) => b.votes.score - a.votes.score);

            return {
                ...comment,
                score,
                votes: {
                    upvotes,
                    downvotes,
                    score
                },
                replies: repliesWithScores
            };
        });

        // Sort comments by score
        commentsWithScores.sort((a, b) => b.score - a.score);

        res.status(200).json({
            success: true,
            data: commentsWithScores
        });
    } catch (error) {
        console.error('Get comments error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching comments'
        });
    }
}; 