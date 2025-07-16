"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
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
        const challengeId = params === null || params === void 0 ? void 0 : params.challengeId;
        if (!userId || !challengeId) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    error: 'Missing required parameters',
                    required: ['userId', 'challengeId'],
                    received: params
                })
            };
        }
        console.log(`Completing challenge ${challengeId} for user ${userId}`);
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                userId,
                challengeId,
                timestamp: new Date().toISOString()
            })
        };
    }
    catch (error) {
        console.error('Error completing challenge:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Failed to complete challenge',
                message: error instanceof Error ? error.message : 'Unknown error'
            })
        };
    }
};
exports.handler = handler;
