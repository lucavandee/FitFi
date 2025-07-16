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
        const { user, count = 3, archetype, gender, season } = req.query;
        let userObj = null;
        if (user) {
            try {
                userObj = typeof user === 'string' ? JSON.parse(user) : user;
            }
            catch (parseError) {
                console.error('Error parsing user object:', parseError);
            }
        }
        const outfits = [
            {
                id: 'outfit-casual_chic-casual-1',
                title: 'Casual Chic Look',
                description: 'Een moeiteloze combinatie van comfort en stijl, perfect voor dagelijks gebruik.',
                archetype: 'casual_chic',
                occasion: 'Casual',
                products: [
                    {
                        id: 'bolt-product-1',
                        name: 'Oversized Cotton Shirt',
                        brand: 'COS',
                        price: 59.95,
                        imageUrl: 'https://images.pexels.com/photos/5935748/pexels-photo-5935748.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
                        type: 'shirt',
                        category: 'top',
                        styleTags: ['casual', 'minimal', 'clean']
                    },
                    {
                        id: 'bolt-product-2',
                        name: 'High Waist Mom Jeans',
                        brand: 'Levi\'s',
                        price: 99.95,
                        imageUrl: 'https://images.pexels.com/photos/1082529/pexels-photo-1082529.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
                        type: 'jeans',
                        category: 'bottom',
                        styleTags: ['casual', 'denim', 'american']
                    },
                    {
                        id: 'bolt-product-3',
                        name: 'White Sneakers',
                        brand: 'Adidas',
                        price: 89.95,
                        imageUrl: 'https://images.pexels.com/photos/267301/pexels-photo-267301.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
                        type: 'sneaker',
                        category: 'footwear',
                        styleTags: ['minimal', 'sporty', 'clean']
                    }
                ],
                imageUrl: 'https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&dpr=2',
                tags: ['casual', 'comfortable', 'everyday', 'minimal'],
                matchPercentage: 92,
                explanation: 'Deze outfit combineert comfort met stijl, perfect voor jouw casual chic voorkeuren. De neutrale kleuren en clean lijnen zorgen voor een tijdloze look die je gemakkelijk kunt dragen voor verschillende gelegenheden.',
                season: 'autumn',
                structure: ['top', 'bottom', 'footwear'],
                weather: 'mild',
                categoryRatio: {
                    top: 33,
                    bottom: 33,
                    footwear: 33,
                    accessory: 0,
                    outerwear: 0,
                    dress: 0,
                    jumpsuit: 0,
                    other: 0
                },
                completeness: 100
            },
            {
                id: 'outfit-klassiek-werk-1',
                title: 'Klassieke Werkoutfit',
                description: 'Een tijdloze combinatie voor een professionele uitstraling op kantoor.',
                archetype: 'klassiek',
                occasion: 'Werk',
                products: [
                    {
                        id: 'bolt-product-4',
                        name: 'Silk Blouse',
                        brand: 'Massimo Dutti',
                        price: 89.95,
                        imageUrl: 'https://images.pexels.com/photos/5935748/pexels-photo-5935748.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
                        type: 'blouse',
                        category: 'top',
                        styleTags: ['formal', 'elegant', 'minimal']
                    },
                    {
                        id: 'bolt-product-5',
                        name: 'Tailored Trousers',
                        brand: 'Hugo Boss',
                        price: 129.95,
                        imageUrl: 'https://images.pexels.com/photos/1082529/pexels-photo-1082529.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
                        type: 'broek',
                        category: 'bottom',
                        styleTags: ['formal', 'smart', 'business']
                    },
                    {
                        id: 'bolt-product-6',
                        name: 'Leather Pumps',
                        brand: 'Clarks',
                        price: 119.95,
                        imageUrl: 'https://images.pexels.com/photos/267301/pexels-photo-267301.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
                        type: 'schoenen',
                        category: 'footwear',
                        styleTags: ['formal', 'elegant', 'smart']
                    },
                    {
                        id: 'bolt-product-7',
                        name: 'Leather Tote Bag',
                        brand: 'Michael Kors',
                        price: 199.95,
                        imageUrl: 'https://images.pexels.com/photos/1280064/pexels-photo-1280064.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
                        type: 'tas',
                        category: 'accessory',
                        styleTags: ['formal', 'luxury', 'business']
                    }
                ],
                imageUrl: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&dpr=2',
                tags: ['formal', 'business', 'professional', 'elegant'],
                matchPercentage: 95,
                explanation: 'Deze outfit straalt professionaliteit en elegantie uit, perfect voor jouw klassieke stijlvoorkeuren. De tijdloze kleuren en hoogwaardige materialen zorgen voor een verfijnde look die respect afdwingt op kantoor.',
                season: 'autumn',
                structure: ['top', 'bottom', 'footwear', 'accessory'],
                weather: 'mild',
                categoryRatio: {
                    top: 25,
                    bottom: 25,
                    footwear: 25,
                    accessory: 25,
                    outerwear: 0,
                    dress: 0,
                    jumpsuit: 0,
                    other: 0
                },
                completeness: 100
            },
            {
                id: 'outfit-streetstyle-uitgaan-1',
                title: 'Urban Streetstyle Look',
                description: 'Een stoere, trendy outfit voor een avond uit met vrienden.',
                archetype: 'streetstyle',
                occasion: 'Uitgaan',
                products: [
                    {
                        id: 'bolt-product-8',
                        name: 'Oversized Graphic Tee',
                        brand: 'Stüssy',
                        price: 49.95,
                        imageUrl: 'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
                        type: 'shirt',
                        category: 'top',
                        styleTags: ['street', 'casual', 'trendy']
                    },
                    {
                        id: 'bolt-product-9',
                        name: 'Cargo Pants',
                        brand: 'Carhartt',
                        price: 89.95,
                        imageUrl: 'https://images.pexels.com/photos/1082529/pexels-photo-1082529.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
                        type: 'broek',
                        category: 'bottom',
                        styleTags: ['street', 'casual', 'functional']
                    },
                    {
                        id: 'bolt-product-10',
                        name: 'Chunky Sneakers',
                        brand: 'Nike',
                        price: 129.95,
                        imageUrl: 'https://images.pexels.com/photos/267301/pexels-photo-267301.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
                        type: 'sneaker',
                        category: 'footwear',
                        styleTags: ['street', 'sporty', 'statement']
                    }
                ],
                imageUrl: 'https://images.pexels.com/photos/2043590/pexels-photo-2043590.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&dpr=2',
                tags: ['street', 'urban', 'trendy', 'casual'],
                matchPercentage: 88,
                explanation: 'Deze outfit is perfect voor jouw streetstyle voorkeuren. De combinatie van statement items en comfortabele pasvorm zorgt voor een authentieke urban look die opvalt tijdens een avond uit.',
                season: 'autumn',
                structure: ['top', 'bottom', 'footwear'],
                weather: 'mild',
                categoryRatio: {
                    top: 33,
                    bottom: 33,
                    footwear: 33,
                    accessory: 0,
                    outerwear: 0,
                    dress: 0,
                    jumpsuit: 0,
                    other: 0
                },
                completeness: 100
            }
        ];
        return res.status(200).json({
            outfits: outfits.slice(0, parseInt(count, 10) || 3),
            meta: {
                count: parseInt(count, 10) || 3,
                user: (userObj === null || userObj === void 0 ? void 0 : userObj.id) || 'anonymous',
                filters: { archetype, gender, season }
            }
        });
    }
    catch (error) {
        console.error('Error generating outfits:', error);
        return res.status(500).json({
            error: 'Failed to generate outfits',
            message: error.message
        });
    }
}
