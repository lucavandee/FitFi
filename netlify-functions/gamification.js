"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
// Import the generateMockGamification function directly to avoid path issues
// This will be bundled by esbuild
const generateMockGamification = (userId) => {
  return {
    id: `mock_gamification_${userId}`,
    user_id: userId,
    points: 120,
    level: 'beginner',
    badges: ['first_quiz'],
    streak: 2,
    last_check_in: new Date().toISOString(),
    completed_challenges: ['view3', 'shareLook'],
    total_referrals: 1,
    seasonal_event_progress: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
};
const handler = async (event) => {
    var _a;
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }
    try {
        const userId = (_a = event.queryStringParameters) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Missing required parameter: userId' }) 
            };
        }
        const gamificationData = generateMockGamification(userId);
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(gamificationData)
        };
    }
    catch (error) {
        console.error('Error fetching gamification data:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Failed to fetch gamification data',
                message: error instanceof Error ? error.message : 'Unknown error'
            })
        };
    }
};
exports.handler = handler;
