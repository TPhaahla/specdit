const prisma = require('../lib/prisma').prisma;
const { transformIds } = require('../lib/hash-ids');

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
            const vote = await prisma.vote.create({
                data: {
                    type: voteType,
                    userId,
                    postId
                }
            });

            res.status(200).json({
                success: true,
                data: transformIds(vote)
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
        const votes = await prisma.vote.findMany({
            where: {
                postId,
                type: 'UP'
            }
        });

        res.status(200).json({
            success: true,
            data: transformIds(votes)
        });
    } catch (error) {
        console.error('Get votes error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching votes'
        });
    }
}; 

// Vote on a comment
exports.voteComment = async (req, res) => {
    const { commentId } = req.params;
    const { voteType } = req.body;
    const userId = req.user.id;

    if (!['UP', 'DOWN'].includes(voteType)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid vote type. Must be UP or DOWN'
        });
    }

    try {
        // Check if comment exists
        const comment = await prisma.comment.findUnique({
            where: { id: commentId }
        });

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        // Check if user has already voted
        const existingVote = await prisma.commentVote.findUnique({
            where: {
                userId_commentId: {
                    userId,
                    commentId
                }
            }
        });

        if (existingVote) {
            if (existingVote.type === voteType) {
                // Remove vote if clicking the same type again
                await prisma.commentVote.delete({
                    where: {
                        userId_commentId: {
                            userId,
                            commentId
                        }
                    }
                });

                return res.status(200).json({
                    success: true,
                    message: 'Vote removed successfully'
                });
            } else {
                // Update vote if changing vote type
                await prisma.commentVote.update({
                    where: {
                        userId_commentId: {
                            userId,
                            commentId
                        }
                    },
                    data: {
                        type: voteType
                    }
                });
            }
        } else {
            // Create new vote
            await prisma.commentVote.create({
                data: {
                    type: voteType,
                    userId,
                    commentId
                }
            });
        }

        // Get updated vote counts
        const upvotes = await prisma.commentVote.count({
            where: {
                commentId,
                type: 'UP'
            }
        });

        const downvotes = await prisma.commentVote.count({
            where: {
                commentId,
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
        console.error('Comment vote error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing vote'
        });
    }
};

// Get user's voted comments
exports.getVotedComments = async (req, res) => {
    const userId = req.user.id;
    const { voteType } = req.query;

    try {
        const whereClause = {
            userId,
            ...(voteType && { type: voteType.toUpperCase() })
        };

        const votedComments = await prisma.commentVote.findMany({
            where: whereClause,
            select: {
                type: true,
                comment: {
                    include: {
                        author: {
                            select: {
                                username: true,
                                name: true
                            }
                        },
                        post: {
                            select: {
                                id: true,
                                title: true
                            }
                        },
                        votes: true
                    }
                }
            },
            orderBy: {
                comment: {
                    createdAt: 'desc'
                }
            }
        });

        // Calculate vote counts for each comment
        const commentsWithVoteCounts = votedComments.map(vote => {
            const comment = vote.comment;
            const upvotes = comment.votes.filter(v => v.type === 'UP').length;
            const downvotes = comment.votes.filter(v => v.type === 'DOWN').length;

            return {
                ...comment,
                userVoteType: vote.type,
                votes: {
                    upvotes,
                    downvotes,
                    score: upvotes - downvotes
                }
            };
        });

        res.status(200).json({
            success: true,
            data: commentsWithVoteCounts
        });
    } catch (error) {
        console.error('Get voted comments error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching voted comments'
        });
    }
}; 