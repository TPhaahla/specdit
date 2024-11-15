const { decodeId } = require('../lib/hash-ids');

exports.decodeHashId = (paramName) => {
    return (req, res, next) => {
        const hashedId = req.params[paramName];
        if (!hashedId) {
            return res.status(400).json({
                success: false,
                message: `Missing ${paramName} parameter`
            });
        }

        const decodedId = decodeId(hashedId);
        if (decodedId === null) {
            return res.status(400).json({
                success: false,
                message: 'Invalid ID format'
            });
        }

        req.params[paramName] = decodedId;
        next();
    };
}; 