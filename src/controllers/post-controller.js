const prisma = require('../lib/prisma').prisma;

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

    try {
        const posts = await prisma.post.findMany({
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
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.status(200).json({
            success: true,
            data: posts
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

    try {
        const posts = await prisma.post.findMany({
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
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.status(200).json({
            success: true,
            data: posts
        });
    } catch (error) {
        console.error('Get posts by username error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching posts'
        });
    }
}; 