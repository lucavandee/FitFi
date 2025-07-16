"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const handler = async (event) => {
    var _a, _b, _c, _d;
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
        const category = (_a = event.queryStringParameters) === null || _a === void 0 ? void 0 : _a.category;
        const count = ((_b = event.queryStringParameters) === null || _b === void 0 ? void 0 : _b.count) ? parseInt(event.queryStringParameters.count, 10) : 20;
        const gender = (_c = event.queryStringParameters) === null || _c === void 0 ? void 0 : _c.gender;
        const season = (_d = event.queryStringParameters) === null || _d === void 0 ? void 0 : _d.season;
        const products = [];
        const categories = ['top', 'bottom', 'footwear', 'accessory', 'outerwear'];
        for (let i = 0; i < count; i++) {
            const productCategory = category || categories[i % categories.length];
            const productGender = gender || (i % 2 === 0 ? 'male' : 'female');
            const productSeason = season || (i % 4 === 0 ? 'spring' :
                i % 4 === 1 ? 'summer' :
                    i % 4 === 2 ? 'fall' : 'winter');
            const fallbackImages = {
                'top': 'https://images.pexels.com/photos/5935748/pexels-photo-5935748.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
                'bottom': 'https://images.pexels.com/photos/1082529/pexels-photo-1082529.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
                'footwear': 'https://images.pexels.com/photos/267301/pexels-photo-267301.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
                'outerwear': 'https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
                'accessory': 'https://images.pexels.com/photos/1280064/pexels-photo-1280064.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2'
            };
            const allStyleTags = ['casual', 'formal', 'sporty', 'minimal', 'street', 'elegant', 'cozy', 'vintage'];
            const styleTags = allStyleTags.slice(i % 3, i % 3 + 3);
            const archetypeMatch = {};
            if (styleTags.includes('casual')) {
                archetypeMatch['casual_chic'] = 0.8;
            }
            if (styleTags.includes('formal')) {
                archetypeMatch['klassiek'] = 0.9;
            }
            if (styleTags.includes('sporty')) {
                archetypeMatch['streetstyle'] = 0.7;
            }
            if (styleTags.includes('vintage')) {
                archetypeMatch['retro'] = 0.85;
            }
            if (styleTags.includes('minimal')) {
                archetypeMatch['urban'] = 0.75;
            }
            if (Object.keys(archetypeMatch).length === 0) {
                archetypeMatch['casual_chic'] = 0.6;
            }
            products.push({
                id: `bolt-product-${i + 1}`,
                title: `Bolt ${productCategory.charAt(0).toUpperCase() + productCategory.slice(1)} ${i + 1}`,
                brand: 'Bolt Fashion',
                type: productCategory,
                gender: productGender,
                color: i % 2 === 0 ? 'black' : 'white',
                dominantColorHex: i % 2 === 0 ? '#000000' : '#FFFFFF',
                styleTags,
                season: productSeason,
                archetypeMatch,
                material: 'Mixed materials',
                price: 49.99 + (i * 5),
                imageUrl: fallbackImages[productCategory] || fallbackImages.top,
                affiliateUrl: `https://example.com/product/bolt-product-${i + 1}`,
                source: 'zalando'
            });
        }
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                products,
                meta: {
                    total: products.length,
                    filtered: products.length,
                    filters: { category, gender, season }
                }
            })
        };
    }
    catch (error) {
        console.error('Error generating products:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Failed to generate products',
                message: error instanceof Error ? error.message : 'Unknown error'
            })
        };
    }
};
exports.handler = handler;
