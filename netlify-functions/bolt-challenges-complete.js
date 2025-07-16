"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    if (req.method !== 'GET' && req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    try {
        const params = req.method === 'GET' ? req.query : req.body;
        const { userId, challengeId } = params;
        if (!userId || !challengeId) {
            return res.status(400).json({
                error: 'Missing required parameters',
                required: ['userId', 'challengeId'],
                received: params
            });
        }
        console.log(`Completing challenge ${challengeId} for user ${userId}`);
        return res.status(200).json({
            success: true,
            userId,
            challengeId,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Error completing challenge:', error);
        return res.status(500).json({
            error: 'Failed to complete challenge',
            message: error.message
        });
    }
}
