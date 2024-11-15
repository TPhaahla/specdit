const { transformIds } = require('../lib/hash-ids');
const prisma = require('../lib/prisma').prisma;

// Create a new subreddit
exports.createSubreddit = async (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Name is required' });
    }

    try {
        const subreddit = await prisma.subreddit.create({
            data: {
                name,
                creatorId: req.user.id,
            },
        });
        res.status(201).json(subreddit);
    } catch (error) {
        res.status(500).json({ error: 'Error creating subreddit' });
    }
};

// Edit an existing subreddit
exports.editSubreddit = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    try {
        const subreddit = await prisma.subreddit.update({
            where: { id },
            data: { name },
        });
        res.status(200).json(subreddit);
    } catch (error) {
        res.status(500).json({ error: 'Error updating subreddit' });
    }
};

// Delete a subreddit
exports.deleteSubreddit = async (req, res) => {
    const { id } = req.params;

    try {
        await prisma.subreddit.delete({
            where: { id },
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Error deleting subreddit' });
    }
};

// Query all subreddits
exports.getAllSubreddits = async (req, res) => {
    try {
        const subreddits = await prisma.subreddit.findMany();
        res.status(200).json({
            success: true,
            data: transformIds(subreddits)
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: 'Error fetching subreddits' 
        });
    }
};

// Query a single subreddit by ID
exports.getSubredditById = async (req, res) => {
    const { id } = req.params;

    try {
        const subreddit = await prisma.subreddit.findUnique({
            where: { id },
            include: {
                Creator: {
                    select: {
                        username: true,
                        name: true
                    }
                },
                subscribers: true
            }
        });

        if (!subreddit) {
            return res.status(404).json({ 
                success: false,
                error: 'Subreddit not found' 
            });
        }

        res.status(200).json({
            success: true,
            data: transformIds(subreddit)
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: 'Error fetching subreddit' 
        });
    }
};

