#!/usr/bin/env python3
"""
Robust Wehkamp Scraper - Production Ready
=========================================

Een complete, robuuste scraper voor Wehkamp.nl producten met:
- Automatische fallback van requests naar Playwright
- Correct UTF-8 debug HTML opslag (altijd als plaintext)
- Anti-bot protection en uitgebreide foutafhandeling
- Gestructureerde JSON output
- Stap-voor-stap logging

Dependencies:
    pip install requests beautifulsoup4 playwright fake-useragent
    playwright install chromium

Gebruik:
    python wehkamp_scraper.py

Features:
- Requests eerst proberen (sneller)
- Automatische Playwright fallback bij dynamische content
- Debug HTML altijd correct opgeslagen als UTF-8 text
- Uitgebreide logging van elke stap
- Robuuste error handling
- Gestructureerde JSON output

Output:
- wehkamp_products.json (product data)
- debug_wehkamp_[timestamp].html (debug HTML)
- wehkamp_scraper.log (logging)
"""

import asyncio
import json
import logging
import random
import re
import time
from datetime import datetime
from typing import List, Dict, Any, Optional, Tuple
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup
from fake_useragent import UserAgent

# Playwright import met fallback
try:
    from playwright.async_api import async_playwright, Browser, Page
    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    PLAYWRIGHT_AVAILABLE = False
    print("⚠️  Playwright niet beschikbaar. Installeer met: pip install playwright && playwright install chromium")

# Logging configuratie
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('wehkamp_scraper.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


class RobustWehkampScraper:
    """
    Robuuste Wehkamp scraper met automatische fallback van requests naar Playwright.
    """
    
    def __init__(self):
        """
        Initialiseer de scraper met anti-bot configuratie.
        """
        self.base_url = "https://www.wehkamp.nl"
        self.ua = UserAgent()
        self.session = requests.Session()
        self.scraped_products = []
        self.failed_extractions = []
        
        # Anti-bot protection instellingen
        self.min_delay = 1.0
        self.max_delay = 2.5
        self.max_retries = 3
        
        # Setup session headers
        self.setup_session_headers()
        
        logger.info("🚀 Robust Wehkamp Scraper geïnitialiseerd")
    
    def setup_session_headers(self) -> None:
        """
        Setup realistische headers voor de requests session.
        """
        self.session.headers.update({
            'User-Agent': self.ua.chrome,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'nl-NL,nl;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'Cache-Control': 'max-age=0',
            'DNT': '1'
        })
        logger.debug("📡 Session headers geconfigureerd")
    
    def save_debug_html(self, html_content: str, method: str = "requests") -> str:
        """
        Sla HTML content op als UTF-8 plaintext debug bestand.
        
        Args:
            html_content (str): HTML content om op te slaan
            method (str): Methode gebruikt (requests/playwright)
            
        Returns:
            str: Bestandsnaam van opgeslagen debug file
        """
        timestamp = int(time.time())
        filename = f"debug_wehkamp_{method}_{timestamp}.html"
        
        try:
            # Forceer UTF-8 encoding en plaintext opslag
            with open(filename, 'w', encoding='utf-8', newline='') as f:
                f.write(html_content)
            
            # Verificeer dat bestand correct is opgeslagen
            file_size = len(html_content.encode('utf-8'))
            
            # Test of bestand leesbaar is
            with open(filename, 'r', encoding='utf-8') as f:
                test_content = f.read()
                if len(test_content) != len(html_content):
                    logger.warning(f"⚠️  Bestand grootte mismatch: {len(test_content)} vs {len(html_content)}")
            
            logger.info(f"💾 Debug HTML opgeslagen: {filename} ({file_size:,} bytes, UTF-8 plaintext)")
            return filename
            
        except Exception as e:
            logger.error(f"❌ Error bij opslaan debug HTML: {e}")
            return ""
    
    def validate_html_content(self, html_content: str) -> Tuple[bool, str]:
        """
        Valideer of HTML content Wehkamp producten bevat.
        
        Args:
            html_content (str): HTML content om te valideren
            
        Returns:
            Tuple[bool, str]: (is_valid, reason)
        """
        if not html_content or len(html_content) < 1000:
            return False, f"HTML te kort: {len(html_content)} chars"
        
        # Check voor Wehkamp-specifieke content
        wehkamp_indicators = [
            'wehkamp',
            'product',
            'artikel',
            'prijs',
            '€',
            'data-testid'
        ]
        
        found_indicators = sum(1 for indicator in wehkamp_indicators 
                             if indicator.lower() in html_content.lower())
        
        if found_indicators < 3:
            return False, f"Onvoldoende Wehkamp indicators: {found_indicators}/6"
        
        # Check voor blocked/error pagina's
        blocked_indicators = [
            'access denied',
            'blocked',
            'captcha',
            'bot detection',
            'cloudflare',
            'security check'
        ]
        
        for indicator in blocked_indicators:
            if indicator.lower() in html_content.lower():
                return False, f"Blocked page detected: {indicator}"
        
        return True, f"Valid HTML: {len(html_content):,} chars, {found_indicators}/6 indicators"
    
    def scrape_with_requests(self, url: str) -> Tuple[Optional[str], Dict[str, Any]]:
        """
        Probeer scraping met requests (sneller).
        
        Args:
            url (str): URL om te scrapen
            
        Returns:
            Tuple[Optional[str], Dict[str, Any]]: (html_content, metadata)
        """
        logger.info(f"🌐 Probeer requests scraping: {url}")
        
        metadata = {
            'method': 'requests',
            'success': False,
            'status_code': None,
            'content_type': None,
            'content_length': 0,
            'error': None
        }
        
        try:
            # Anti-bot delay
            delay = random.uniform(self.min_delay, self.max_delay)
            logger.debug(f"⏱️  Anti-bot delay: {delay:.2f}s")
            time.sleep(delay)
            
            # Maak request
            response = self.session.get(url, timeout=30)
            
            metadata.update({
                'status_code': response.status_code,
                'content_type': response.headers.get('content-type', ''),
                'content_length': len(response.content)
            })
            
            logger.info(f"📊 Response: {response.status_code}, "
                       f"Content-Type: {response.headers.get('content-type', 'unknown')}, "
                       f"Size: {len(response.content):,} bytes")
            
            if response.status_code == 200:
                html_content = response.text
                
                # Valideer content
                is_valid, reason = self.validate_html_content(html_content)
                
                if is_valid:
                    metadata['success'] = True
                    logger.info(f"✅ Requests scraping succesvol: {reason}")
                    return html_content, metadata
                else:
                    metadata['error'] = f"Invalid content: {reason}"
                    logger.warning(f"⚠️  Requests content invalid: {reason}")
                    return html_content, metadata  # Return anyway voor debug
            else:
                metadata['error'] = f"HTTP {response.status_code}"
                logger.warning(f"⚠️  HTTP error: {response.status_code}")
                return None, metadata
                
        except requests.exceptions.RequestException as e:
            metadata['error'] = str(e)
            logger.error(f"❌ Requests error: {e}")
            return None, metadata
    
    async def scrape_with_playwright(self, url: str) -> Tuple[Optional[str], Dict[str, Any]]:
        """
        Scrape met Playwright (fallback voor dynamische content).
        
        Args:
            url (str): URL om te scrapen
            
        Returns:
            Tuple[Optional[str], Dict[str, Any]]: (html_content, metadata)
        """
        if not PLAYWRIGHT_AVAILABLE:
            logger.error("❌ Playwright niet beschikbaar")
            return None, {'method': 'playwright', 'success': False, 'error': 'Playwright not available'}
        
        logger.info(f"🎭 Playwright scraping: {url}")
        
        metadata = {
            'method': 'playwright',
            'success': False,
            'content_length': 0,
            'error': None
        }
        
        browser = None
        
        try:
            # Setup Playwright
            playwright = await async_playwright().start()
            
            browser = await playwright.chromium.launch(
                headless=True,
                args=[
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-blink-features=AutomationControlled'
                ]
            )
            
            context = await browser.new_context(
                user_agent=self.ua.chrome,
                viewport={'width': 1920, 'height': 1080},
                locale='nl-NL',
                timezone_id='Europe/Amsterdam'
            )
            
            page = await context.new_page()
            
            # Anti-detectie script
            await page.add_init_script("""
                Object.defineProperty(navigator, 'webdriver', {
                    get: () => undefined,
                });
            """)
            
            logger.info("🎭 Navigeren naar pagina...")
            
            # Navigeer naar pagina
            await page.goto(url, wait_until='domcontentloaded', timeout=60000)
            
            # Wacht op producten
            logger.info("⏳ Wachten op product content...")
            
            try:
                await page.wait_for_selector(
                    'article[data-testid="product-card"], .product-tile, .product-card',
                    timeout=30000
                )
                logger.info("✅ Product selectors gevonden")
            except:
                logger.warning("⚠️  Product selectors timeout - probeer anyway")
            
            # Extra delay voor dynamic content
            await asyncio.sleep(3)
            
            # Scroll om lazy loading te triggeren
            await page.evaluate("window.scrollTo(0, document.body.scrollHeight / 2)")
            await asyncio.sleep(2)
            await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            await asyncio.sleep(2)
            
            # Haal HTML op
            html_content = await page.content()
            
            metadata.update({
                'content_length': len(html_content),
                'success': True
            })
            
            logger.info(f"✅ Playwright scraping succesvol: {len(html_content):,} chars")
            
            return html_content, metadata
            
        except Exception as e:
            metadata['error'] = str(e)
            logger.error(f"❌ Playwright error: {e}")
            return None, metadata
            
        finally:
            if browser:
                await browser.close()
    
    def extract_products_from_html(self, html_content: str) -> List[Dict[str, Any]]:
        """
        Extract product data uit HTML content.
        
        Args:
            html_content (str): HTML content om te parsen
            
        Returns:
            List[Dict[str, Any]]: List van product data
        """
        logger.info("🔍 Extracting products from HTML...")
        
        soup = BeautifulSoup(html_content, 'html.parser')
        products = []
        
        # Wehkamp-specifieke selectors (gebaseerd op moderne e-commerce structuur)
        product_selectors = [
            'article[data-testid="product-card"]',
            'article[data-testid="product-tile"]',
            '.product-tile',
            '.product-card',
            '.product-item',
            'article[class*="product"]',
            '[data-testid*="product"]'
        ]
        
        product_elements = []
        
        # Probeer elke selector
        for selector in product_selectors:
            elements = soup.select(selector)
            if elements:
                logger.info(f"✅ Gevonden {len(elements)} elementen met selector: {selector}")
                product_elements = elements
                break
            else:
                logger.debug(f"❌ Geen elementen met selector: {selector}")
        
        if not product_elements:
            logger.warning("⚠️  Geen product elementen gevonden met bekende selectors")
            # Debug: zoek naar alle article tags
            all_articles = soup.find_all('article')
            logger.info(f"🔍 Debug: Gevonden {len(all_articles)} article tags totaal")
            
            # Debug: zoek naar links met /p/ of /product/
            all_product_links = soup.find_all('a', href=re.compile(r'/(p|product)/'))
            logger.info(f"🔍 Debug: Gevonden {len(all_product_links)} links met /p/ of /product/")
            
            return []
        
        # Extract data van elk product element
        for i, element in enumerate(product_elements[:20], 1):  # Limit tot 20 voor test
            try:
                product_data = self.extract_single_product(element, i)
                if product_data:
                    products.append(product_data)
                    logger.info(f"✅ Product {len(products)}: {product_data['title'][:50]}...")
                else:
                    self.failed_extractions.append(f"Product {i}: extraction failed")
                    
            except Exception as e:
                logger.error(f"❌ Error extracting product {i}: {e}")
                self.failed_extractions.append(f"Product {i}: {str(e)}")
        
        logger.info(f"🎯 Extraction voltooid: {len(products)} producten, {len(self.failed_extractions)} failures")
        return products
    
    def extract_single_product(self, element, index: int) -> Optional[Dict[str, Any]]:
        """
        Extract data van een enkel product element.
        
        Args:
            element: BeautifulSoup element
            index (int): Product index voor debugging
            
        Returns:
            Optional[Dict[str, Any]]: Product data of None
        """
        try:
            # Titel extractie
            title = None
            title_selectors = ['h3', 'h2', 'h4', '[data-testid="product-title"]', '.product-title', '.title']
            
            for selector in title_selectors:
                title_elem = element.select_one(selector)
                if title_elem:
                    title = title_elem.get_text(strip=True)
                    break
            
            if not title:
                logger.debug(f"❌ Product {index}: Geen titel gevonden")
                return None
            
            # Prijs extractie
            price = None
            price_selectors = [
                '[data-testid="price"]',
                '.price',
                '.product-price',
                '[class*="price"]',
                '.amount'
            ]
            
            for selector in price_selectors:
                price_elem = element.select_one(selector)
                if price_elem:
                    price_text = price_elem.get_text(strip=True)
                    # Clean price text
                    price = re.sub(r'[^\d,.-]', '', price_text).replace(',', '.')
                    break
            
            if not price:
                logger.debug(f"❌ Product {index}: Geen prijs gevonden")
                return None
            
            # URL extractie
            url = None
            link_elem = element.select_one('a')
            if link_elem:
                href = link_elem.get('href')
                if href:
                    if href.startswith('/'):
                        url = urljoin(self.base_url, href)
                    else:
                        url = href
            
            if not url:
                logger.debug(f"❌ Product {index}: Geen URL gevonden")
                return None
            
            # Afbeelding extractie
            image = None
            img_elem = element.select_one('img')
            if img_elem:
                image_src = (img_elem.get('src') or 
                           img_elem.get('data-src') or 
                           img_elem.get('data-lazy-src'))
                
                if image_src:
                    if image_src.startswith('/'):
                        image = urljoin(self.base_url, image_src)
                    else:
                        image = image_src
            
            # Brand extractie (optioneel)
            brand = None
            brand_selectors = ['.brand', '.product-brand', '[data-testid="brand"]']
            for selector in brand_selectors:
                brand_elem = element.select_one(selector)
                if brand_elem:
                    brand = brand_elem.get_text(strip=True)
                    break
            
            product_data = {
                "title": title,
                "price": price,
                "url": url,
                "image": image,
                "brand": brand or "Onbekend",
                "retailer": "Wehkamp",
                "category": "Heren Kleding",
                "scraped_at": datetime.now().isoformat()
            }
            
            return product_data
            
        except Exception as e:
            logger.error(f"❌ Error extracting product {index}: {e}")
            return None
    
    def export_to_json(self, filename: str = "wehkamp_products.json") -> None:
        """
        Export products naar JSON bestand.
        
        Args:
            filename (str): Output bestandsnaam
        """
        try:
            export_data = {
                "scraped_at": datetime.now().isoformat(),
                "total_products": len(self.scraped_products),
                "failed_extractions": len(self.failed_extractions),
                "products": self.scraped_products,
                "failures": self.failed_extractions
            }
            
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(export_data, f, ensure_ascii=False, indent=2)
            
            logger.info(f"💾 Data geëxporteerd naar {filename}: {len(self.scraped_products)} producten")
            
        except Exception as e:
            logger.error(f"❌ Error bij JSON export: {e}")
    
    async def scrape_wehkamp_category(self, url: str) -> List[Dict[str, Any]]:
        """
        Scrape Wehkamp categorie met automatische fallback.
        
        Args:
            url (str): Categorie URL om te scrapen
            
        Returns:
            List[Dict[str, Any]]: Gescrapete producten
        """
        logger.info(f"🎯 Start scraping: {url}")
        
        html_content = None
        final_metadata = {}
        
        # STAP 1: Probeer eerst requests (sneller)
        html_content, requests_metadata = self.scrape_with_requests(url)
        
        if html_content and requests_metadata['success']:
            logger.info("✅ Requests scraping succesvol")
            final_metadata = requests_metadata
        else:
            logger.warning("⚠️  Requests scraping gefaald, fallback naar Playwright...")
            
            # STAP 2: Fallback naar Playwright
            html_content, playwright_metadata = await self.scrape_with_playwright(url)
            final_metadata = playwright_metadata
            
            if not html_content:
                logger.error("❌ Beide scraping methoden gefaald")
                return []
        
        # STAP 3: Sla debug HTML op (altijd)
        if html_content:
            debug_filename = self.save_debug_html(html_content, final_metadata['method'])
            logger.info(f"💾 Debug HTML: {debug_filename}")
        
        # STAP 4: Extract producten
        if html_content:
            products = self.extract_products_from_html(html_content)
            self.scraped_products = products
            
            # STAP 5: Export naar JSON
            if products:
                self.export_to_json()
                logger.info(f"🎉 Scraping voltooid: {len(products)} producten gevonden")
            else:
                logger.warning("⚠️  Geen producten gevonden - check debug HTML")
            
            return products
        
        return []
    
    def print_summary(self) -> None:
        """
        Print samenvatting van scraping resultaten.
        """
        total_products = len(self.scraped_products)
        failed_count = len(self.failed_extractions)
        
        print(f"\n{'='*50}")
        print(f"🎯 WEHKAMP SCRAPING RESULTATEN")
        print(f"{'='*50}")
        print(f"✅ Succesvol gescraped: {total_products} producten")
        print(f"❌ Gefaalde extracties: {failed_count}")
        print(f"📁 Output opgeslagen in: wehkamp_products.json")
        print(f"🐛 Debug HTML beschikbaar voor analyse")
        
        if total_products > 0:
            print(f"\n📦 Voorbeeld producten:")
            for i, product in enumerate(self.scraped_products[:3], 1):
                print(f"  {i}. {product['title'][:60]}...")
                print(f"     💰 {product['price']}")
                print(f"     🔗 {product['url'][:80]}...")
        
        if failed_count > 0:
            print(f"\n❌ Gefaalde extracties: {failed_count}")
            for failure in self.failed_extractions[:3]:
                print(f"  - {failure}")
        
        print(f"{'='*50}")


async def main():
    """
    Hoofdfunctie voor het uitvoeren van de Wehkamp scraper.
    """
    logger.info("🚀 === Robust Wehkamp Scraper Gestart ===")
    
    # Initialiseer scraper
    scraper = RobustWehkampScraper()
    
    try:
        # Test URL: Heren kleding categorie
        test_url = "https://www.wehkamp.nl/heren-kleding/"
        
        # Scrape producten
        products = await scraper.scrape_wehkamp_category(test_url)
        
        # Print resultaten
        scraper.print_summary()
        
        # Console output voor directe feedback
        if products:
            print(f"\n🎉 SUCCESS: {len(products)} producten gevonden!")
            print(f"📄 Check wehkamp_products.json voor volledige data")
        else:
            print(f"\n⚠️  GEEN PRODUCTEN GEVONDEN")
            print(f"🐛 Check debug HTML bestanden voor analyse")
        
    except KeyboardInterrupt:
        logger.info("⏹️  Scraping onderbroken door gebruiker")
    except Exception as e:
        logger.error(f"💥 Onverwachte error: {e}")
    finally:
        logger.info("🏁 Scraper afgesloten")


if __name__ == "__main__":
    # Direct uitvoerbaar script
    asyncio.run(main())