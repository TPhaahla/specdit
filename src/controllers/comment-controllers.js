const prisma = require('../lib/prisma').prisma;

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
            data: comment
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
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.status(200).json({
            success: true,
            data: comments
        });
    } catch (error) {
        console.error('Get comments error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching comments'
        });
    }
}; 