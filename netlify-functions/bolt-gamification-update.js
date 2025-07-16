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
        const { userId, updates } = params;
        if (!userId) {
            return res.status(400).json({ error: 'Missing required parameter: userId' });
        }
        const baseData = {
            id: `gamification-${userId}`,
            user_id: userId,
            points: 120,
            level: 'beginner',
            badges: ['first_quiz'],
            streak: 2,
            last_check_in: new Date().toISOString(),
            completed_challenges: ['view3', 'shareLook'],
            total_referrals: 1,
            seasonal_event_progress: {},
            created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString()
        };
        const updatedData = {
            ...baseData,
            ...(updates || {}),
            updated_at: new Date().toISOString()
        };
        return res.status(200).json(updatedData);
    }
    catch (error) {
        console.error('Error updating gamification data:', error);
        return res.status(500).json({
            error: 'Failed to update gamification data',
            message: error.message
        });
    }
}
