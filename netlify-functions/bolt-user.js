"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    try {
        const { userId } = req.query;
        if (!userId) {
            return res.status(400).json({ error: 'Missing required parameter: userId' });
        }
        const user = {
            id: userId,
            name: `User ${userId}`,
            email: `user${userId}@example.com`,
            avatar: `https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop`,
            preferences: {
                style: 'casual',
                colors: ['blue', 'black', 'white'],
                budget: 'medium'
            },
            created_at: new Date().toISOString()
        };
        return res.status(200).json(user);
    }
    catch (error) {
        console.error('Error fetching user:', error);
        return res.status(500).json({
            error: 'Failed to fetch user',
            message: error.message
        });
    }
}
