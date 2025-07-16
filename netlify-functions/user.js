"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
// Import the generateMockUser function directly to avoid path issues
// This will be bundled by esbuild
const generateMockUser = (userId) => {
  return {
    id: userId,
    name: 'Test User',
    email: 'test@example.com',
    gender: 'female',
    stylePreferences: {
      casual: 3,
      formal: 3,
      sporty: 3,
      vintage: 3,
      minimalist: 3
    },
    isPremium: false,
    savedRecommendations: []
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
        const user = generateMockUser(userId);
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(user)
        };
    }
    catch (error) {
        console.error('Error fetching user:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Failed to fetch user',
                message: error instanceof Error ? error.message : 'Unknown error'
            })
        };
    }
};
exports.handler = handler;
