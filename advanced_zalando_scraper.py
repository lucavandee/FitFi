#!/usr/bin/env python3
"""
Advanced Zalando Scraper - Anti-Bot Bypass
==========================================

Een geavanceerde Playwright-based scraper die Zalando's anti-bot detectie omzeilt:
- Stealth-modus met menselijke browser fingerprint
- Echte Chrome User-Agent en browser eigenschappen
- Cookies en localStorage simulatie
- Mouse movement en human-like delays
- Retry-logica voor CAPTCHA/detectie pagina's
- Complete anti-detectie strategie

Gebruik:
    python advanced_zalando_scraper.py
"""

import asyncio
import logging
import random
import time
import json
import re
from datetime import datetime
from typing import List, Dict, Optional, Any
from urllib.parse import urljoin, urlparse

from playwright.async_api import async_playwright, Browser, BrowserContext, Page
from playwright.async_api import TimeoutError as PlaywrightTimeoutError

# Logging configuratie
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('zalando_stealth_scraper.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


class ZalandoStealthScraper:
    """
    Geavanceerde Zalando scraper met anti-bot bypass technieken
    """
    
    def __init__(self):
        self.base_url = "https://www.zalando.nl"
        self.browser: Optional[Browser] = None
        self.context: Optional[BrowserContext] = None
        self.page: Optional[Page] = None
        
        # Anti-detectie configuratie
        self.user_agents = [
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        ]
        
        # Viewport variaties voor natuurlijk gedrag
        self.viewports = [
            {"width": 1920, "height": 1080},
            {"width": 1366, "height": 768},
            {"width": 1440, "height": 900},
            {"width": 1536, "height": 864}
        ]
        
        # Timezones voor realistische locatie
        self.timezones = [
            "Europe/Amsterdam",
            "Europe/Brussels", 
            "Europe/Berlin"
        ]
        
        logger.info("Zalando Stealth Scraper geïnitialiseerd")
    
    async def setup_stealth_browser(self) -> None:
        """
        Setup browser met complete anti-detectie configuratie
        """
        logger.info("Setting up stealth browser...")
        
        playwright = await async_playwright().start()
        
        # Selecteer random configuratie voor natuurlijk gedrag
        user_agent = random.choice(self.user_agents)
        viewport = random.choice(self.viewports)
        timezone = random.choice(self.timezones)
        
        logger.info(f"Using User-Agent: {user_agent}")
        logger.info(f"Using Viewport: {viewport}")
        logger.info(f"Using Timezone: {timezone}")
        
        # Launch browser met stealth opties
        self.browser = await playwright.chromium.launch(
            headless=False,
            args=[
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu',
                '--disable-background-timer-throttling',
                '--disable-backgrounding-occluded-windows',
                '--disable-renderer-backgrounding',
                '--disable-features=TranslateUI',
                '--disable-ipc-flooding-protection',
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor',
                '--disable-extensions',
                '--disable-plugins',
                '--disable-images',  # Sneller laden
                '--disable-javascript-harmony-shipping',
                '--disable-background-networking',
                '--disable-default-apps',
                '--disable-sync',
                '--metrics-recording-only',
                '--no-default-browser-check',
                '--no-pings',
                '--password-store=basic',
                '--use-mock-keychain',
                '--disable-component-extensions-with-background-pages',
                '--disable-blink-features=AutomationControlled'
            ]
        )
        
        # Create context met uitgebreide stealth configuratie
        self.context = await self.browser.new_context(
            user_agent=user_agent,
            viewport=viewport,
            locale='nl-NL',
            timezone_id=timezone,
            permissions=['geolocation'],
            geolocation={'latitude': 52.3676, 'longitude': 4.9041},  # Amsterdam
            color_scheme='light',
            reduced_motion='no-preference',
            forced_colors='none',
            extra_http_headers={
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
            }
        )
        
        # Create page
        self.page = await self.context.new_page()
        
        # Inject stealth scripts om detectie te voorkomen
        await self.inject_stealth_scripts()
        
        # Setup realistic cookies
        await self.setup_realistic_cookies()
        
        logger.info("Stealth browser setup voltooid")
    
    async def inject_stealth_scripts(self) -> None:
        """
        Inject JavaScript om bot detectie te omzeilen
        """
        logger.debug("Injecting stealth scripts...")
        
        # Script om webdriver property te verbergen
        await self.page.add_init_script("""
            // Verberg webdriver property
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined,
            });
            
            // Override plugins
            Object.defineProperty(navigator, 'plugins', {
                get: () => [1, 2, 3, 4, 5],
            });
            
            // Override languages
            Object.defineProperty(navigator, 'languages', {
                get: () => ['nl-NL', 'nl', 'en'],
            });
            
            // Override permissions
            const originalQuery = window.navigator.permissions.query;
            window.navigator.permissions.query = (parameters) => (
                parameters.name === 'notifications' ?
                    Promise.resolve({ state: Notification.permission }) :
                    originalQuery(parameters)
            );
            
            // Override chrome property
            window.chrome = {
                runtime: {},
                loadTimes: function() {},
                csi: function() {},
                app: {}
            };
            
            // Override WebGL
            const getParameter = WebGLRenderingContext.getParameter;
            WebGLRenderingContext.prototype.getParameter = function(parameter) {
                if (parameter === 37445) {
                    return 'Intel Inc.';
                }
                if (parameter === 37446) {
                    return 'Intel Iris OpenGL Engine';
                }
                return getParameter(parameter);
            };
            
            // Override screen properties
            Object.defineProperty(screen, 'colorDepth', {
                get: () => 24,
            });
            
            // Override timezone
            Date.prototype.getTimezoneOffset = function() {
                return -60; // CET timezone
            };
            
            // Remove automation indicators
            delete window.cdc_adoQpoasnfa76pfcZLmcfl_Array;
            delete window.cdc_adoQpoasnfa76pfcZLmcfl_Promise;
            delete window.cdc_adoQpoasnfa76pfcZLmcfl_Symbol;
        """)
        
        logger.debug("Stealth scripts geïnjecteerd")
    
    async def setup_realistic_cookies(self) -> None:
        """
        Setup realistische cookies alsof we een echte gebruiker zijn
        """
        logger.debug("Setting up realistic cookies...")
        
        # Basis cookies die Zalando verwacht
        cookies = [
            {
                'name': 'zalando-session',
                'value': f'session_{random.randint(100000, 999999)}',
                'domain': '.zalando.nl',
                'path': '/',
                'httpOnly': False,
                'secure': True,
                'sameSite': 'Lax'
            },
            {
                'name': 'language',
                'value': 'nl-NL',
                'domain': '.zalando.nl',
                'path': '/',
                'httpOnly': False,
                'secure': True,
                'sameSite': 'Lax'
            },
            {
                'name': 'currency',
                'value': 'EUR',
                'domain': '.zalando.nl',
                'path': '/',
                'httpOnly': False,
                'secure': True,
                'sameSite': 'Lax'
            },
            {
                'name': 'country',
                'value': 'NL',
                'domain': '.zalando.nl',
                'path': '/',
                'httpOnly': False,
                'secure': True,
                'sameSite': 'Lax'
            }
        ]
        
        await self.context.add_cookies(cookies)
        logger.debug("Realistic cookies toegevoegd")
    
    async def human_like_delay(self, min_ms: int = 1000, max_ms: int = 3000) -> None:
        """
        Menselijke delay tussen acties
        """
        delay = random.uniform(min_ms, max_ms) / 1000
        logger.debug(f"Human delay: {delay:.2f}s")
        await asyncio.sleep(delay)
    
    async def simulate_mouse_movement(self) -> None:
        """
        Simuleer natuurlijke mouse bewegingen
        """
        logger.debug("Simulating mouse movement...")
        
        # Random mouse bewegingen
        for _ in range(random.randint(2, 5)):
            x = random.randint(100, 800)
            y = random.randint(100, 600)
            await self.page.mouse.move(x, y)
            await asyncio.sleep(random.uniform(0.1, 0.3))
        
        # Random scroll
        scroll_amount = random.randint(100, 500)
        await self.page.mouse.wheel(0, scroll_amount)
        await asyncio.sleep(random.uniform(0.5, 1.0))
    
    async def navigate_with_retry(self, url: str, max_retries: int = 3) -> bool:
        """
        Navigeer naar URL met retry logica voor anti-bot detectie
        """
        for attempt in range(max_retries):
            logger.info(f"Navigating to {url} (attempt {attempt + 1}/{max_retries})")
            
            try:
                # Pre-navigation delay
                await self.human_like_delay(2000, 4000)
                
                # Navigate met extended timeout
                await self.page.goto(
                    url,
                    wait_until='domcontentloaded',
                    timeout=60000  # 60 seconden timeout
                )
                
                # Post-navigation delay
                await self.human_like_delay(3000, 5000)
                
                # Simuleer menselijke interactie
                await self.simulate_mouse_movement()
                
                # Check of we een echte pagina hebben geladen
                page_content = await self.page.content()
                
                # Detecteer anti-bot/CAPTCHA pagina's
                if await self.is_blocked_page(page_content):
                    logger.warning(f"Blocked/CAPTCHA page detected on attempt {attempt + 1}")
                    
                    # Save debug HTML
                    debug_filename = f"blocked_page_attempt_{attempt + 1}.html"
                    with open(debug_filename, 'w', encoding='utf-8') as f:
                        f.write(page_content)
                    logger.info(f"Blocked page HTML saved as {debug_filename}")
                    
                    if attempt < max_retries - 1:
                        # Wacht langer en probeer opnieuw met nieuwe browser context
                        logger.info("Recreating browser context for retry...")
                        await self.recreate_browser_context()
                        continue
                    else:
                        return False
                
                # Check of we echte content hebben
                if await self.has_real_content(page_content):
                    logger.info("Successfully loaded real content")
                    return True
                else:
                    logger.warning(f"No real content found on attempt {attempt + 1}")
                    
                    # Save debug HTML
                    debug_filename = f"no_content_attempt_{attempt + 1}.html"
                    with open(debug_filename, 'w', encoding='utf-8') as f:
                        f.write(page_content)
                    logger.info(f"No content page HTML saved as {debug_filename}")
                    
                    if attempt < max_retries - 1:
                        await self.human_like_delay(5000, 10000)
                        continue
                    else:
                        return False
                        
            except PlaywrightTimeoutError:
                logger.error(f"Timeout on attempt {attempt + 1}")
                if self.page:
                    try:
                        page_content = await self.page.content()
                        with open(f"timeout_debug_{attempt+1}.html", "w", encoding="utf-8") as f:
                            f.write(page_content)
                        await self.page.screenshot(path=f"timeout_debug_{attempt+1}.png")
                        logger.info(f"Timeout debug HTML and screenshot saved for attempt {attempt+1}")
                    except Exception as debug_e:
                        logger.warning(f"Failed to save debug HTML/screenshot: {debug_e}")
                if attempt < max_retries - 1:
                    await self.human_like_delay(10000, 15000)
                    continue
                else:
                    return False
            except Exception as e:
                logger.error(f"Navigation error on attempt {attempt + 1}: {e}")
                if self.page:
                    try:
                        page_content = await self.page.content()
                        with open(f"error_debug_{attempt+1}.html", "w", encoding="utf-8") as f:
                            f.write(page_content)
                        await self.page.screenshot(path=f"error_debug_{attempt+1}.png")
                        logger.info(f"Error debug HTML and screenshot saved for attempt {attempt+1}")
                    except Exception as debug_e:
                        logger.warning(f"Failed to save debug HTML/screenshot: {debug_e}")
                if attempt < max_retries - 1:
                    await self.human_like_delay(5000, 10000)
                    continue
                else:
                    return False
        
        return False
    
    async def is_blocked_page(self, html_content: str) -> bool:
        """
        Detecteer of we een anti-bot/CAPTCHA pagina hebben
        """
        blocked_indicators = [
            'captcha',
            'blocked',
            'access denied',
            'bot detection',
            'cloudflare',
            'please verify',
            'security check',
            'unusual traffic',
            'verify you are human',
            'robot',
            'automated'
        ]
        
        html_lower = html_content.lower()
        
        for indicator in blocked_indicators:
            if indicator in html_lower:
                logger.debug(f"Blocked page indicator found: {indicator}")
                return True
        
        return False
    
    async def has_real_content(self, html_content: str) -> bool:
        """
        Check of we echte Zalando content hebben geladen
        """
        # Zalando-specifieke content indicators
        content_indicators = [
            'zalando',
            'product',
            'artikel',
            'prijs',
            '€',
            'maat',
            'kleur',
            'merk',
            'categorie'
        ]
        
        html_lower = html_content.lower()
        
        # Check voor minimaal aantal indicators
        found_indicators = sum(1 for indicator in content_indicators if indicator in html_lower)
        
        # Ook check voor minimale HTML lengte
        min_content_length = 10000  # Echte pagina's zijn groter
        
        has_content = found_indicators >= 3 and len(html_content) > min_content_length
        
        logger.debug(f"Content check: {found_indicators} indicators found, {len(html_content)} chars")
        
        return has_content
    
    async def recreate_browser_context(self) -> None:
        """
        Recreate browser context met nieuwe fingerprint
        """
        logger.info("Recreating browser context with new fingerprint...")
        
        if self.context:
            await self.context.close()
        
        # Nieuwe random configuratie
        user_agent = random.choice(self.user_agents)
        viewport = random.choice(self.viewports)
        timezone = random.choice(self.timezones)
        
        # Create nieuwe context
        self.context = await self.browser.new_context(
            user_agent=user_agent,
            viewport=viewport,
            locale='nl-NL',
            timezone_id=timezone,
            permissions=['geolocation'],
            geolocation={'latitude': 52.3676, 'longitude': 4.9041},
            color_scheme='light',
            reduced_motion='no-preference',
            forced_colors='none'
        )
        
        # Create nieuwe page
        self.page = await self.context.new_page()
        
        # Re-inject stealth scripts
        await self.inject_stealth_scripts()
        await self.setup_realistic_cookies()
        
        logger.info("Browser context recreated")
    
    async def extract_product_urls(self, category_url: str) -> List[str]:
        """
        Extract product URLs van een categorie pagina
        """
        logger.info(f"Extracting product URLs from: {category_url}")
        
        # Navigate naar categorie pagina
        success = await self.navigate_with_retry(category_url)
        if not success:
            logger.error(f"Failed to load category page: {category_url}")
            return []

        # Maak direct screenshot en save de HTML
        await self.page.screenshot(path="zalando_screenshot.png")
        logger.info("Screenshot genomen: zalando_screenshot.png")
        page_content = await self.page.content()
        with open("zalando_livepage.html", "w", encoding="utf-8") as f:
            f.write(page_content)
        logger.info("Live HTML opgeslagen als zalando_livepage.html")

        # Wacht op product grid te laden
        try:
            await self.page.wait_for_selector(
                'article, [data-testid="product-item"], .product-item, .product-card',
                timeout=30000
            )
            logger.info("Product grid loaded successfully")
        except PlaywrightTimeoutError:
            logger.warning("Product grid selector timeout - trying alternative approach")
        
        # Extra delay voor dynamic content
        await self.human_like_delay(3000, 5000)
        
        # Simuleer scroll om lazy loading te triggeren
        await self.page.evaluate("""
            window.scrollTo(0, document.body.scrollHeight / 2);
        """)
        await self.human_like_delay(2000, 3000)
        
        await self.page.evaluate("""
            window.scrollTo(0, document.body.scrollHeight);
        """)
        await self.human_like_delay(2000, 3000)
        
        # Extract product URLs met meerdere selectors
        product_urls = []
        
        selectors = [
            'a[href*="/p/"]',
            'article a[href*="/"]',
            '[data-testid="product-item"] a',
            '[data-testid="product-card"] a',
            '.product-item a',
            '.product-card a',
            'a[href*="zalando.nl"]'
        ]
        
        for selector in selectors:
            try:
                elements = await self.page.query_selector_all(selector)
                logger.debug(f"Found {len(elements)} elements with selector: {selector}")
                
                for element in elements:
                    href = await element.get_attribute('href')
                    if href and '/p/' in href:
                        # Maak absolute URL
                        if href.startswith('/'):
                            full_url = urljoin(self.base_url, href)
                        else:
                            full_url = href
                        
                        # Remove query parameters voor cleaner URLs
                        clean_url = full_url.split('?')[0]
                        
                        if clean_url not in product_urls:
                            product_urls.append(clean_url)
                            
            except Exception as e:
                logger.debug(f"Error with selector {selector}: {e}")
                continue
        
        # Remove duplicates en filter valide URLs
        unique_urls = []
        for url in product_urls:
            if url not in unique_urls and self.is_valid_product_url(url):
                unique_urls.append(url)
        
        logger.info(f"Extracted {len(unique_urls)} unique product URLs")
        
        # Debug: save page content als we weinig URLs vinden
        if len(unique_urls) < 5:
            page_content = await self.page.content()
            debug_filename = f"category_page_debug_{int(time.time())}.html"
            with open(debug_filename, 'w', encoding='utf-8') as f:
                f.write(page_content)
            logger.warning(f"Low URL count - page content saved as {debug_filename}")
        
        return unique_urls
    
    def is_valid_product_url(self, url: str) -> bool:
        """
        Valideer of URL een echte product URL is
        """
        if not url or not isinstance(url, str):
            return False
        
        # Must contain zalando.nl and /p/
        if 'zalando.nl' not in url or '/p/' not in url:
            return False
        
        # Should not contain unwanted paths
        unwanted_paths = [
            '/help/',
            '/customer-service/',
            '/size-guide/',
            '/brand/',
            '/campaign/',
            '/editorial/'
        ]
        
        for unwanted in unwanted_paths:
            if unwanted in url:
                return False
        
        return True
    
    async def scrape_herenkleding_products(self) -> List[str]:
        """
        Scrape product URLs van herenkleding categorie
        """
        logger.info("Starting herenkleding product scraping...")
        
        # Setup browser
        await self.setup_stealth_browser()
        
        try:
            # Scrape herenkleding categorie
            category_url = f"{self.base_url}/herenkleding/"
            product_urls = await self.extract_product_urls(category_url)
            
            logger.info(f"Successfully scraped {len(product_urls)} product URLs")
            
            # Print eerste 10 URLs als voorbeeld
            logger.info("Sample product URLs:")
            for i, url in enumerate(product_urls[:10], 1):
                logger.info(f"{i:2d}. {url}")
            
            return product_urls
            
        except Exception as e:
            logger.error(f"Scraping error: {e}")
            return []
        
        finally:
            await self.cleanup()
    
    async def cleanup(self) -> None:
        """
        Cleanup browser resources
        """
        logger.info("Cleaning up browser resources...")
        
        try:
            if self.page:
                await self.page.close()
            if self.context:
                await self.context.close()
            if self.browser:
                await self.browser.close()
        except Exception as e:
            logger.error(f"Cleanup error: {e}")
        
        logger.info("Cleanup completed")


async def main():
    """
    Hoofdfunctie voor het uitvoeren van de stealth scraper
    """
    logger.info("=== Advanced Zalando Stealth Scraper Started ===")
    
    scraper = ZalandoStealthScraper()
    
    try:
        # Scrape herenkleding product URLs
        product_urls = await scraper.scrape_herenkleding_products()
        
        # Print resultaten
        print(f"\n=== SCRAPING RESULTATEN ===")
        print(f"Totaal product URLs gevonden: {len(product_urls)}")
        print(f"\nAlle product URLs:")
        
        for i, url in enumerate(product_urls, 1):
            print(f"{i:3d}. {url}")
        
        # Save naar JSON bestand
        output_data = {
            "scraped_at": datetime.now().isoformat(),
            "category": "herenkleding",
            "total_urls": len(product_urls),
            "product_urls": product_urls
        }
        
        with open("zalando_product_urls.json", "w", encoding="utf-8") as f:
            json.dump(output_data, f, ensure_ascii=False, indent=2)
        
        logger.info("Product URLs saved to zalando_product_urls.json")
        
    except KeyboardInterrupt:
        logger.info("Scraping interrupted by user")
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
    finally:
        logger.info("Scraper finished")


if __name__ == "__main__":
    asyncio.run(main())

# --- END OF FILE ---