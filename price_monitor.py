#!/usr/bin/env python3
"""
Real-time Price Monitor - Advanced Tracking
==========================================

Real-time price monitoring systeem voor Zalando producten met:
- Automatische price tracking
- Alert systeem voor prijsdalingen
- Trend analysis en voorspellingen
- Email/SMS notificaties
- Dashboard API endpoints

Features:
- Multi-threaded monitoring
- Database storage voor price history
- Webhook integratie
- Slack/Discord notificaties
- Price prediction algoritmes
"""

import asyncio
import aiohttp
import sqlite3
import smtplib
import json
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import threading
import time
from dataclasses import dataclass
from pathlib import Path

# Optionele imports
try:
    import pandas as pd
    import numpy as np
    from sklearn.linear_model import LinearRegression
    ANALYTICS_AVAILABLE = True
except ImportError:
    ANALYTICS_AVAILABLE = False
    print("Analytics libraries niet beschikbaar. Gebruik pip install pandas numpy scikit-learn")

try:
    import requests
    REQUESTS_AVAILABLE = True
except ImportError:
    REQUESTS_AVAILABLE = False

logger = logging.getLogger(__name__)

@dataclass
class PriceAlert:
    """Price alert configuratie"""
    product_id: str
    target_price: float
    alert_type: str  # 'below', 'above', 'change'
    notification_method: str  # 'email', 'webhook', 'slack'
    is_active: bool = True
    created_at: datetime = None

@dataclass
class PricePoint:
    """Price data point"""
    product_id: str
    price: float
    original_price: float
    in_stock: bool
    timestamp: datetime
    source: str = 'zalando'

class PriceDatabase:
    """
    SQLite database voor price history storage
    """
    
    def __init__(self, db_path: str = "price_history.db"):
        self.db_path = db_path
        self.init_database()
    
    def init_database(self) -> None:
        """Initialiseer database schema"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS price_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    product_id TEXT NOT NULL,
                    price REAL NOT NULL,
                    original_price REAL,
                    in_stock BOOLEAN,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                    source TEXT DEFAULT 'zalando'
                )
            """)
            
            conn.execute("""
                CREATE TABLE IF NOT EXISTS price_alerts (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    product_id TEXT NOT NULL,
                    target_price REAL NOT NULL,
                    alert_type TEXT NOT NULL,
                    notification_method TEXT NOT NULL,
                    is_active BOOLEAN DEFAULT 1,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    last_triggered DATETIME
                )
            """)
            
            conn.execute("""
                CREATE TABLE IF NOT EXISTS products (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    brand TEXT,
                    category TEXT,
                    url TEXT,
                    image_url TEXT,
                    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Indexes voor performance
            conn.execute("CREATE INDEX IF NOT EXISTS idx_price_product_time ON price_history(product_id, timestamp)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_alerts_active ON price_alerts(is_active)")
            
        logger.info("Database geïnitialiseerd")
    
    def add_price_point(self, price_point: PricePoint) -> None:
        """Voeg price point toe aan database"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                INSERT INTO price_history (product_id, price, original_price, in_stock, timestamp, source)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                price_point.product_id,
                price_point.price,
                price_point.original_price,
                price_point.in_stock,
                price_point.timestamp,
                price_point.source
            ))
    
    def get_price_history(self, product_id: str, days: int = 30) -> List[Dict]:
        """Haal price history op voor product"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.execute("""
                SELECT * FROM price_history 
                WHERE product_id = ? AND timestamp > datetime('now', '-{} days')
                ORDER BY timestamp DESC
            """.format(days), (product_id,))
            
            return [dict(row) for row in cursor.fetchall()]
    
    def add_alert(self, alert: PriceAlert) -> None:
        """Voeg price alert toe"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                INSERT INTO price_alerts (product_id, target_price, alert_type, notification_method, is_active)
                VALUES (?, ?, ?, ?, ?)
            """, (
                alert.product_id,
                alert.target_price,
                alert.alert_type,
                alert.notification_method,
                alert.is_active
            ))
    
    def get_active_alerts(self) -> List[Dict]:
        """Haal actieve alerts op"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.execute("""
                SELECT * FROM price_alerts WHERE is_active = 1
            """)
            
            return [dict(row) for row in cursor.fetchall()]

class NotificationService:
    """
    Service voor het versturen van notificaties
    """
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.email_config = config.get('email', {})
        self.webhook_config = config.get('webhook', {})
        self.slack_config = config.get('slack', {})
    
    def send_email(self, to_email: str, subject: str, body: str) -> bool:
        """Verstuur email notificatie"""
        try:
            msg = MIMEMultipart()
            msg['From'] = self.email_config['from_email']
            msg['To'] = to_email
            msg['Subject'] = subject
            
            msg.attach(MIMEText(body, 'html'))
            
            server = smtplib.SMTP(self.email_config['smtp_server'], self.email_config['smtp_port'])
            server.starttls()
            server.login(self.email_config['username'], self.email_config['password'])
            
            text = msg.as_string()
            server.sendmail(self.email_config['from_email'], to_email, text)
            server.quit()
            
            logger.info(f"Email verzonden naar {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"Email error: {e}")
            return False
    
    def send_webhook(self, webhook_url: str, data: Dict[str, Any]) -> bool:
        """Verstuur webhook notificatie"""
        try:
            if not REQUESTS_AVAILABLE:
                logger.error("Requests library niet beschikbaar voor webhooks")
                return False
            
            response = requests.post(webhook_url, json=data, timeout=10)
            response.raise_for_status()
            
            logger.info(f"Webhook verzonden naar {webhook_url}")
            return True
            
        except Exception as e:
            logger.error(f"Webhook error: {e}")
            return False
    
    def send_slack_message(self, channel: str, message: str) -> bool:
        """Verstuur Slack notificatie"""
        try:
            if not REQUESTS_AVAILABLE:
                logger.error("Requests library niet beschikbaar voor Slack")
                return False
            
            webhook_url = self.slack_config['webhook_url']
            payload = {
                'channel': channel,
                'text': message,
                'username': 'FitFi Price Monitor',
                'icon_emoji': ':money_with_wings:'
            }
            
            response = requests.post(webhook_url, json=payload, timeout=10)
            response.raise_for_status()
            
            logger.info(f"Slack bericht verzonden naar {channel}")
            return True
            
        except Exception as e:
            logger.error(f"Slack error: {e}")
            return False

class PricePredictor:
    """
    ML-based price prediction service
    """
    
    def __init__(self, db: PriceDatabase):
        self.db = db
        self.model = None
        
        if ANALYTICS_AVAILABLE:
            self.model = LinearRegression()
    
    def predict_price_trend(self, product_id: str, days_ahead: int = 7) -> Dict[str, Any]:
        """
        Voorspel price trend voor product
        
        Args:
            product_id: Product ID
            days_ahead: Aantal dagen vooruit te voorspellen
            
        Returns:
            Prediction resultaat
        """
        if not ANALYTICS_AVAILABLE:
            return {'error': 'Analytics libraries niet beschikbaar'}
        
        try:
            # Haal price history op
            history = self.db.get_price_history(product_id, days=90)
            
            if len(history) < 10:
                return {'error': 'Onvoldoende data voor voorspelling'}
            
            # Prepareer data
            df = pd.DataFrame(history)
            df['timestamp'] = pd.to_datetime(df['timestamp'])
            df = df.sort_values('timestamp')
            
            # Feature engineering
            df['days_since_start'] = (df['timestamp'] - df['timestamp'].min()).dt.days
            df['price_change'] = df['price'].pct_change()
            df['moving_avg_7'] = df['price'].rolling(window=7).mean()
            
            # Prepare training data
            X = df[['days_since_start']].values
            y = df['price'].values
            
            # Train model
            self.model.fit(X, y)
            
            # Maak voorspellingen
            last_day = df['days_since_start'].max()
            future_days = np.array([[last_day + i] for i in range(1, days_ahead + 1)])
            predictions = self.model.predict(future_days)
            
            # Bereken trend
            current_price = df['price'].iloc[-1]
            predicted_price = predictions[-1]
            trend = 'up' if predicted_price > current_price else 'down'
            change_percent = ((predicted_price - current_price) / current_price) * 100
            
            return {
                'current_price': current_price,
                'predicted_price': predicted_price,
                'trend': trend,
                'change_percent': change_percent,
                'confidence': self.model.score(X, y),
                'predictions': predictions.tolist()
            }
            
        except Exception as e:
            logger.error(f"Price prediction error: {e}")
            return {'error': str(e)}

class RealTimePriceMonitor:
    """
    Hoofdklasse voor real-time price monitoring
    """
    
    def __init__(self, config_file: str = "monitor_config.json"):
        self.config = self.load_config(config_file)
        self.db = PriceDatabase()
        self.notifications = NotificationService(self.config.get('notifications', {}))
        self.predictor = PricePredictor(self.db)
        self.is_running = False
        self.monitor_thread = None
        
        # Monitoring instellingen
        self.check_interval = self.config.get('check_interval', 300)  # 5 minuten
        self.max_concurrent = self.config.get('max_concurrent', 10)
        
        logger.info("Real-time Price Monitor geïnitialiseerd")
    
    def load_config(self, config_file: str) -> Dict[str, Any]:
        """Laad configuratie uit JSON bestand"""
        try:
            with open(config_file, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            logger.warning(f"Config bestand {config_file} niet gevonden, gebruik defaults")
            return self.get_default_config()
    
    def get_default_config(self) -> Dict[str, Any]:
        """Default configuratie"""
        return {
            'check_interval': 300,
            'max_concurrent': 10,
            'notifications': {
                'email': {
                    'smtp_server': 'smtp.gmail.com',
                    'smtp_port': 587,
                    'from_email': 'your-email@gmail.com',
                    'username': 'your-email@gmail.com',
                    'password': 'your-app-password'
                },
                'webhook': {
                    'default_url': 'https://your-webhook-url.com/price-alert'
                },
                'slack': {
                    'webhook_url': 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK'
                }
            },
            'products_to_monitor': []
        }
    
    async def check_product_price(self, session: aiohttp.ClientSession, product: Dict[str, Any]) -> Optional[PricePoint]:
        """
        Check prijs van een specifiek product
        
        Args:
            session: aiohttp session
            product: Product dictionary
            
        Returns:
            PricePoint of None
        """
        try:
            url = product['url']
            
            async with session.get(url) as response:
                if response.status != 200:
                    logger.warning(f"HTTP {response.status} voor {url}")
                    return None
                
                html = await response.text()
                
                # Simpele price extractie (kan worden verbeterd)
                import re
                price_match = re.search(r'€\s*(\d+(?:,\d{2})?)', html)
                
                if price_match:
                    price = float(price_match.group(1).replace(',', '.'))
                    
                    # Check voor original price
                    original_price_match = re.search(r'€\s*(\d+(?:,\d{2})?)', html)
                    original_price = float(original_price_match.group(1).replace(',', '.')) if original_price_match else price
                    
                    # Check stock status
                    in_stock = 'uitverkocht' not in html.lower()
                    
                    return PricePoint(
                        product_id=product['id'],
                        price=price,
                        original_price=original_price,
                        in_stock=in_stock,
                        timestamp=datetime.now()
                    )
                
        except Exception as e:
            logger.error(f"Error checking price voor {product.get('id', 'unknown')}: {e}")
        
        return None
    
    async def monitor_prices(self) -> None:
        """
        Monitor alle geconfigureerde producten
        """
        products = self.config.get('products_to_monitor', [])
        
        if not products:
            logger.warning("Geen producten geconfigureerd voor monitoring")
            return
        
        connector = aiohttp.TCPConnector(limit=self.max_concurrent)
        timeout = aiohttp.ClientTimeout(total=30)
        
        async with aiohttp.ClientSession(connector=connector, timeout=timeout) as session:
            tasks = []
            
            for product in products:
                task = self.check_product_price(session, product)
                tasks.append(task)
            
            # Voer alle checks parallel uit
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Verwerk resultaten
            for result in results:
                if isinstance(result, PricePoint):
                    self.db.add_price_point(result)
                    await self.check_alerts(result)
    
    async def check_alerts(self, price_point: PricePoint) -> None:
        """
        Check of price point alerts triggert
        
        Args:
            price_point: Nieuwe price point
        """
        alerts = self.db.get_active_alerts()
        
        for alert in alerts:
            if alert['product_id'] != price_point.product_id:
                continue
            
            should_trigger = False
            
            if alert['alert_type'] == 'below' and price_point.price <= alert['target_price']:
                should_trigger = True
            elif alert['alert_type'] == 'above' and price_point.price >= alert['target_price']:
                should_trigger = True
            elif alert['alert_type'] == 'change':
                # Check voor significante prijsverandering
                history = self.db.get_price_history(price_point.product_id, days=1)
                if len(history) > 1:
                    last_price = history[1]['price']  # Previous price
                    change_percent = abs((price_point.price - last_price) / last_price) * 100
                    if change_percent >= alert['target_price']:  # target_price als percentage
                        should_trigger = True
            
            if should_trigger:
                await self.send_alert(alert, price_point)
    
    async def send_alert(self, alert: Dict[str, Any], price_point: PricePoint) -> None:
        """
        Verstuur alert notificatie
        
        Args:
            alert: Alert configuratie
            price_point: Price point die alert triggerde
        """
        try:
            message = f"""
            🚨 Price Alert Triggered!
            
            Product: {alert['product_id']}
            Current Price: €{price_point.price}
            Target Price: €{alert['target_price']}
            Alert Type: {alert['alert_type']}
            Timestamp: {price_point.timestamp}
            """
            
            if alert['notification_method'] == 'email':
                # Implementeer email notificatie
                pass
            elif alert['notification_method'] == 'webhook':
                webhook_data = {
                    'alert_id': alert['id'],
                    'product_id': alert['product_id'],
                    'current_price': price_point.price,
                    'target_price': alert['target_price'],
                    'alert_type': alert['alert_type'],
                    'timestamp': price_point.timestamp.isoformat()
                }
                self.notifications.send_webhook(
                    self.config['notifications']['webhook']['default_url'],
                    webhook_data
                )
            elif alert['notification_method'] == 'slack':
                self.notifications.send_slack_message('#price-alerts', message)
            
            logger.info(f"Alert verzonden voor product {alert['product_id']}")
            
        except Exception as e:
            logger.error(f"Error sending alert: {e}")
    
    def start_monitoring(self) -> None:
        """Start de monitoring loop"""
        if self.is_running:
            logger.warning("Monitor is al actief")
            return
        
        self.is_running = True
        self.monitor_thread = threading.Thread(target=self._monitoring_loop)
        self.monitor_thread.daemon = True
        self.monitor_thread.start()
        
        logger.info("Price monitoring gestart")
    
    def stop_monitoring(self) -> None:
        """Stop de monitoring loop"""
        self.is_running = False
        if self.monitor_thread:
            self.monitor_thread.join()
        
        logger.info("Price monitoring gestopt")
    
    def _monitoring_loop(self) -> None:
        """Monitoring loop die draait in aparte thread"""
        while self.is_running:
            try:
                # Run async monitoring
                asyncio.run(self.monitor_prices())
                
                logger.info(f"Price check voltooid, volgende check over {self.check_interval} seconden")
                
                # Wacht tot volgende check
                time.sleep(self.check_interval)
                
            except Exception as e:
                logger.error(f"Error in monitoring loop: {e}")
                time.sleep(60)  # Wacht 1 minuut bij error
    
    def add_product_to_monitor(self, product_data: Dict[str, Any]) -> None:
        """
        Voeg product toe aan monitoring lijst
        
        Args:
            product_data: Product informatie
        """
        # Voeg toe aan database
        with sqlite3.connect(self.db.db_path) as conn:
            conn.execute("""
                INSERT OR REPLACE INTO products (id, name, brand, category, url, image_url)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                product_data['id'],
                product_data['name'],
                product_data.get('brand', ''),
                product_data.get('category', ''),
                product_data['url'],
                product_data.get('image_url', '')
            ))
        
        logger.info(f"Product toegevoegd aan monitoring: {product_data['name']}")
    
    def create_price_alert(self, product_id: str, target_price: float, 
                          alert_type: str = 'below', notification_method: str = 'webhook') -> None:
        """
        Maak nieuwe price alert
        
        Args:
            product_id: Product ID
            target_price: Target prijs of percentage
            alert_type: Type alert ('below', 'above', 'change')
            notification_method: Notificatie methode
        """
        alert = PriceAlert(
            product_id=product_id,
            target_price=target_price,
            alert_type=alert_type,
            notification_method=notification_method,
            created_at=datetime.now()
        )
        
        self.db.add_alert(alert)
        logger.info(f"Price alert aangemaakt voor product {product_id}")
    
    def get_price_analytics(self, product_id: str) -> Dict[str, Any]:
        """
        Haal price analytics op voor product
        
        Args:
            product_id: Product ID
            
        Returns:
            Analytics data
        """
        history = self.db.get_price_history(product_id, days=30)
        
        if not history:
            return {'error': 'Geen price history beschikbaar'}
        
        prices = [h['price'] for h in history]
        
        analytics = {
            'current_price': prices[0] if prices else 0,
            'min_price': min(prices),
            'max_price': max(prices),
            'avg_price': sum(prices) / len(prices),
            'price_changes': len([p for i, p in enumerate(prices[1:], 1) if p != prices[i-1]]),
            'trend_prediction': self.predictor.predict_price_trend(product_id)
        }
        
        return analytics

def main():
    """
    Test functie voor price monitor
    """
    # Setup logging
    logging.basicConfig(level=logging.INFO)
    
    # Initialiseer monitor
    monitor = RealTimePriceMonitor()
    
    # Voeg test product toe
    test_product = {
        'id': 'test-product-1',
        'name': 'Test Nike Sneakers',
        'brand': 'Nike',
        'category': 'footwear',
        'url': 'https://www.zalando.nl/test-product',
        'image_url': 'https://example.com/image.jpg'
    }
    
    monitor.add_product_to_monitor(test_product)
    
    # Maak price alert
    monitor.create_price_alert('test-product-1', 80.0, 'below', 'webhook')
    
    # Start monitoring (voor demo, stop na 30 seconden)
    monitor.start_monitoring()
    time.sleep(30)
    monitor.stop_monitoring()
    
    # Toon analytics
    analytics = monitor.get_price_analytics('test-product-1')
    print(json.dumps(analytics, indent=2))

if __name__ == "__main__":
    main()