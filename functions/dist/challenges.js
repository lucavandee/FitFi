"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
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
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ challenges })
        };
    }
    catch (error) {
        console.error('Error fetching challenges:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Failed to fetch challenges',
                message: error instanceof Error ? error.message : 'Unknown error'
            })
        };
    }
};
exports.handler = handler;
