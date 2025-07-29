# FitFi Product API Documentation

## Overview

The FitFi Product API provides access to our curated product catalog for affiliate partners. This read-only API allows partners to retrieve product information, pricing, and availability data for integration with their systems.

**Base URL**: `https://api.fitfi.ai/v1`  
**Version**: 1.0  
**Authentication**: API Token (read-only)

## Authentication

All API requests require authentication using an API token in the Authorization header:

```http
Authorization: Bearer YOUR_API_TOKEN
```

To obtain an API token, contact our partnerships team at `partnerships@fitfi.ai`.

## Endpoints

### GET /api/v1/products

Retrieve a paginated list of products from our catalog.

#### Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `ean` | string | No | European Article Number for specific product | `8719245200503` |
| `brand` | string | No | Filter by brand name | `Nike`, `Zara`, `H&M` |
| `category` | string | No | Filter by product category | `tops`, `bottoms`, `footwear`, `accessories` |
| `gender` | string | No | Filter by target gender | `male`, `female`, `unisex` |
| `page` | integer | No | Page number for pagination (default: 1) | `1`, `2`, `3` |
| `limit` | integer | No | Number of items per page (default: 20, max: 100) | `20`, `50`, `100` |
| `min_price` | number | No | Minimum price filter in EUR | `25.00` |
| `max_price` | number | No | Maximum price filter in EUR | `200.00` |
| `in_stock` | boolean | No | Filter by stock availability | `true`, `false` |

#### Example Request

```http
GET /api/v1/products?brand=Nike&category=footwear&gender=female&page=1&limit=20
Authorization: Bearer your_api_token_here
Content-Type: application/json
```

#### Example Response

```json
{
  "data": [
    {
      "id": "fitfi_prod_001",
      "ean": "8719245200503",
      "name": "Nike Air Max 270 Women's Shoes",
      "brand": "Nike",
      "category": "footwear",
      "subcategory": "sneakers",
      "gender": "female",
      "description": "The Nike Air Max 270 delivers visible Air cushioning from heel to toe.",
      "price": {
        "current": 149.99,
        "original": 179.99,
        "currency": "EUR",
        "discount_percentage": 16.7
      },
      "images": {
        "primary": "https://cdn.fitfi.ai/products/nike-air-max-270-primary.jpg",
        "gallery": [
          "https://cdn.fitfi.ai/products/nike-air-max-270-1.jpg",
          "https://cdn.fitfi.ai/products/nike-air-max-270-2.jpg",
          "https://cdn.fitfi.ai/products/nike-air-max-270-3.jpg"
        ]
      },
      "availability": {
        "in_stock": true,
        "sizes": ["36", "37", "38", "39", "40", "41", "42"],
        "colors": ["Black/White", "Pink/White", "Blue/White"]
      },
      "attributes": {
        "material": "Synthetic/Textile",
        "style_tags": ["sporty", "casual", "comfortable"],
        "season": ["spring", "summer", "autumn"],
        "care_instructions": "Machine washable"
      },
      "retailer": {
        "name": "Zalando",
        "product_url": "https://www.zalando.nl/nike-air-max-270-sneakers-laag-black-ni111a0bu-q11.html",
        "affiliate_url": "https://www.zalando.nl/nike-air-max-270-sneakers-laag-black-ni111a0bu-q11.html?utm_source=fitfi&utm_medium=affiliate&utm_campaign=product_api"
      },
      "fitfi_data": {
        "style_score": 8.7,
        "popularity_rank": 15,
        "recommendation_count": 1247,
        "user_rating": 4.6,
        "review_count": 89
      },
      "created_at": "2024-12-15T10:30:00Z",
      "updated_at": "2024-12-28T14:22:00Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "per_page": 20,
    "total_items": 1547,
    "total_pages": 78,
    "has_next": true,
    "has_previous": false
  },
  "meta": {
    "request_id": "req_abc123def456",
    "response_time_ms": 145,
    "api_version": "1.0",
    "filters_applied": {
      "brand": "Nike",
      "category": "footwear",
      "gender": "female"
    }
  }
}
```

#### Response Schema

```json
{
  "type": "object",
  "properties": {
    "data": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {"type": "string", "description": "Unique FitFi product identifier"},
          "ean": {"type": "string", "description": "European Article Number"},
          "name": {"type": "string", "description": "Product name"},
          "brand": {"type": "string", "description": "Brand name"},
          "category": {"type": "string", "enum": ["tops", "bottoms", "footwear", "accessories", "outerwear"]},
          "subcategory": {"type": "string", "description": "Specific product subcategory"},
          "gender": {"type": "string", "enum": ["male", "female", "unisex"]},
          "description": {"type": "string", "description": "Product description"},
          "price": {
            "type": "object",
            "properties": {
              "current": {"type": "number", "description": "Current price in EUR"},
              "original": {"type": "number", "description": "Original price in EUR"},
              "currency": {"type": "string", "default": "EUR"},
              "discount_percentage": {"type": "number", "description": "Discount percentage if on sale"}
            }
          },
          "images": {
            "type": "object",
            "properties": {
              "primary": {"type": "string", "format": "uri"},
              "gallery": {"type": "array", "items": {"type": "string", "format": "uri"}}
            }
          },
          "availability": {
            "type": "object",
            "properties": {
              "in_stock": {"type": "boolean"},
              "sizes": {"type": "array", "items": {"type": "string"}},
              "colors": {"type": "array", "items": {"type": "string"}}
            }
          },
          "retailer": {
            "type": "object",
            "properties": {
              "name": {"type": "string"},
              "product_url": {"type": "string", "format": "uri"},
              "affiliate_url": {"type": "string", "format": "uri"}
            }
          }
        }
      }
    },
    "pagination": {
      "type": "object",
      "properties": {
        "current_page": {"type": "integer"},
        "per_page": {"type": "integer"},
        "total_items": {"type": "integer"},
        "total_pages": {"type": "integer"},
        "has_next": {"type": "boolean"},
        "has_previous": {"type": "boolean"}
      }
    }
  }
}
```

## Error Handling

The API uses standard HTTP status codes and returns error details in JSON format:

### Error Response Format

```json
{
  "error": {
    "code": "INVALID_PARAMETER",
    "message": "The 'category' parameter must be one of: tops, bottoms, footwear, accessories, outerwear",
    "details": {
      "parameter": "category",
      "provided_value": "invalid_category",
      "valid_values": ["tops", "bottoms", "footwear", "accessories", "outerwear"]
    },
    "request_id": "req_abc123def456"
  }
}
```

### Common Error Codes

| HTTP Status | Error Code | Description |
|-------------|------------|-------------|
| 400 | `INVALID_PARAMETER` | Invalid or missing required parameter |
| 401 | `UNAUTHORIZED` | Invalid or missing API token |
| 403 | `FORBIDDEN` | API token doesn't have required permissions |
| 404 | `NOT_FOUND` | Requested resource not found |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many requests, please slow down |
| 500 | `INTERNAL_ERROR` | Server error, please try again later |

## Rate Limiting

API requests are limited to:
- **1000 requests per hour** per API token
- **50 requests per minute** per API token

Rate limit headers are included in all responses:

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## Data Freshness

- **Product data** is updated every 4 hours
- **Pricing information** is updated every 2 hours
- **Stock availability** is updated every 30 minutes
- **New products** are added daily

## Integration Guidelines

### Best Practices

1. **Cache responses** appropriately (recommended: 2-4 hours for product data)
2. **Handle rate limits** gracefully with exponential backoff
3. **Use pagination** for large datasets
4. **Monitor API status** via our status page: `https://status.fitfi.ai`
5. **Implement error handling** for all possible error scenarios

### UTM Parameters

All affiliate URLs include UTM parameters for tracking:
- `utm_source=fitfi`
- `utm_medium=affiliate`
- `utm_campaign=product_api`
- `utm_content=[product_id]`

### Webhook Notifications (Optional)

Partners can register webhook endpoints to receive real-time notifications for:
- Price changes
- Stock updates
- New product additions
- Product discontinuations

Contact `tech@fitfi.ai` to set up webhook notifications.

## Support

### Technical Support
- **Email**: tech@fitfi.ai
- **Response Time**: < 4 hours during business hours
- **Documentation**: https://docs.fitfi.ai/api

### Partnership Support
- **Email**: partnerships@fitfi.ai
- **Phone**: +31 6 203 709 68
- **Response Time**: < 24 hours

### Status & Monitoring
- **API Status**: https://status.fitfi.ai
- **Uptime SLA**: 99.9%
- **Maintenance Windows**: Sundays 02:00-04:00 CET (announced 48h in advance)

---

**API Version**: 1.0  
**Last Updated**: December 28, 2024  
**Next Version**: Q2 2025 (v1.1 with enhanced filtering and recommendation scores)