#!/usr/bin/env python3
"""
Wehkamp Playwright Scraper - Production Ready
=============================================

Een complete Playwright-gebaseerde scraper voor Wehkamp.nl producten.

Dependencies:
    pip install playwright beautifulsoup4 requests fake-useragent
    playwright install chromium

Gebruik:
    python wehkamp_scraper.py

Features:
- Playwright headless browser voor JavaScript rendering
- Extractie van titel, prijs, URL, afbeelding per product
- JSON export naar wehkamp_products.json
- Uitgebreide foutafhandeling en logging
- Anti-bot protection met delays en user-agent rotatie

Selectors:
- Productkaart: article[data-testid="product-card"]
- Titel: h3 binnen de kaart
- Prijs: [data-testid="price"]
- Link: <a> binnen de kaart
- Afbeelding: <img> binnen de kaart (src attribuut)
"""

import asyncio
import json
import logging
import random
import time
from datetime import datetime
from typing import List, Dict, Any, Optional
from urllib.parse import urljoin

from playwright.async_api import async_playwright, Browser, Page
from fake_useragent import UserAgent

# Logging configuratie
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('wehkamp_playwright_scraper.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


class WehkampPlaywrightScraper:
    """
    Playwright-gebaseerde scraper voor Wehkamp.nl producten.
    """
    
    def __init__(self):
        """
        Initialiseer de Wehkamp Playwright scraper.
        """
        self.base_url = "https://www.wehkamp.nl"
        self.ua = UserAgent()
        self.scraped_products = []
        self.failed_products = []
        
        # Anti-bot protection instellingen
        self.min_delay = 1.0
        self.max_delay = 2.5
        
        logger.info("Wehkamp Playwright Scraper geïnitialiseerd")
    
    async def setup_browser(self) -> Browser:
        """
        Setup Playwright browser met anti-detectie configuratie.
        
        Returns:
            Browser: Geconfigureerde Playwright browser instance.
        """
        playwright = await async_playwright().start()
        
        # Launch browser in headless mode
        browser = await playwright.chromium.launch(
            headless=True,
            args=[
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-blink-features=AutomationControlled'
            ]
        )
        
        logger.info("Playwright browser gestart (headless mode)")
        return browser
    
    async def create_page(self, browser: Browser) -> Page:
        """
        Creëer nieuwe pagina met anti-detectie configuratie.
        
        Args:
            browser (Browser): Playwright browser instance.
            
        Returns:
            Page: Geconfigureerde pagina instance.
        """
        context = await browser.new_context(
            user_agent=self.ua.random,
            viewport={'width': 1920, 'height': 1080},
            locale='nl-NL',
            timezone_id='Europe/Amsterdam'
        )
        
        page = await context.new_page()
        
        # Inject anti-detectie script
        await page.add_init_script("""
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined,
            });
        """)
        
        return page
    
    async def extract_product_data(self, product_element, page: Page) -> Optional[Dict[str, Any]]:
        """
        Extraheer product data van een product element.
        
        Args:
            product_element: Playwright element van product kaart.
            page (Page): Playwright pagina instance.
            
        Returns:
            Optional[Dict[str, Any]]: Product data of None bij failure.
        """
        try:
            # Titel extractie (h3 binnen de kaart)
            title_element = await product_element.query_selector('h3')
            title = await title_element.inner_text() if title_element else None
            
            if not title:
                # Fallback selectors voor titel
                title_selectors = [
                    '[data-testid="product-title"]',
                    '.product-title',
                    'h2',
                    'h4',
                    '.title'
                ]
                for selector in title_selectors:
                    title_element = await product_element.query_selector(selector)
                    if title_element:
                        title = await title_element.inner_text()
                        break
            
            # Prijs extractie
            price_element = await product_element.query_selector('[data-testid="price"]')
            price = await price_element.inner_text() if price_element else None
            
            if not price:
                # Fallback selectors voor prijs
                price_selectors = [
                    '.price',
                    '.product-price',
                    '[class*="price"]',
                    '.amount'
                ]
                for selector in price_selectors:
                    price_element = await product_element.query_selector(selector)
                    if price_element:
                        price = await price_element.inner_text()
                        break
            
            # URL extractie (a tag binnen de kaart)
            link_element = await product_element.query_selector('a')
            relative_url = await link_element.get_attribute('href') if link_element else None
            
            if relative_url:
                # Maak absolute URL
                if relative_url.startswith('/'):
                    product_url = urljoin(self.base_url, relative_url)
                else:
                    product_url = relative_url
            else:
                product_url = None
            
            # Afbeelding extractie (img binnen de kaart)
            img_element = await product_element.query_selector('img')
            image_url = None
            
            if img_element:
                # Probeer verschillende image attributen
                image_url = (await img_element.get_attribute('src') or 
                           await img_element.get_attribute('data-src') or
                           await img_element.get_attribute('data-lazy-src'))
                
                # Maak absolute URL voor afbeelding
                if image_url and image_url.startswith('/'):
                    image_url = urljoin(self.base_url, image_url)
            
            # Valideer dat we minimaal titel en prijs hebben
            if not title or not price:
                logger.warning(f"Product overgeslagen: ontbrekende titel ({title}) of prijs ({price})")
                return None
            
            # Clean price (verwijder extra tekst, behoud alleen prijs)
            if price:
                price = price.strip()
            
            product_data = {
                "title": title.strip() if title else "Onbekend Product",
                "price": price,
                "url": product_url,
                "image": image_url
            }
            
            logger.debug(f"Product extracted: {title} - {price}")
            return product_data
            
        except Exception as e:
            logger.error(f"Error extracting product data: {e}")
            return None
    
    async def scrape_category_page(self, page: Page, category_url: str, limit: int = 20) -> List[Dict[str, Any]]:
        """
        Scrape producten van een categorie pagina.
        
        Args:
            page (Page): Playwright pagina instance.
            category_url (str): URL van de categorie.
            limit (int): Maximum aantal producten om te scrapen.
            
        Returns:
            List[Dict[str, Any]]: List van product data.
        """
        logger.info(f"Scraping categorie: {category_url}")
        
        try:
            # Navigeer naar categorie pagina
            await page.goto(category_url, wait_until='domcontentloaded', timeout=30000)
            
            # Wacht op product grid
            await page.wait_for_selector('article[data-testid="product-card"]', timeout=15000)
            
            # Extra delay voor dynamic content
            await asyncio.sleep(random.uniform(2.0, 4.0))
            
            # Scroll om lazy loading te triggeren
            await page.evaluate("window.scrollTo(0, document.body.scrollHeight / 2)")
            await asyncio.sleep(1)
            await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            await asyncio.sleep(2)
            
            # Zoek alle product kaarten
            product_elements = await page.query_selector_all('article[data-testid="product-card"]')
            
            logger.info(f"Gevonden {len(product_elements)} product kaarten")
            
            if len(product_elements) == 0:
                # Fallback selectors als hoofdselector niet werkt
                fallback_selectors = [
                    '.product-card',
                    '.product-tile',
                    '.product-item',
                    '[data-testid="product-tile"]',
                    'article[class*="product"]'
                ]
                
                for selector in fallback_selectors:
                    product_elements = await page.query_selector_all(selector)
                    if product_elements:
                        logger.info(f"Fallback selector '{selector}' found {len(product_elements)} elements")
                        break
            
            # Debug: save page content als geen producten gevonden
            if len(product_elements) == 0:
                page_content = await page.content()
                debug_filename = f"debug_wehkamp_no_products_{int(time.time())}.html"
                with open(debug_filename, 'w', encoding='utf-8') as f:
                    f.write(page_content)
                logger.warning(f"Geen producten gevonden. HTML opgeslagen als {debug_filename}")
                return []
            
            # Extract product data
            products = []
            failed_count = 0
            
            for i, element in enumerate(product_elements[:limit]):
                try:
                    product_data = await self.extract_product_data(element, page)
                    
                    if product_data:
                        products.append(product_data)
                        logger.info(f"Product {len(products)}: {product_data['title']}")
                    else:
                        failed_count += 1
                        self.failed_products.append(f"Product {i+1}: extraction failed")
                    
                    # Delay tussen product extracties
                    await asyncio.sleep(random.uniform(0.1, 0.3))
                    
                except Exception as e:
                    logger.error(f"Error processing product {i+1}: {e}")
                    failed_count += 1
                    self.failed_products.append(f"Product {i+1}: {str(e)}")
            
            logger.info(f"Scraping voltooid: {len(products)} succesvol, {failed_count} gefaald")
            return products
            
        except Exception as e:
            logger.error(f"Error scraping category page: {e}")
            
            # Save debug HTML bij error
            try:
                page_content = await page.content()
                debug_filename = f"debug_wehkamp_error_{int(time.time())}.html"
                with open(debug_filename, 'w', encoding='utf-8') as f:
                    f.write(page_content)
                logger.info(f"Error debug HTML opgeslagen als {debug_filename}")
            except:
                pass
            
            return []
    
    async def scrape_wehkamp(self, category_url: str, limit: int = 20) -> List[Dict[str, Any]]:
        """
        Hoofdfunctie voor het scrapen van Wehkamp producten.
        
        Args:
            category_url (str): URL van de categorie om te scrapen.
            limit (int): Maximum aantal producten om te scrapen.
            
        Returns:
            List[Dict[str, Any]]: List van product data.
        """
        browser = None
        
        try:
            # Setup browser
            browser = await self.setup_browser()
            page = await self.create_page(browser)
            
            # Scrape producten
            products = await self.scrape_category_page(page, category_url, limit)
            
            self.scraped_products = products
            return products
            
        except Exception as e:
            logger.error(f"Scraping error: {e}")
            return []
        
        finally:
            if browser:
                await browser.close()
                logger.info("Browser gesloten")
    
    def export_to_json(self, filename: str = "wehkamp_products.json") -> None:
        """
        Exporteer gescrapete producten naar JSON bestand.
        
        Args:
            filename (str): Naam van het output bestand.
        """
        try:
            export_data = {
                "scraped_at": datetime.now().isoformat(),
                "total_products": len(self.scraped_products),
                "failed_products": len(self.failed_products),
                "products": self.scraped_products
            }
            
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(export_data, f, ensure_ascii=False, indent=2)
            
            logger.info(f"Data geëxporteerd naar {filename}: {len(self.scraped_products)} producten")
            
        except Exception as e:
            logger.error(f"Error bij JSON export: {e}")
    
    def print_summary(self) -> None:
        """
        Print samenvatting van scraping resultaten.
        """
        total_products = len(self.scraped_products)
        failed_count = len(self.failed_products)
        
        print(f"\n=== WEHKAMP SCRAPING RESULTATEN ===")
        print(f"Succesvol gescraped: {total_products} producten")
        print(f"Gefaalde extracties: {failed_count}")
        print(f"Output opgeslagen in: wehkamp_products.json")
        
        if total_products > 0:
            print(f"\nVoorbeeld producten:")
            for i, product in enumerate(self.scraped_products[:3], 1):
                print(f"{i}. {product['title']} - {product['price']}")
        
        if failed_count > 0:
            print(f"\nGefaalde extracties: {failed_count}")
            for failure in self.failed_products[:5]:
                print(f"  - {failure}")


async def main():
    """
    Hoofdfunctie voor het uitvoeren van de Wehkamp scraper.
    """
    logger.info("=== Wehkamp Playwright Scraper Gestart ===")
    
    # Initialiseer scraper
    scraper = WehkampPlaywrightScraper()
    
    try:
        # Scrape heren-kleding categorie
        category_url = "https://www.wehkamp.nl/heren-kleding/"
        products = await scraper.scrape_wehkamp(category_url, limit=20)
        
        # Exporteer naar JSON
        scraper.export_to_json("wehkamp_products.json")
        
        # Print resultaten
        scraper.print_summary()
        
        # Log samenvatting
        logger.info(f"Scraping voltooid: {len(products)} producten verzameld")
        
    except KeyboardInterrupt:
        logger.info("Scraping onderbroken door gebruiker")
    except Exception as e:
        logger.error(f"Onverwachte error: {e}")
    finally:
        logger.info("Scraper afgesloten")


if __name__ == "__main__":
    asyncio.run(main())