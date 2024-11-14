const prisma = require('../lib/prisma').prisma;

// Add this helper function at the top of the file
const getPaginationParams = (query) => {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;
    return { skip, limit, page };
};

// Create a new post
exports.createPost = async (req, res) => {
    const { title, content, subredditId } = req.body;
    const authorId = req.user.id;

    if (!title || !subredditId) {
        return res.status(400).json({
            success: false,
            message: 'Title and subreddit are required'
        });
    }

    try {
        const post = await prisma.post.create({
            data: {
                title,
                content,
                authorId,
                subredditId,
            },
            include: {
                author: {
                    select: {
                        username: true,
                        name: true,
                    }
                },
                subreddit: {
                    select: {
                        name: true,
                    }
                }
            }
        });

        res.status(201).json({
            success: true,
            data: post
        });
    } catch (error) {
        console.error('Create post error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating post'
        });
    }
};

// Update a post
exports.updatePost = async (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;
    const userId = req.user.id;

    try {
        // Check if post exists and belongs to user
        const existingPost = await prisma.post.findUnique({
            where: { id }
        });

        if (!existingPost) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        if (existingPost.authorId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this post'
            });
        }

        const post = await prisma.post.update({
            where: { id },
            data: {
                title,
                content,
                updatedAt: new Date(),
            },
            include: {
                author: {
                    select: {
                        username: true,
                        name: true,
                    }
                },
                subreddit: {
                    select: {
                        name: true,
                    }
                }
            }
        });

        res.status(200).json({
            success: true,
            data: post
        });
    } catch (error) {
        console.error('Update post error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating post'
        });
    }
};

// Delete a post
exports.deletePost = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        // Check if post exists and belongs to user
        const post = await prisma.post.findUnique({
            where: { id }
        });

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        if (post.authorId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this post'
            });
        }

        await prisma.post.delete({
            where: { id }
        });

        res.status(200).json({
            success: true,
            message: 'Post deleted successfully'
        });
    } catch (error) {
        console.error('Delete post error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting post'
        });
    }
};

// Get all posts by current user
exports.getCurrentUserPosts = async (req, res) => {
    const userId = req.user.id;
    const { skip, limit, page } = getPaginationParams(req.query);

    try {
        const [posts, totalPosts] = await prisma.$transaction([
            prisma.post.findMany({
                where: {
                    authorId: userId
                },
                include: {
                    author: {
                        select: {
                            username: true,
                            name: true,
                        }
                    },
                    subreddit: {
                        select: {
                            name: true,
                        }
                    },
                    votes: true
                },
                orderBy: {
                    createdAt: 'desc'
                },
                skip,
                take: limit
            }),
            prisma.post.count({
                where: {
                    authorId: userId
                }
            })
        ]);

        // Calculate votes for each post
        const postsWithVotes = posts.map(post => {
            const upvotes = post.votes.filter(vote => vote.type === 'UP').length;
            const downvotes = post.votes.filter(vote => vote.type === 'DOWN').length;
            return {
                ...post,
                votes: {
                    upvotes,
                    downvotes,
                    score: upvotes - downvotes
                }
            };
        });

        res.status(200).json({
            success: true,
            data: postsWithVotes,
            pagination: {
                page,
                limit,
                totalPosts,
                totalPages: Math.ceil(totalPosts / limit),
                hasMore: page * limit < totalPosts
            }
        });
    } catch (error) {
        console.error('Get user posts error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching posts'
        });
    }
};

// Get all posts by username
exports.getPostsByUsername = async (req, res) => {
    const { username } = req.params;
    const { skip, limit, page } = getPaginationParams(req.query);

    try {
        const [posts, totalPosts] = await prisma.$transaction([
            prisma.post.findMany({
                where: {
                    author: {
                        username: username
                    }
                },
                include: {
                    author: {
                        select: {
                            username: true,
                            name: true,
                        }
                    },
                    subreddit: {
                        select: {
                            name: true,
                        }
                    },
                    votes: true
                },
                orderBy: {
                    createdAt: 'desc'
                },
                skip,
                take: limit
            }),
            prisma.post.count({
                where: {
                    author: {
                        username: username
                    }
                }
            })
        ]);

        // Calculate votes for each post
        const postsWithVotes = posts.map(post => {
            const upvotes = post.votes.filter(vote => vote.type === 'UP').length;
            const downvotes = post.votes.filter(vote => vote.type === 'DOWN').length;
            return {
                ...post,
                votes: {
                    upvotes,
                    downvotes,
                    score: upvotes - downvotes
                }
            };
        });

        res.status(200).json({
            success: true,
            data: postsWithVotes,
            pagination: {
                page,
                limit,
                totalPosts,
                totalPages: Math.ceil(totalPosts / limit),
                hasMore: page * limit < totalPosts
            }
        });
    } catch (error) {
        console.error('Get posts by username error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching posts'
        });
    }
};

// Get all posts voted by the current user
exports.getVotedPosts = async (req, res) => {
    const userId = req.user.id;
    const { voteType } = req.query; 

    try {
        const whereClause = {
            userId,
            ...(voteType && { type: voteType.toUpperCase() })
        };

        const votedPosts = await prisma.vote.findMany({
            where: whereClause,
            select: {
                type: true,
                post: {
                    include: {
                        author: {
                            select: {
                                username: true,
                                name: true,
                            }
                        },
                        subreddit: {
                            select: {
                                name: true,
                            }
                        },
                        votes: true,
                    }
                }
            },
            orderBy: {
                post: {
                    createdAt: 'desc'
                }
            }
        });

        // Calculate vote counts for each post
        const postsWithVoteCounts = votedPosts.map(vote => {
            const post = vote.post;
            const upvotes = post.votes.filter(v => v.type === 'UP').length;
            const downvotes = post.votes.filter(v => v.type === 'DOWN').length;

            return {
                ...post,
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
            data: postsWithVoteCounts
        });
    } catch (error) {
        console.error('Get voted posts error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching voted posts'
        });
    }
};

// Get a single post by ID with comments and votes
exports.getPostById = async (req, res) => {
    const { id } = req.params;

    try {
        const post = await prisma.post.findUnique({
            where: { id },
            include: {
                author: {
                    select: {
                        username: true,
                        name: true,
                    }
                },
                subreddit: {
                    select: {
                        name: true,
                    }
                },
                comments: {
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
                },
                votes: true
            }
        });

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        // Calculate vote counts
        const upvotes = post.votes.filter(vote => vote.type === 'UP').length;
        const downvotes = post.votes.filter(vote => vote.type === 'DOWN').length;

        // Calculate vote counts for each comment and store in array for sorting
        const commentsWithScores = post.comments.map(comment => {
            const commentUpvotes = comment.votes.filter(vote => vote.type === 'UP').length;
            const commentDownvotes = comment.votes.filter(vote => vote.type === 'DOWN').length;
            const score = commentUpvotes - commentDownvotes;

            // Calculate votes for replies
            const repliesWithVotes = comment.replies.map(reply => {
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
            repliesWithVotes.sort((a, b) => b.votes.score - a.votes.score);

            return {
                ...comment,
                score,
                votes: {
                    upvotes: commentUpvotes,
                    downvotes: commentDownvotes,
                    score
                },
                replies: repliesWithVotes
            };
        });

        // Sort comments by score
        commentsWithScores.sort((a, b) => b.score - a.score);

        // Format the response
        const formattedPost = {
            ...post,
            votes: {
                upvotes,
                downvotes,
                score: upvotes - downvotes
            },
            comments: commentsWithScores
        };

        res.status(200).json({
            success: true,
            data: formattedPost
        });
    } catch (error) {
        console.error('Get post error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching post'
        });
    }
}; 