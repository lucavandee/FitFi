#!/usr/bin/env python3
"""
Wehkamp Scraper - Production Ready
==================================

Een complete, robuuste scraper voor Wehkamp.nl producten met:
- Anti-bot protection (user-agent rotatie, delays, retries)
- Modulaire opbouw voor onderhoud
- JSON export in FitFi-compatible format
- Uitgebreide logging en error handling

Gebruik:
    python wehkamp_scraper.py

Cron scheduling voorbeeld:
    # Dagelijks om 3:00 AM
    0 3 * * * /usr/bin/python3 /path/to/wehkamp_scraper.py >> /var/log/wehkamp_scraper.log 2>&1
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

# Logging configuratie
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('wehkamp_scraper.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


class WehkampScraper:
    """
    Hoofdklasse voor Wehkamp product scraping
    
    Features:
    - Anti-bot protection met user-agent rotatie
    - Retry mechanisme voor failed requests
    - Modulaire functies voor verschillende scraping taken
    - JSON export in FitFi-compatible format
    """
    
    def __init__(self):
        self.base_url = "https://www.wehkamp.nl"
        self.session = requests.Session()
        self.ua = UserAgent()
        self.scraped_products = []
        self.failed_urls = []
        
        # Anti-bot protection instellingen
        self.min_delay = 1.0  # Minimum delay tussen requests (seconden)
        self.max_delay = 2.5  # Maximum delay tussen requests
        self.max_retries = 3  # Maximum aantal retries per request
        
        # Wehkamp categorieën om te scrapen
        self.categories = [
            "herenmode-jassen",
            "herenmode-truien-vesten",
            "herenmode-overhemden",
            "herenmode-broeken",
            "herenmode-schoenen",
            "damesmode-jassen",
            "damesmode-truien-vesten",
            "damesmode-jurken",
            "damesmode-broeken",
            "damesmode-schoenen"
        ]
        
        logger.info("Wehkamp Scraper geïnitialiseerd")
    
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
            'Cache-Control': 'max-age=0',
            'DNT': '1'
        }
    
    def make_request(self, url: str, retries: int = 0) -> Optional[requests.Response]:
        """
        Maak een HTTP request met retry logica en anti-bot protection
        
        Args:
            url: URL om te scrapen
            retries: Aantal retries al geprobeerd
            
        Returns:
            Response object of None bij failure
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
            response = self.session.get(url, headers=headers, timeout=15)
            
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
        """
        Scrape een categorie pagina voor product URLs
        
        Args:
            category: Categorie naam
            page: Pagina nummer
            
        Returns:
            List van product URLs
        """
        url = f"{self.base_url}/{category}/?page={page}"
        logger.info(f"Scraping categorie pagina: {url}")
        
        response = self.make_request(url)
        if not response:
            return []
        
        soup = BeautifulSoup(response.content, 'html.parser')
        product_urls = []
        
        # Verschillende selectors voor Wehkamp product links
        selectors = [
            'a[href*="/product/"]',
            'a[data-testid="product-link"]',
            '.product-item a',
            '.product-card a',
            'article a[href*="/product/"]',
            '[data-testid="product-item"] a'
        ]
        
        for selector in selectors:
            links = soup.select(selector)
            for link in links:
                href = link.get('href')
                if href and '/product/' in href:
                    full_url = urljoin(self.base_url, href)
                    if full_url not in product_urls:
                        product_urls.append(full_url)
        
        logger.info(f"Gevonden {len(product_urls)} product URLs op pagina {page}")
        
        # Debug: save page content als we weinig URLs vinden
        if len(product_urls) == 0:
            debug_file = f'debug_wehkamp_{category}_p{page}.html'
            with open(debug_file, 'w', encoding='utf-8') as f:
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
        
        # Verschillende selectors voor prijzen op Wehkamp
        price_selectors = [
            '.price-current',
            '.price-now',
            '[data-testid="price-current"]',
            '.product-price .current',
            '.price .current',
            '.price-value'
        ]
        
        original_price_selectors = [
            '.price-original',
            '.price-was',
            '[data-testid="price-original"]',
            '.product-price .original',
            '.price .original',
            '.price-old'
        ]
        
        # Zoek huidige prijs
        for selector in price_selectors:
            price_elem = soup.select_one(selector)
            if price_elem:
                price_text = price_elem.get_text(strip=True)
                # Extraheer numerieke waarde
                price_match = re.search(r'(\d+(?:,\d{2})?)', price_text.replace('€', '').replace('.', ''))
                if price_match:
                    current_price = float(price_match.group(1).replace(',', '.'))
                    break
        
        # Zoek originele prijs (bij sale items)
        for selector in original_price_selectors:
            price_elem = soup.select_one(selector)
            if price_elem:
                price_text = price_elem.get_text(strip=True)
                price_match = re.search(r'(\d+(?:,\d{2})?)', price_text.replace('€', '').replace('.', ''))
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
        
        # Verschillende selectors voor afbeeldingen op Wehkamp
        img_selectors = [
            '.product-images img',
            '.product-gallery img',
            '[data-testid="product-image"] img',
            '.product-media img',
            '.hero-image img',
            '.main-image img'
        ]
        
        for selector in img_selectors:
            img_elements = soup.select(selector)
            for img in img_elements:
                src = img.get('src') or img.get('data-src') or img.get('data-lazy-src')
                if src and ('http' in src or src.startswith('//')):
                    # Maak absolute URL
                    if src.startswith('//'):
                        src = 'https:' + src
                    elif src.startswith('/'):
                        src = urljoin(self.base_url, src)
                    images.append(src)
        
        return list(set(images))  # Remove duplicates
    
    def extract_brand_and_title(self, soup: BeautifulSoup) -> tuple[str, str]:
        """
        Extraheer merk en titel van product
        
        Args:
            soup: BeautifulSoup object van product pagina
            
        Returns:
            Tuple van (brand, title)
        """
        # Titel selectors
        title_selectors = [
            'h1',
            '[data-testid="product-title"]',
            '.product-title',
            '.product-name',
            '.pdp-title'
        ]
        
        title = "Onbekend Product"
        for selector in title_selectors:
            title_elem = soup.select_one(selector)
            if title_elem:
                title = title_elem.get_text(strip=True)
                break
        
        # Merk selectors
        brand_selectors = [
            '[data-testid="product-brand"]',
            '.product-brand',
            '.brand-name',
            '.pdp-brand',
            '.manufacturer'
        ]
        
        brand = "Onbekend Merk"
        for selector in brand_selectors:
            brand_elem = soup.select_one(selector)
            if brand_elem:
                brand = brand_elem.get_text(strip=True)
                break
        
        # Als merk niet gevonden, probeer uit titel te extraheren
        if brand == "Onbekend Merk" and title:
            # Veel merken staan aan het begin van de titel
            title_words = title.split()
            if title_words:
                potential_brand = title_words[0]
                # Check of het een bekend merk lijkt (begint met hoofdletter)
                if potential_brand and potential_brand[0].isupper():
                    brand = potential_brand
        
        return brand, title
    
    def extract_category_from_url(self, url: str) -> str:
        """
        Extraheer categorie uit URL
        
        Args:
            url: Product of categorie URL
            
        Returns:
            Categorie naam
        """
        if 'herenmode-jassen' in url:
            return 'Heren Jassen'
        elif 'herenmode-truien' in url:
            return 'Heren Truien'
        elif 'herenmode-overhemden' in url:
            return 'Heren Overhemden'
        elif 'herenmode-broeken' in url:
            return 'Heren Broeken'
        elif 'herenmode-schoenen' in url:
            return 'Heren Schoenen'
        elif 'damesmode-jassen' in url:
            return 'Dames Jassen'
        elif 'damesmode-truien' in url:
            return 'Dames Truien'
        elif 'damesmode-jurken' in url:
            return 'Dames Jurken'
        elif 'damesmode-broeken' in url:
            return 'Dames Broeken'
        elif 'damesmode-schoenen' in url:
            return 'Dames Schoenen'
        else:
            return 'Kleding'
    
    def scrape_product_details(self, product_url: str, category: str = "") -> Optional[Dict[str, Any]]:
        """
        Scrape gedetailleerde product informatie van een product pagina
        
        Args:
            product_url: URL van het product
            category: Categorie van het product
            
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
            brand, title = self.extract_brand_and_title(soup)
            
            # Prijzen
            current_price, original_price = self.extract_price(soup)
            
            # Afbeeldingen
            images = self.extract_images(soup)
            main_image = images[0] if images else ""
            
            # Categorie bepalen
            if not category:
                category = self.extract_category_from_url(product_url)
            
            # Beschrijving
            desc_selectors = [
                '[data-testid="product-description"]',
                '.product-description',
                '.description',
                '.product-details',
                '.pdp-description'
            ]
            description = ""
            for selector in desc_selectors:
                desc_elem = soup.select_one(selector)
                if desc_elem:
                    description = desc_elem.get_text(strip=True)
                    break
            
            # Fallback beschrijving
            if not description:
                description = f"{title} van {brand}"
            
            # Voorraadstatus
            in_stock = True
            stock_indicators = soup.select('.out-of-stock, .not-available, [data-testid="out-of-stock"]')
            if stock_indicators or 'uitverkocht' in response.text.lower():
                in_stock = False
            
            # Tags genereren
            tags = []
            if original_price > current_price:
                tags.append("sale")
            if brand.lower() in ["nike", "adidas", "puma", "under armour"]:
                tags.append("sport")
            if "premium" in description.lower() or "luxury" in description.lower():
                tags.append("premium")
            if not tags:
                tags = ["fashion", "style"]
            
            # Product data samenstellen (compatible met FitFi format)
            product_data = {
                "id": str(uuid.uuid4()),
                "title": title,  # Wehkamp gebruikt 'title' ipv 'name'
                "brand": brand,
                "price": str(current_price) if current_price > 0 else "0",  # Als string voor compatibility
                "original_price": original_price if original_price > current_price else current_price,
                "image": main_image,  # Wehkamp gebruikt 'image' ipv 'image_url'
                "link": product_url,  # Wehkamp gebruikt 'link' ipv 'product_url'
                "category": category,
                "description": description[:500] if description else f"{title} van {brand}",
                "images": images,
                "in_stock": in_stock,
                "retailer": "Wehkamp",
                "tags": tags,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
            
            logger.debug(f"Product gescraped: {title} - €{current_price}")
            return product_data
            
        except Exception as e:
            logger.error(f"Error bij scrapen product {product_url}: {e}")
            return None
    
    def scrape_wehkamp(self, category_url: str, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Scrape producten van een specifieke Wehkamp categorie
        
        Args:
            category_url: URL van de categorie
            limit: Maximum aantal producten om te scrapen
            
        Returns:
            List van product dictionaries
        """
        logger.info(f"Start scraping van {category_url} (limit: {limit})")
        
        products = []
        page = 1
        max_pages = 5  # Veiligheidsgrens
        
        # Extraheer categorie naam uit URL
        category = self.extract_category_from_url(category_url)
        
        while len(products) < limit and page <= max_pages:
            # Scrape categorie pagina
            if page == 1:
                page_url = category_url
            else:
                page_url = f"{category_url}?page={page}"
            
            product_urls = self.scrape_category_page(
                category_url.replace(self.base_url + '/', '').rstrip('/'),
                page
            )
            
            if not product_urls:
                logger.info(f"Geen producten meer gevonden op pagina {page}")
                break
            
            # Scrape product details
            for url in product_urls:
                if len(products) >= limit:
                    break
                
                product_data = self.scrape_product_details(url, category)
                if product_data:
                    products.append(product_data)
                    logger.info(f"Product {len(products)}/{limit}: {product_data['title']}")
            
            page += 1
        
        logger.info(f"Scraping voltooid: {len(products)} producten verzameld")
        return products
    
    def scrape_all_categories(self, max_pages_per_category: int = 2, max_products_per_category: int = 25) -> None:
        """
        Scrape alle geconfigureerde categorieën
        
        Args:
            max_pages_per_category: Maximum aantal pagina's per categorie
            max_products_per_category: Maximum aantal producten per categorie
        """
        logger.info(f"Start scraping van {len(self.categories)} categorieën")
        
        for category in self.categories:
            logger.info(f"Scraping categorie: {category}")
            
            category_url = f"{self.base_url}/{category}/"
            category_products = self.scrape_wehkamp(category_url, max_products_per_category)
            
            self.scraped_products.extend(category_products)
            
            logger.info(f"Categorie {category} voltooid: {len(category_products)} producten")
        
        logger.info(f"Alle categorieën voltooid: {len(self.scraped_products)} totaal producten")
    
    def clean_and_validate_data(self) -> None:
        """
        Clean en valideer de gescrapete data
        """
        logger.info("Data cleaning en validatie gestart")
        
        cleaned_products = []
        
        for product in self.scraped_products:
            # Valideer verplichte velden
            if not product.get('title') or not product.get('price'):
                logger.warning(f"Product overgeslagen: ontbrekende titel of prijs")
                continue
            
            # Clean price data
            if isinstance(product['price'], str):
                # Verwijder alle non-numerieke karakters behalve punt en komma
                clean_price = re.sub(r'[^\d.,]', '', product['price'])
                if clean_price:
                    try:
                        product['price'] = str(float(clean_price.replace(',', '.')))
                    except ValueError:
                        product['price'] = "0"
                else:
                    product['price'] = "0"
            
            # Ensure minimum required fields
            product.setdefault('brand', 'Onbekend')
            product.setdefault('category', 'Kleding')
            product.setdefault('description', f"{product['title']} van {product['brand']}")
            product.setdefault('tags', ['fashion'])
            product.setdefault('retailer', 'Wehkamp')
            
            cleaned_products.append(product)
        
        self.scraped_products = cleaned_products
        logger.info(f"Data cleaning voltooid: {len(cleaned_products)} geldige producten")
    
    def export_to_json(self, filename: str = "wehkamp_products.json") -> None:
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


def main():
    """
    Hoofdfunctie voor het uitvoeren van de scraper
    """
    logger.info("=== Wehkamp Scraper Gestart ===")
    
    # Initialiseer scraper
    scraper = WehkampScraper()
    
    try:
        # Test met één categorie (herenmode-jassen)
        test_category_url = "https://www.wehkamp.nl/herenmode-jassen/"
        
        logger.info(f"Test scraping van: {test_category_url}")
        products = scraper.scrape_wehkamp(test_category_url, limit=20)
        
        # Sla producten op in scraper voor export
        scraper.scraped_products = products
        
        # Clean en valideer data
        scraper.clean_and_validate_data()
        
        # Exporteer naar JSON
        scraper.export_to_json("wehkamp_products.json")
        
        # Toon voorbeeldproducten
        logger.info("=== Voorbeeldproducten ===")
        for i, product in enumerate(scraper.scraped_products[:5], 1):
            logger.info(f"{i}. ID: {product['id']}")
            logger.info(f"   Titel: {product['title']}")
            logger.info(f"   Prijs: €{product['price']}")
            logger.info(f"   Merk: {product['brand']}")
            logger.info(f"   Categorie: {product['category']}")
            logger.info(f"   Link: {product['link']}")
            logger.info("   ---")
        
        # Statistieken
        total_products = len(scraper.scraped_products)
        failed_urls = len(scraper.failed_urls)
        
        logger.info("=== Scraping Voltooid ===")
        logger.info(f"Totaal producten gescraped: {total_products}")
        logger.info(f"Gefaalde URLs: {failed_urls}")
        
        if total_products + failed_urls > 0:
            success_rate = (total_products / (total_products + failed_urls) * 100)
            logger.info(f"Success rate: {success_rate:.1f}%")
        else:
            logger.info("Success rate: 0% (geen data gevonden)")
        
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

# --- END OF FILE ---

"""
=== WEHKAMP SCRAPER GEBRUIKSINSTRUCTIES ===

1. Basis gebruik:
   python wehkamp_scraper.py

2. Programmatisch gebruik:
   from wehkamp_scraper import WehkampScraper
   
   scraper = WehkampScraper()
   products = scraper.scrape_wehkamp("https://www.wehkamp.nl/herenmode-jassen/", limit=50)
   scraper.export_to_json("my_products.json")

3. Output formaat (compatible met FitFi):
   {
     "id": "uuid",
     "title": "Product naam",
     "brand": "Merknaam", 
     "price": "99.99",
     "image": "https://...",
     "link": "https://...",
     "category": "Heren Jassen",
     "description": "...",
     "retailer": "Wehkamp",
     "tags": ["fashion", "sale"],
     "created_at": "2025-01-27T...",
     "updated_at": "2025-01-27T..."
   }

4. Beschikbare categorieën:
   - herenmode-jassen
   - herenmode-truien-vesten  
   - herenmode-overhemden
   - herenmode-broeken
   - herenmode-schoenen
   - damesmode-jassen
   - damesmode-truien-vesten
   - damesmode-jurken
   - damesmode-broeken
   - damesmode-schoenen

5. Throttling:
   - Automatische delays tussen 1.0-2.5 seconden
   - Rate limiting protection
   - Retry logica bij failures

6. Error handling:
   - Graceful handling van missende velden
   - Logging van failed URLs
   - Fallback waardes voor ontbrekende data

=== INTEGRATIE MET FITFI ===

De output is direct compatible met de bestaande FitFi product structuur.
Gebruik dezelfde import procedures als voor zalando_scraper.py.
"""