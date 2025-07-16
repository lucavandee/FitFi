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
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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
    if (event.httpMethod !== 'GET' && event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }
    try {
        const params = event.httpMethod === 'GET' ? event.queryStringParameters : JSON.parse(event.body || '{}');
        const userId = params === null || params === void 0 ? void 0 : params.userId;
        const updates = (params === null || params === void 0 ? void 0 : params.updates) || {};
        if (!userId) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Missing required parameter: userId' })
            };
        }
        const baseData = generateMockGamification(userId);
        const updatedData = {
            ...baseData,
            ...updates,
            updated_at: new Date().toISOString()
        };
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(updatedData)
        };
    }
    catch (error) {
        console.error('Error updating gamification data:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Failed to update gamification data',
                message: error instanceof Error ? error.message : 'Unknown error'
            })
        };
    }
};
exports.handler = handler;
