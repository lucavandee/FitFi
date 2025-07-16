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
        const { category, count = 20, gender, season } = req.query;
        const products = [];
        const categories = ['top', 'bottom', 'footwear', 'accessory', 'outerwear'];
        for (let i = 0; i < parseInt(count, 10); i++) {
            const productCategory = category || categories[i % categories.length];
            const productGender = gender || (i % 2 === 0 ? 'male' : 'female');
            const productSeason = season || (i % 4 === 0 ? 'spring' :
                i % 4 === 1 ? 'summer' :
                    i % 4 === 2 ? 'fall' : 'winter');
            let imageUrl = '';
            switch (productCategory) {
                case 'top':
                    imageUrl = `https://images.pexels.com/photos/${5935748 + i}/pexels-photo-${5935748 + i}.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2`;
                    break;
                case 'bottom':
                    imageUrl = `https://images.pexels.com/photos/${1082529 + i}/pexels-photo-${1082529 + i}.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2`;
                    break;
                case 'footwear':
                    imageUrl = `https://images.pexels.com/photos/${267301 + i}/pexels-photo-${267301 + i}.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2`;
                    break;
                case 'accessory':
                    imageUrl = `https://images.pexels.com/photos/${1280064 + i}/pexels-photo-${1280064 + i}.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2`;
                    break;
                case 'outerwear':
                    imageUrl = `https://images.pexels.com/photos/${7679720 + i}/pexels-photo-${7679720 + i}.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2`;
                    break;
                default:
                    imageUrl = `https://images.pexels.com/photos/${5935748 + i}/pexels-photo-${5935748 + i}.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2`;
            }
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
        return res.status(200).json({
            products,
            meta: {
                total: products.length,
                filtered: products.length,
                filters: { category, gender, season }
            }
        });
    }
    catch (error) {
        console.error('Error generating products:', error);
        return res.status(500).json({
            error: 'Failed to generate products',
            message: error.message
        });
    }
}
