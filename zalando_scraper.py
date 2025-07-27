#!/usr/bin/env python3
"""
Zalando Scraper - Production Ready
==================================

Een complete, robuuste scraper voor Zalando.nl producten met:
- Anti-bot protection (user-agent rotatie, delays, retries)
- Modulaire opbouw voor onderhoud
- JSON export in FitFi-compatible format
- Supabase integratie mogelijkheden
- Uitgebreide logging en error handling

Gebruik:
    python zalando_scraper.py

Cron scheduling voorbeeld:
    # Dagelijks om 3:00 AM
    0 3 * * * /usr/bin/python3 /path/to/zalando_scraper.py >> /var/log/zalando_scraper.log 2>&1
    
    # Wekelijks op zondag om 2:00 AM
    0 2 * * 0 /usr/bin/python3 /path/to/zalando_scraper.py

Supabase Import:
    Het gegenereerde zalandoProducts.json kan worden geïmporteerd via:
    1. Python Supabase client (zie import_to_supabase functie)
    2. Supabase Dashboard > Table Editor > Import
    3. Bash script met curl naar Supabase REST API
"""

import requests
from bs4 import BeautifulSoup
import json
import uuid
import time
import random
import logging
from datetime import datetime, timezone
from typing import List, Dict, Optional, Any
from fake_useragent import UserAgent
import os
from urllib.parse import urljoin, urlparse
import re

# Optionele imports voor JavaScript rendering
try:
    from playwright.sync_api import sync_playwright
    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    PLAYWRIGHT_AVAILABLE = False
    print("Playwright niet beschikbaar. Alleen statische HTML scraping.")

# Optionele Supabase import
try:
    from supabase import create_client, Client
    SUPABASE_AVAILABLE = True
except ImportError:
    SUPABASE_AVAILABLE = False
    print("Supabase client niet beschikbaar. Alleen JSON export.")

# Logging configuratie
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('zalando_scraper.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class ZalandoScraper:
    """
    Hoofdklasse voor Zalando product scraping
    
    Features:
    - Anti-bot protection met user-agent rotatie
    - Retry mechanisme voor failed requests
    - Modulaire functies voor verschillende scraping taken
    - JSON export in FitFi-compatible format
    """
    
    def __init__(self):
        self.base_url = "https://www.zalando.nl"
        self.session = requests.Session()
        self.ua = UserAgent()
        self.scraped_products = []
        self.failed_urls = []
        
        # Anti-bot protection instellingen
        self.min_delay = 1  # Minimum delay tussen requests (seconden)
        self.max_delay = 3  # Maximum delay tussen requests
        self.max_retries = 3  # Maximum aantal retries per request
        
        # Zalando categorieën om te scrapen
        self.categories = [
            "heren-home",
            "herenkleding", 
            "herenschoenen",
            "heren-accessoires",
            "dameskleding",
            "damesschoenen",
            "tassen-accessoires"
        ]
        
        logger.info("Zalando Scraper geïnitialiseerd")
    
    def get_random_headers(self) -> Dict[str, str]:
        """
        Genereer random headers voor anti-bot protection
        
        Returns:
            Dict met HTTP headers
        """
        return {
            'User-Agent': self.ua.random,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'nl-NL,nl;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Cache-Control': 'max-age=0'
        }
    
    def make_request(self, url: str, retries: int = 0) -> Optional[requests.Response]:
        """
        Maak een HTTP request met retry logica en anti-bot protection
        """
        if retries >= self.max_retries:
            logger.error(f"Max retries bereikt voor {url}")
            self.failed_urls.append(url)
            return None
        
        try:
            # Random delay voor anti-bot protection
            delay = random.uniform(self.min_delay, self.max_delay)
            time.sleep(delay)
            
            # Maak request met random headers
            headers = self.get_random_headers()
            response = self.session.get(url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                logger.debug(f"Succesvol gescraped: {url}")
                return response
            elif response.status_code == 429:
                # Rate limited - wacht langer en probeer opnieuw
                logger.warning(f"Rate limited voor {url}, wacht 30 seconden...")
                time.sleep(30)
                return self.make_request(url, retries + 1)
            else:
                logger.warning(f"HTTP {response.status_code} voor {url}")
                return self.make_request(url, retries + 1)
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Request error voor {url}: {e}")
            return self.make_request(url, retries + 1)
    
      def scrape_category_page(self, category: str, page: int = 1) -> List[str]:
      url = f"{self.base_url}/{category}/?p={page}"
      logger.info(f"Scraping categorie pagina: {url}")

    html_content = None
    soup = None
    response = None

    # PROBEER EERST PLAYWRIGHT
    if PLAYWRIGHT_AVAILABLE:
        html_content = self.scrape_with_playwright(url)
        if html_content:
            soup = BeautifulSoup(html_content, 'html.parser')
        else:
            logger.warning("Playwright faalde, fallback naar requests")
            response = self.make_request(url)
            if not response:
                return []
            soup = BeautifulSoup(response.content, 'html.parser')
    else:
        response = self.make_request(url)
        if not response:
            return []
        soup = BeautifulSoup(response.content, 'html.parser')

    product_urls = []
    selectors = [
        'a[href*="/p/"]',
        '[data-testid="product-card-link"]',
        '[data-testid="product-item"] a'
    ]
    for selector in selectors:
        links = soup.select(selector)
        for link in links:
            href = link.get('href')
            if href and '/p/' in href:
                full_url = urljoin(self.base_url, href)
                if full_url not in product_urls:
                    product_urls.append(full_url)

    logger.info(f"Gevonden {len(product_urls)} product URLs op pagina {page}")

    if len(product_urls) == 0:
        debug_file = f'debug_{category}_p{page}.html'
        with open(debug_file, 'w', encoding='utf-8') as f:
            # Sla de Playwright-HTML op als die beschikbaar is, anders de requests-HTML
            if html_content:
                f.write(html_content)
            elif response:
                f.write(response.text)
        logger.warning(f"Geen producten gevonden. HTML opgeslagen als {debug_file}")

    return product_urls
    
    def extract_price(self, soup: BeautifulSoup) -> tuple[float, float]:
        """
        Extraheer prijs en originele prijs uit product pagina
        
        Args:
            soup: BeautifulSoup object van product pagina
            
        Returns:
            Tuple van (huidige_prijs, originele_prijs)
        """
        current_price = 0.0
        original_price = 0.0
        
        # Verschillende selectors voor prijzen
        price_selectors = [
            '.sDq_FX',  # Huidige prijs
            '[data-testid="price"]',
            '.price-current',
            '.price'
        ]
        
        original_price_selectors = [
            '.sDq_FX._2Pvyxl',  # Originele prijs (doorgestreept)
            '[data-testid="original-price"]',
            '.price-original',
            '.price-old'
        ]
        
        # Zoek huidige prijs
        for selector in price_selectors:
            price_elem = soup.select_one(selector)
            if price_elem:
                price_text = price_elem.get_text(strip=True)
                price_match = re.search(r'€\s*(\d+(?:,\d{2})?)', price_text)
                if price_match:
                    current_price = float(price_match.group(1).replace(',', '.'))
                    break
        
        # Zoek originele prijs (bij sale items)
        for selector in original_price_selectors:
            price_elem = soup.select_one(selector)
            if price_elem:
                price_text = price_elem.get_text(strip=True)
                price_match = re.search(r'€\s*(\d+(?:,\d{2})?)', price_text)
                if price_match:
                    original_price = float(price_match.group(1).replace(',', '.'))
                    break
        
        return current_price, original_price
    
    def extract_images(self, soup: BeautifulSoup) -> List[str]:
        """
        Extraheer product afbeeldingen
        
        Args:
            soup: BeautifulSoup object van product pagina
            
        Returns:
            List van afbeelding URLs
        """
        images = []
        
        # Verschillende selectors voor afbeeldingen
        img_selectors = [
            '.pdp-gallery img',
            '[data-testid="pdp-gallery"] img',
            '.product-images img',
            '.gallery img'
        ]
        
        for selector in img_selectors:
            img_elements = soup.select(selector)
            for img in img_elements:
                src = img.get('src') or img.get('data-src')
                if src and 'http' in src:
                    # Gebruik hoogste kwaliteit afbeelding
                    if 'mosaic' in src:
                        src = src.replace('mosaic01', 'mosaic02')
                    images.append(src)
        
        return list(set(images))  # Remove duplicates
    
    def extract_sizes_and_colors(self, soup: BeautifulSoup) -> tuple[List[str], List[str]]:
        """
        Extraheer beschikbare maten en kleuren
        
        Args:
            soup: BeautifulSoup object van product pagina
            
        Returns:
            Tuple van (maten_list, kleuren_list)
        """
        sizes = []
        colors = []
        
        # Maten selectors
        size_selectors = [
            '[data-testid="size-selector"] button',
            '.size-selector button',
            '.sizes button',
            '.size-option'
        ]
        
        for selector in size_selectors:
            size_elements = soup.select(selector)
            for elem in size_elements:
                size_text = elem.get_text(strip=True)
                if size_text and size_text not in sizes:
                    sizes.append(size_text)
        
        # Kleuren selectors
        color_selectors = [
            '[data-testid="color-selector"] button',
            '.color-selector button',
            '.colors button',
            '.color-option'
        ]
        
        for selector in color_selectors:
            color_elements = soup.select(selector)
            for elem in color_elements:
                color_text = elem.get('aria-label') or elem.get('title') or elem.get_text(strip=True)
                if color_text and color_text not in colors:
                    colors.append(color_text)
        
        return sizes, colors
    
    def extract_rating_and_reviews(self, soup: BeautifulSoup) -> tuple[float, int]:
        """
        Extraheer rating en aantal reviews
        
        Args:
            soup: BeautifulSoup object van product pagina
            
        Returns:
            Tuple van (rating, review_count)
        """
        rating = 0.0
        review_count = 0
        
        # Rating selectors
        rating_selectors = [
            '[data-testid="rating"]',
            '.rating',
            '.stars',
            '.review-rating'
        ]
        
        for selector in rating_selectors:
            rating_elem = soup.select_one(selector)
            if rating_elem:
                rating_text = rating_elem.get_text(strip=True)
                rating_match = re.search(r'(\d+(?:,\d+)?)', rating_text)
                if rating_match:
                    rating = float(rating_match.group(1).replace(',', '.'))
                    break
        
        # Review count selectors
        review_selectors = [
            '[data-testid="review-count"]',
            '.review-count',
            '.reviews-count',
            '.number-of-reviews'
        ]
        
        for selector in review_selectors:
            review_elem = soup.select_one(selector)
            if review_elem:
                review_text = review_elem.get_text(strip=True)
                review_match = re.search(r'(\d+)', review_text)
                if review_match:
                    review_count = int(review_match.group(1))
                    break
        
        return rating, review_count
    
    def scrape_product_details(self, product_url: str) -> Optional[Dict[str, Any]]:
        """
        Scrape gedetailleerde product informatie van een product pagina
        
        Args:
            product_url: URL van het product
            
        Returns:
            Dict met product data of None bij failure
        """
        logger.debug(f"Scraping product details: {product_url}")
        
        response = self.make_request(product_url)
        if not response:
            return None
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        try:
            # Basis product informatie
            name_elem = soup.select_one('h1, [data-testid="pdp-product-name"], .product-name')
            name = name_elem.get_text(strip=True) if name_elem else "Onbekend Product"
            
            brand_elem = soup.select_one('[data-testid="pdp-product-brand"], .brand, .product-brand')
            brand = brand_elem.get_text(strip=True) if brand_elem else "Onbekend Merk"
            
            # Prijzen
            current_price, original_price = self.extract_price(soup)
            
            # Afbeeldingen
            images = self.extract_images(soup)
            main_image = images[0] if images else ""
            
            # Beschrijving
            desc_selectors = [
                '[data-testid="pdp-product-description"]',
                '.product-description',
                '.description',
                '.product-details'
            ]
            description = ""
            for selector in desc_selectors:
                desc_elem = soup.select_one(selector)
                if desc_elem:
                    description = desc_elem.get_text(strip=True)
                    break
            
            # Categorie (uit URL of breadcrumbs)
            category = "Kleding"  # Default
            breadcrumb_elem = soup.select_one('.breadcrumb, [data-testid="breadcrumb"]')
            if breadcrumb_elem:
                breadcrumb_text = breadcrumb_elem.get_text()
                if "dames" in breadcrumb_text.lower():
                    category = "Dameskleding"
                elif "heren" in breadcrumb_text.lower():
                    category = "Herenkleding"
                elif "schoenen" in breadcrumb_text.lower():
                    category = "Schoenen"
                elif "tassen" in breadcrumb_text.lower():
                    category = "Tassen"
            
            # Maten en kleuren
            sizes, colors = self.extract_sizes_and_colors(soup)
            
            # Rating en reviews
            rating, review_count = self.extract_rating_and_reviews(soup)
            
            # Voorraadstatus (simpele check)
            in_stock = True
            stock_indicators = soup.select('.out-of-stock, .not-available, [data-testid="out-of-stock"]')
            if stock_indicators:
                in_stock = False
            
            # Tags genereren op basis van beschikbare data
            tags = []
            if "sale" in product_url.lower() or original_price > current_price:
                tags.append("sale")
            if brand.lower() in ["nike", "adidas", "puma"]:
                tags.append("sport")
            if "premium" in description.lower():
                tags.append("premium")
            if not tags:
                tags = ["fashion", "style"]
            
            # Product data samenstellen
            product_data = {
                "id": str(uuid.uuid4()),
                "name": name,
                "brand": brand,
                "price": current_price,
                "original_price": original_price if original_price > current_price else current_price,
                "image_url": main_image,
                "product_url": product_url,
                "retailer": "Zalando",
                "category": category,
                "description": description[:500] if description else f"{name} van {brand}",
                "sizes": sizes,
                "colors": colors,
                "in_stock": in_stock,
                "rating": rating,
                "review_count": review_count,
                "tags": tags,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
            
            logger.debug(f"Product gescraped: {name} - €{current_price}")
            return product_data
            
        except Exception as e:
            logger.error(f"Error bij scrapen product {product_url}: {e}")
            return None
    
    def scrape_with_playwright(self, url: str) -> Optional[str]:
        """
        Scrape pagina met Playwright voor JavaScript-heavy content
        
        Args:
            url: URL om te scrapen
            
        Returns:
            HTML content of None bij failure
        """
        if not PLAYWRIGHT_AVAILABLE:
            logger.warning("Playwright niet beschikbaar voor JavaScript rendering")
            return None
        
        try:
            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True)
                context = browser.new_context(
                    user_agent=self.ua.random,
                    locale='nl-NL'
                )
                page = context.new_page()
                
                # Navigeer naar pagina en wacht op load
                page.goto(url, wait_until='networkidle')
                
                # Wacht even voor dynamic content
                page.wait_for_timeout(2000)
                
                html_content = page.content()
                browser.close()
                
                logger.debug(f"Playwright scraping succesvol voor {url}")
                return html_content
                
        except Exception as e:
            logger.error(f"Playwright error voor {url}: {e}")
            return None
    
    def scrape_all_categories(self, max_pages_per_category: int = 3) -> None:
        """
        Scrape alle geconfigureerde categorieën
        
        Args:
            max_pages_per_category: Maximum aantal pagina's per categorie
        """
        logger.info(f"Start scraping van {len(self.categories)} categorieën")
        
        all_product_urls = []
        
        # Verzamel alle product URLs
        for category in self.categories:
            logger.info(f"Scraping categorie: {category}")
            
            for page in range(1, max_pages_per_category + 1):
                product_urls = self.scrape_category_page(category, page)
                all_product_urls.extend(product_urls)
                
                # Stop als geen producten gevonden
                if not product_urls:
                    logger.info(f"Geen producten meer gevonden op pagina {page} voor {category}")
                    break
        
        # Remove duplicates
        unique_urls = list(set(all_product_urls))
        logger.info(f"Totaal {len(unique_urls)} unieke product URLs gevonden")
        
        # Scrape product details
        successful_scrapes = 0
        for i, url in enumerate(unique_urls, 1):
            logger.info(f"Scraping product {i}/{len(unique_urls)}: {url}")
            
            product_data = self.scrape_product_details(url)
            if product_data:
                self.scraped_products.append(product_data)
                successful_scrapes += 1
            
            # Progress logging elke 10 producten
            if i % 10 == 0:
                logger.info(f"Voortgang: {i}/{len(unique_urls)} producten verwerkt")
        
        logger.info(f"Scraping voltooid: {successful_scrapes} succesvol, {len(self.failed_urls)} gefaald")
    
    def clean_and_validate_data(self) -> None:
        """
        Clean en valideer de gescrapete data
        """
        logger.info("Data cleaning en validatie gestart")
        
        cleaned_products = []
        
        for product in self.scraped_products:
            # Valideer verplichte velden
            if not product.get('name') or not product.get('price'):
                logger.warning(f"Product overgeslagen: ontbrekende naam of prijs")
                continue
            
            # Clean price data
            if isinstance(product['price'], str):
                product['price'] = float(re.sub(r'[^\d.,]', '', product['price']).replace(',', '.'))
            
            # Ensure minimum required fields
            product.setdefault('brand', 'Onbekend')
            product.setdefault('category', 'Kleding')
            product.setdefault('description', f"{product['name']} van {product['brand']}")
            product.setdefault('sizes', [])
            product.setdefault('colors', [])
            product.setdefault('tags', ['fashion'])
            
            cleaned_products.append(product)
        
        self.scraped_products = cleaned_products
        logger.info(f"Data cleaning voltooid: {len(cleaned_products)} geldige producten")
    
    def export_to_json(self, filename: str = "zalandoProducts.json") -> None:
        """
        Exporteer gescrapete producten naar JSON bestand
        
        Args:
            filename: Naam van het output bestand
        """
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(self.scraped_products, f, ensure_ascii=False, indent=2)
            
            logger.info(f"Data geëxporteerd naar {filename}: {len(self.scraped_products)} producten")
            
        except Exception as e:
            logger.error(f"Error bij JSON export: {e}")
    
    def import_to_supabase(self, supabase_url: str, supabase_key: str) -> None:
        """
        Importeer producten naar Supabase database
        
        Args:
            supabase_url: Supabase project URL
            supabase_key: Supabase service role key
            
        Note:
            Vereist SUPABASE_URL en SUPABASE_SERVICE_ROLE_KEY environment variables
            of gebruik de parameters direct.
            
        Supabase table schema:
            CREATE TABLE products (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name TEXT NOT NULL,
                brand TEXT,
                price DECIMAL,
                original_price DECIMAL,
                image_url TEXT,
                product_url TEXT,
                retailer TEXT DEFAULT 'Zalando',
                category TEXT,
                description TEXT,
                sizes TEXT[],
                colors TEXT[],
                in_stock BOOLEAN DEFAULT true,
                rating DECIMAL,
                review_count INTEGER,
                tags TEXT[],
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        """
        if not SUPABASE_AVAILABLE:
            logger.warning("Supabase client niet beschikbaar. Gebruik pip install supabase")
            return
        
        try:
            # Initialiseer Supabase client
            supabase: Client = create_client(supabase_url, supabase_key)
            
            # Batch insert (Supabase heeft limiet van 1000 per batch)
            batch_size = 100
            successful_imports = 0
            
            for i in range(0, len(self.scraped_products), batch_size):
                batch = self.scraped_products[i:i + batch_size]
                
                try:
                    result = supabase.table('products').insert(batch).execute()
                    successful_imports += len(batch)
                    logger.info(f"Batch {i//batch_size + 1} geïmporteerd: {len(batch)} producten")
                    
                except Exception as e:
                    logger.error(f"Error bij batch import {i//batch_size + 1}: {e}")
            
            logger.info(f"Supabase import voltooid: {successful_imports} producten geïmporteerd")
            
        except Exception as e:
            logger.error(f"Supabase import error: {e}")
    
    def add_affiliate_links(self, affiliate_id: str = "fitfi-21") -> None:
        """
        Voeg affiliate parameters toe aan product URLs
        
        Args:
            affiliate_id: Jouw Zalando affiliate ID
            
        Note:
            Voor echte affiliate links heb je een Zalando Partner Network account nodig.
            Registreer op: https://www.zalando.nl/partner/
            
        Voorbeeld affiliate URL:
            https://www.zalando.nl/product.html?tag=fitfi-21&utm_source=fitfi&utm_medium=affiliate
        """
        logger.info(f"Affiliate links toevoegen met ID: {affiliate_id}")
        
        for product in self.scraped_products:
            original_url = product['product_url']
            
            # Voeg affiliate parameters toe
            separator = '&' if '?' in original_url else '?'
            affiliate_url = f"{original_url}{separator}tag={affiliate_id}&utm_source=fitfi&utm_medium=affiliate"
            
            product['product_url'] = affiliate_url
        
        logger.info("Affiliate links toegevoegd aan alle producten")

def main():
    """
    Hoofdfunctie voor het uitvoeren van de scraper
    """
    logger.info("=== Zalando Scraper Gestart ===")
    
    # Initialiseer scraper
    scraper = ZalandoScraper()
    
    try:
        # Scrape alle categorieën (max 2 pagina's per categorie voor demo)
        scraper.scrape_all_categories(max_pages_per_category=2)
        
        # Clean en valideer data
        scraper.clean_and_validate_data()
        
        # Voeg affiliate links toe (optioneel)
        # scraper.add_affiliate_links("jouw-affiliate-id")
        
        # Exporteer naar JSON
        scraper.export_to_json("zalandoProducts.json")
        
        # Optioneel: importeer naar Supabase
        # Uncomment en vul je Supabase credentials in:
        supabase_url = 'https://wojexzgjyhijuxzperhq.supabase.co'
        supabase_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvamV4emdqeWhpanV4enBlcmhxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDg1MzY0MCwiZXhwIjoyMDY2NDI5NjQwfQ.2vyS0H7lhXr2sa6TVfvaWV0mGqAuEZQ0F-j_IvHiOig'
        scraper.import_to_supabase(supabase_url, supabase_key)
        
        # Statistieken
        total_products = len(scraper.scraped_products)
        failed_urls = len(scraper.failed_urls)
        
        logger.info("=== Scraping Voltooid ===")
        logger.info(f"Totaal producten gescraped: {total_products}")
        logger.info(f"Gefaalde URLs: {failed_urls}")
        logger.info(f"Succes rate: {(total_products / (total_products + failed_urls) * 100):.1f}%")
        
        if scraper.failed_urls:
            logger.info("Gefaalde URLs:")
            for url in scraper.failed_urls[:5]:  # Toon eerste 5
                logger.info(f"  - {url}")
        
    except KeyboardInterrupt:
        logger.info("Scraping onderbroken door gebruiker")
    except Exception as e:
        logger.error(f"Onverwachte error: {e}")
    finally:
        logger.info("Scraper afgesloten")

if __name__ == "__main__":
    main()

"""
=== SUPABASE IMPORT INSTRUCTIES ===

1. Via Python (aanbevolen):
   - Installeer: pip install supabase
   - Uncomment de import_to_supabase call in main()
   - Zet environment variables:
     export SUPABASE_URL="https://your-project.supabase.co"
     export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

2. Via Supabase Dashboard:
   - Ga naar Table Editor > products table
   - Klik "Insert" > "Import data"
   - Upload zalandoProducts.json
   - Map de JSON velden naar table columns

3. Via Bash/curl script:
   #!/bin/bash
   SUPABASE_URL="https://your-project.supabase.co"
   SUPABASE_KEY="your-service-role-key"
   
   curl -X POST "$SUPABASE_URL/rest/v1/products" \
     -H "apikey: $SUPABASE_KEY" \
     -H "Authorization: Bearer $SUPABASE_KEY" \
     -H "Content-Type: application/json" \
     -d @zalandoProducts.json

4. Via Node.js/JavaScript:
   const { createClient } = require('@supabase/supabase-js')
   const products = require('./zalandoProducts.json')
   
   const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
   
   async function importProducts() {
     const { data, error } = await supabase
       .from('products')
       .insert(products)
     
     if (error) console.error('Error:', error)
     else console.log('Imported:', data.length, 'products')
   }

=== CRON SCHEDULING VOORBEELDEN ===

# Dagelijks om 3:00 AM (aanbevolen voor verse data)
0 3 * * * cd /path/to/scraper && /usr/bin/python3 zalando_scraper.py

# Wekelijks op zondag om 2:00 AM (voor minder frequente updates)
0 2 * * 0 cd /path/to/scraper && /usr/bin/python3 zalando_scraper.py

# Elke 6 uur (voor real-time updates)
0 */6 * * * cd /path/to/scraper && /usr/bin/python3 zalando_scraper.py

# Met logging naar specifiek bestand
0 3 * * * cd /path/to/scraper && /usr/bin/python3 zalando_scraper.py >> /var/log/zalando_scraper.log 2>&1

=== AFFILIATE MARKETING SETUP ===

1. Registreer bij Zalando Partner Network:
   https://www.zalando.nl/partner/

2. Krijg je affiliate ID (bijv. "fitfi-21")

3. Uncomment de add_affiliate_links call in main()

4. Alle product URLs krijgen automatisch affiliate parameters:
   ?tag=jouw-id&utm_source=fitfi&utm_medium=affiliate

5. Verdien commissie op elke verkoop via jouw links!

=== TROUBLESHOOTING ===

- Als je 403/429 errors krijgt: verhoog de delays in __init__
- Voor JavaScript-heavy pagina's: installeer playwright
- Voor Supabase errors: check je credentials en table schema
- Voor memory issues: verlaag max_pages_per_category

"""