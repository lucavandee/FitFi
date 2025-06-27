import { BoltProduct } from '../types/BoltProduct';
import { convertToBoltProduct } from '../services/productEnricher';

// Example raw Zalando product data
const rawZalandoProducts = [
  {
    "title": "Beige colbert van Hugo Boss",
    "brand": "Hugo Boss",
    "price": 189.95,
    "image": "https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2",
    "gender": "men",
    "color": "beige",
    "url": "https://partner.zalando.nl/hugo123"
  },
  {
    "title": "Witte sneakers van Nike",
    "brand": "Nike",
    "price": 109.95,
    "image": "https://images.pexels.com/photos/267301/pexels-photo-267301.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2",
    "gender": "men",
    "color": "white",
    "url": "https://partner.zalando.nl/nike456"
  }
];

// Convert raw products to BoltProducts
const boltProducts: BoltProduct[] = rawZalandoProducts.map(convertToBoltProduct);

// Example output
console.log(JSON.stringify(boltProducts, null, 2));

/**
 * Example output:
 * 
 * [
 *   {
 *     "id": "bolt-hugo-boss-beige-colbert-van-hugo-boss",
 *     "title": "Beige colbert van Hugo Boss",
 *     "brand": "Hugo Boss",
 *     "type": "colbert",
 *     "gender": "male",
 *     "color": "beige",
 *     "dominantColorHex": "#F5F5DC",
 *     "styleTags": [
 *       "smart",
 *       "clean",
 *       "italian"
 *     ],
 *     "season": "all_season",
 *     "archetypeMatch": {
 *       "klassiek": 1,
 *       "luxury": 0.67
 *     },
 *     "material": "Wol en polyester blend",
 *     "price": 189.95,
 *     "imageUrl": "https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2",
 *     "affiliateUrl": "https://partner.zalando.nl/hugo123",
 *     "source": "zalando"
 *   },
 *   {
 *     "id": "bolt-nike-witte-sneakers-van-nike",
 *     "title": "Witte sneakers van Nike",
 *     "brand": "Nike",
 *     "type": "sneaker",
 *     "gender": "male",
 *     "color": "white",
 *     "dominantColorHex": "#FFFFFF",
 *     "styleTags": [
 *       "sporty",
 *       "athletic",
 *       "street"
 *     ],
 *     "season": "all_season",
 *     "archetypeMatch": {
 *       "streetstyle": 1,
 *       "urban": 0.33
 *     },
 *     "material": "Leer en mesh",
 *     "price": 109.95,
 *     "imageUrl": "https://images.pexels.com/photos/267301/pexels-photo-267301.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2",
 *     "affiliateUrl": "https://partner.zalando.nl/nike456",
 *     "source": "zalando"
 *   }
 * ]
 */