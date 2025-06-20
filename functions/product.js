import { fetchProductImageCached, extractImageUrl } from "../src/lib/fetchProductImage.js";

export async function handler(event) {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      },
      body: ''
    };
  }

  try {
    const { retailer, id } = event.queryStringParameters || {};
    
    if (!retailer || !id) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          error: 'Missing required parameters: retailer and id' 
        })
      };
    }

    // Fetch product data from retailer API
    const productData = await fetchProductImageCached(retailer, id);
    
    // Extract image URL from the response
    const imageUrl = extractImageUrl(retailer, productData);
    
    if (!imageUrl) {
      throw new Error('No image found in product data');
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=1800' // Cache for 30 minutes
      },
      body: JSON.stringify({
        success: true,
        retailer,
        productId: id,
        imageUrl,
        media: {
          images: [{ url: imageUrl }]
        },
        timestamp: new Date().toISOString()
      })
    };
    
  } catch (error) {
    console.error('Product API error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        error: error.message,
        fallback: true
      })
    };
  }
}