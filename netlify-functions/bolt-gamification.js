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
        const gamificationData = {
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
        return res.status(200).json(gamificationData);
    }
    catch (error) {
        console.error('Error fetching gamification data:', error);
        return res.status(500).json({
            error: 'Failed to fetch gamification data',
            message: error.message
        });
    }
}
