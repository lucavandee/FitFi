"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const mockDataUtils_1 = require("../src/utils/mockDataUtils");
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
        const gamificationData = (0, mockDataUtils_1.generateMockGamification)(userId);
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
