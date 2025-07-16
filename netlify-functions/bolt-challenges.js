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
        const challenges = [
            {
                id: 'mock-challenge-1',
                user_id: userId,
                challenge_id: 'view3',
                completed: false,
                created_at: new Date().toISOString()
            },
            {
                id: 'mock-challenge-2',
                user_id: userId,
                challenge_id: 'shareLook',
                completed: false,
                created_at: new Date().toISOString()
            },
            {
                id: 'mock-challenge-3',
                user_id: userId,
                challenge_id: 'saveOutfit',
                completed: false,
                created_at: new Date().toISOString()
            },
            {
                id: 'mock-challenge-4',
                user_id: userId,
                challenge_id: 'completeProfile',
                completed: false,
                created_at: new Date().toISOString()
            },
            {
                id: 'mock-challenge-5',
                user_id: userId,
                challenge_id: 'visitShop',
                completed: false,
                created_at: new Date().toISOString()
            }
        ];
        return res.status(200).json({ challenges });
    }
    catch (error) {
        console.error('Error fetching challenges:', error);
        return res.status(500).json({
            error: 'Failed to fetch challenges',
            message: error.message
        });
    }
}
