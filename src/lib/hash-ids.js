const Hashids = require('hashids');

const hashids = new Hashids(process.env.HASH_SECRET || 'your-secret-salt', 10);

// Encode a numeric ID to a hash
const encodeId = (id) => {
    try {
        return hashids.encode(id);
    } catch (error) {
        console.error('Error encoding ID:', error);
        return null;
    }
};

// Decode a hash back to numeric ID
const decodeId = (hash) => {
    try {
        const decoded = hashids.decode(hash);
        return decoded[0] || null;
    } catch (error) {
        console.error('Error decoding hash:', error);
        return null;
    }
};

// Transform object IDs (recursive)
const transformIds = (obj, idFields = ['id']) => {
    if (!obj || typeof obj !== 'object') return obj;

    const transformed = Array.isArray(obj) ? [...obj] : { ...obj };

    for (const key in transformed) {
        if (idFields.includes(key) && typeof transformed[key] === 'string') {
            transformed[key] = encodeId(transformed[key]);
        } else if (typeof transformed[key] === 'object') {
            transformed[key] = transformIds(transformed[key], idFields);
        }
    }

    return transformed;
};

module.exports = {
    encodeId,
    decodeId,
    transformIds
}; 