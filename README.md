# FitFi Zalando Scraper

This project scrapes product data from Zalando.nl and formats it for use in the FitFi style recommendation platform.

## Features

- Scrapes products from multiple categories (T-shirts, Jeans, Sneakers, Bags)
- Supports both men's and women's clothing
- Extracts product details including name, price, image URL, and more
- Categorizes products as top, bottom, footwear, or accessory
- Adds style tags based on product name and description
- Determines appropriate seasons for each product
- Saves data to a structured JSON file
- Uploads data to Supabase database
- Supports daily automated scraping via GitHub Actions

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example` with your Supabase credentials

### Usage

Run the scraper:

```bash
npm run scrape
```

This will:
1. Launch a headless browser
2. Visit Zalando.nl category pages
3. Extract product information
4. Save the data to `src/data/zalandoProducts.json`

### Uploading to Supabase

To upload the scraped data to Supabase:

```bash
npm run upload
```

### Automated Daily Scraping

The project includes a GitHub Action that runs the scraper daily and uploads the results to Supabase. The action is defined in `.github/workflows/daily-scrape.yml`.

To use this feature:
1. Add your Supabase credentials as GitHub repository secrets:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
2. The action will run automatically at 3 AM UTC every day
3. You can also trigger it manually from the Actions tab in GitHub

## Data Structure

The scraped data follows this structure:

```typescript
{
  id: string,
  name: string,
  description: string,
  imageUrl: string,
  price: string,
  affiliateUrl: string,
  category: 'top' | 'bottom' | 'footwear' | 'accessory',
  gender: 'male' | 'female',
  tags: string[], // such as ['casual', 'minimalist']
  seasons: string[], // such as ['spring', 'summer']
  brand: string,
  sizes: string[],
  created_at: string
}
```

## Customization

You can customize the scraper by modifying:

- `CATEGORIES` array in `scripts/scrapeZalando.js` to target different product categories
- `STYLE_TAG_MAPPING` to adjust how style tags are assigned
- `SEASON_MAPPING` to change how seasons are determined
- Environment variables in `.env` to control scraper behavior

## Limitations

- The scraper is designed for educational purposes only
- Rate limiting is implemented to avoid overloading Zalando's servers
- The script may need adjustments if Zalando changes their website structure
- Zalando may block automated scraping, so use responsibly

## License

This project is for demonstration purposes only.