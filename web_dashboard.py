#!/usr/bin/env python3
"""
Web Dashboard - Scraping Management Interface
============================================

Flask-based web dashboard voor scraping management en analytics:
- Real-time scraping status monitoring
- Product database browser
- Price analytics en charts
- Alert management interface
- Scraping job scheduler
- Performance metrics

Features:
- Responsive web interface
- Real-time updates via WebSockets
- Interactive charts met Chart.js
- RESTful API endpoints
- Authentication en authorization
- Export functionaliteiten
"""

from flask import Flask, render_template, request, jsonify, send_file
from flask_socketio import SocketIO, emit
import sqlite3
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any
import threading
import os
from pathlib import Path

# Optionele imports
try:
    import pandas as pd
    import plotly.graph_objs as go
    import plotly.utils
    PLOTLY_AVAILABLE = True
except ImportError:
    PLOTLY_AVAILABLE = False
    print("Plotly niet beschikbaar. Gebruik pip install plotly pandas")

try:
    from apscheduler.schedulers.background import BackgroundScheduler
    SCHEDULER_AVAILABLE = True
except ImportError:
    SCHEDULER_AVAILABLE = False
    print("APScheduler niet beschikbaar. Gebruik pip install apscheduler")

# Import onze eigen modules
from zalando_scraper import ZalandoScraper
from price_monitor import RealTimePriceMonitor
from ml_categorizer import MLProductCategorizer

logger = logging.getLogger(__name__)

# Flask app setup
app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-here'
socketio = SocketIO(app, cors_allowed_origins="*")

# Global instances
scraper = None
price_monitor = None
ml_categorizer = None
scheduler = None

class DashboardAPI:
    """
    API klasse voor dashboard functionaliteiten
    """
    
    def __init__(self, db_path: str = "scraper_dashboard.db"):
        self.db_path = db_path
        self.init_database()
    
    def init_database(self) -> None:
        """Initialiseer dashboard database"""
        with sqlite3.connect(self.db_path) as conn:
            # Scraping jobs table
            conn.execute("""
                CREATE TABLE IF NOT EXISTS scraping_jobs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    job_name TEXT NOT NULL,
                    status TEXT DEFAULT 'pending',
                    started_at DATETIME,
                    completed_at DATETIME,
                    products_scraped INTEGER DEFAULT 0,
                    errors_count INTEGER DEFAULT 0,
                    config JSON,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Performance metrics table
            conn.execute("""
                CREATE TABLE IF NOT EXISTS performance_metrics (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    metric_name TEXT NOT NULL,
                    metric_value REAL NOT NULL,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                    job_id INTEGER,
                    FOREIGN KEY (job_id) REFERENCES scraping_jobs (id)
                )
            """)
            
            # User sessions (simpele auth)
            conn.execute("""
                CREATE TABLE IF NOT EXISTS user_sessions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    session_token TEXT UNIQUE NOT NULL,
                    user_id TEXT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    expires_at DATETIME NOT NULL,
                    is_active BOOLEAN DEFAULT 1
                )
            """)
        
        logger.info("Dashboard database geïnitialiseerd")
    
    def get_scraping_stats(self) -> Dict[str, Any]:
        """Haal scraping statistieken op"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            
            # Recent jobs
            recent_jobs = conn.execute("""
                SELECT * FROM scraping_jobs 
                ORDER BY created_at DESC 
                LIMIT 10
            """).fetchall()
            
            # Performance metrics
            total_products = conn.execute("""
                SELECT SUM(products_scraped) as total 
                FROM scraping_jobs 
                WHERE status = 'completed'
            """).fetchone()
            
            success_rate = conn.execute("""
                SELECT 
                    COUNT(CASE WHEN status = 'completed' THEN 1 END) * 100.0 / COUNT(*) as rate
                FROM scraping_jobs
                WHERE created_at > datetime('now', '-7 days')
            """).fetchone()
            
            return {
                'recent_jobs': [dict(job) for job in recent_jobs],
                'total_products': total_products['total'] or 0,
                'success_rate': round(success_rate['rate'] or 0, 1),
                'active_monitors': self.get_active_monitors_count()
            }
    
    def get_active_monitors_count(self) -> int:
        """Tel actieve price monitors"""
        try:
            # Dit zou uit de price monitor database komen
            return 0  # Placeholder
        except:
            return 0
    
    def create_scraping_job(self, job_config: Dict[str, Any]) -> int:
        """Maak nieuwe scraping job"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute("""
                INSERT INTO scraping_jobs (job_name, config, status)
                VALUES (?, ?, 'pending')
            """, (
                job_config.get('name', 'Unnamed Job'),
                json.dumps(job_config)
            ))
            
            return cursor.lastrowid
    
    def update_job_status(self, job_id: int, status: str, **kwargs) -> None:
        """Update job status"""
        with sqlite3.connect(self.db_path) as conn:
            updates = ['status = ?']
            values = [status]
            
            if 'products_scraped' in kwargs:
                updates.append('products_scraped = ?')
                values.append(kwargs['products_scraped'])
            
            if 'errors_count' in kwargs:
                updates.append('errors_count = ?')
                values.append(kwargs['errors_count'])
            
            if status == 'running':
                updates.append('started_at = CURRENT_TIMESTAMP')
            elif status == 'completed':
                updates.append('completed_at = CURRENT_TIMESTAMP')
            
            values.append(job_id)
            
            conn.execute(f"""
                UPDATE scraping_jobs 
                SET {', '.join(updates)}
                WHERE id = ?
            """, values)

# Global API instance
dashboard_api = DashboardAPI()

@app.route('/')
def dashboard_home():
    """Dashboard homepage"""
    stats = dashboard_api.get_scraping_stats()
    return render_template('dashboard.html', stats=stats)

@app.route('/api/stats')
def api_stats():
    """API endpoint voor statistieken"""
    return jsonify(dashboard_api.get_scraping_stats())

@app.route('/api/products')
def api_products():
    """API endpoint voor product lijst"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)
    search = request.args.get('search', '')
    
    # Implementeer product search en pagination
    # Dit zou uit de products database komen
    
    return jsonify({
        'products': [],
        'total': 0,
        'page': page,
        'per_page': per_page
    })

@app.route('/api/scraping/start', methods=['POST'])
def api_start_scraping():
    """Start nieuwe scraping job"""
    try:
        config = request.get_json()
        job_id = dashboard_api.create_scraping_job(config)
        
        # Start scraping in background thread
        thread = threading.Thread(target=run_scraping_job, args=(job_id, config))
        thread.daemon = True
        thread.start()
        
        return jsonify({
            'success': True,
            'job_id': job_id,
            'message': 'Scraping job gestart'
        })
        
    except Exception as e:
        logger.error(f"Error starting scraping job: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/price-alerts', methods=['GET', 'POST'])
def api_price_alerts():
    """Price alerts management"""
    if request.method == 'GET':
        # Haal alerts op
        return jsonify({'alerts': []})
    
    elif request.method == 'POST':
        # Maak nieuwe alert
        alert_data = request.get_json()
        
        try:
            if price_monitor:
                price_monitor.create_price_alert(
                    alert_data['product_id'],
                    alert_data['target_price'],
                    alert_data.get('alert_type', 'below'),
                    alert_data.get('notification_method', 'webhook')
                )
            
            return jsonify({
                'success': True,
                'message': 'Price alert aangemaakt'
            })
            
        except Exception as e:
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500

@app.route('/api/analytics/<product_id>')
def api_product_analytics(product_id):
    """Product analytics endpoint"""
    try:
        if price_monitor:
            analytics = price_monitor.get_price_analytics(product_id)
            return jsonify(analytics)
        else:
            return jsonify({'error': 'Price monitor niet beschikbaar'})
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/export/products')
def api_export_products():
    """Export producten naar JSON/CSV"""
    format_type = request.args.get('format', 'json')
    
    try:
        # Implementeer export functionaliteit
        if format_type == 'json':
            # Export naar JSON
            return send_file('zalandoProducts.json', as_attachment=True)
        elif format_type == 'csv':
            # Export naar CSV
            return send_file('products.csv', as_attachment=True)
        else:
            return jsonify({'error': 'Ongeldig format'}), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@socketio.on('connect')
def handle_connect():
    """WebSocket verbinding"""
    emit('status', {'message': 'Verbonden met dashboard'})
    logger.info('Client verbonden met WebSocket')

@socketio.on('disconnect')
def handle_disconnect():
    """WebSocket disconnectie"""
    logger.info('Client losgekoppeld van WebSocket')

@socketio.on('request_stats')
def handle_stats_request():
    """Real-time stats request"""
    stats = dashboard_api.get_scraping_stats()
    emit('stats_update', stats)

def run_scraping_job(job_id: int, config: Dict[str, Any]) -> None:
    """
    Voer scraping job uit in background
    
    Args:
        job_id: Job ID
        config: Job configuratie
    """
    try:
        dashboard_api.update_job_status(job_id, 'running')
        
        # Emit status update
        socketio.emit('job_status', {
            'job_id': job_id,
            'status': 'running',
            'message': 'Scraping gestart...'
        })
        
        # Initialiseer scraper
        scraper = ZalandoScraper()
        
        # Configureer scraper op basis van config
        max_pages = config.get('max_pages_per_category', 2)
        categories = config.get('categories', scraper.categories)
        
        # Start scraping
        scraper.categories = categories
        scraper.scrape_all_categories(max_pages)
        scraper.clean_and_validate_data()
        
        # ML enhancement (optioneel)
        if config.get('use_ml_enhancement', False) and ml_categorizer:
            scraper.scraped_products = ml_categorizer.batch_enhance_products(
                scraper.scraped_products
            )
        
        # Export resultaten
        scraper.export_to_json(f"scraping_job_{job_id}.json")
        
        # Update job status
        dashboard_api.update_job_status(
            job_id, 
            'completed',
            products_scraped=len(scraper.scraped_products),
            errors_count=len(scraper.failed_urls)
        )
        
        # Emit completion
        socketio.emit('job_status', {
            'job_id': job_id,
            'status': 'completed',
            'products_scraped': len(scraper.scraped_products),
            'errors_count': len(scraper.failed_urls),
            'message': 'Scraping voltooid!'
        })
        
        logger.info(f"Scraping job {job_id} voltooid")
        
    except Exception as e:
        logger.error(f"Scraping job {job_id} error: {e}")
        
        dashboard_api.update_job_status(job_id, 'failed')
        
        socketio.emit('job_status', {
            'job_id': job_id,
            'status': 'failed',
            'error': str(e),
            'message': 'Scraping gefaald'
        })

def init_scheduler():
    """Initialiseer job scheduler"""
    global scheduler
    
    if not SCHEDULER_AVAILABLE:
        logger.warning("APScheduler niet beschikbaar")
        return
    
    scheduler = BackgroundScheduler()
    
    # Voeg scheduled jobs toe
    scheduler.add_job(
        func=scheduled_scraping_job,
        trigger="cron",
        hour=3,  # Dagelijks om 3:00 AM
        minute=0,
        id='daily_scraping'
    )
    
    scheduler.start()
    logger.info("Job scheduler gestart")

def scheduled_scraping_job():
    """Scheduled scraping job"""
    config = {
        'name': f'Scheduled Scraping {datetime.now().strftime("%Y-%m-%d")}',
        'max_pages_per_category': 3,
        'use_ml_enhancement': True
    }
    
    job_id = dashboard_api.create_scraping_job(config)
    
    # Start job in background
    thread = threading.Thread(target=run_scraping_job, args=(job_id, config))
    thread.daemon = True
    thread.start()

def create_dashboard_templates():
    """Maak HTML templates voor dashboard"""
    templates_dir = Path("templates")
    templates_dir.mkdir(exist_ok=True)
    
    # Dashboard HTML template
    dashboard_html = """
<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FitFi Scraping Dashboard</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.socket.io/4.5.0/socket.io.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body class="bg-gray-100">
    <div class="container mx-auto px-4 py-8">
        <h1 class="text-3xl font-bold mb-8">FitFi Scraping Dashboard</h1>
        
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div class="bg-white rounded-lg shadow p-6">
                <h3 class="text-lg font-semibold mb-2">Totaal Producten</h3>
                <p class="text-3xl font-bold text-blue-600" id="total-products">{{ stats.total_products }}</p>
            </div>
            <div class="bg-white rounded-lg shadow p-6">
                <h3 class="text-lg font-semibold mb-2">Success Rate</h3>
                <p class="text-3xl font-bold text-green-600" id="success-rate">{{ stats.success_rate }}%</p>
            </div>
            <div class="bg-white rounded-lg shadow p-6">
                <h3 class="text-lg font-semibold mb-2">Actieve Monitors</h3>
                <p class="text-3xl font-bold text-purple-600" id="active-monitors">{{ stats.active_monitors }}</p>
            </div>
            <div class="bg-white rounded-lg shadow p-6">
                <h3 class="text-lg font-semibold mb-2">Status</h3>
                <p class="text-lg font-semibold text-green-600" id="system-status">Online</p>
            </div>
        </div>
        
        <!-- Controls -->
        <div class="bg-white rounded-lg shadow p-6 mb-8">
            <h2 class="text-xl font-bold mb-4">Scraping Controls</h2>
            <div class="flex space-x-4">
                <button onclick="startScraping()" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Start Scraping
                </button>
                <button onclick="viewProducts()" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                    View Products
                </button>
                <button onclick="exportData()" class="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
                    Export Data
                </button>
            </div>
        </div>
        
        <!-- Recent Jobs -->
        <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-xl font-bold mb-4">Recent Jobs</h2>
            <div class="overflow-x-auto">
                <table class="min-w-full table-auto">
                    <thead>
                        <tr class="bg-gray-50">
                            <th class="px-4 py-2 text-left">Job Name</th>
                            <th class="px-4 py-2 text-left">Status</th>
                            <th class="px-4 py-2 text-left">Products</th>
                            <th class="px-4 py-2 text-left">Started</th>
                        </tr>
                    </thead>
                    <tbody id="jobs-table">
                        {% for job in stats.recent_jobs %}
                        <tr class="border-t">
                            <td class="px-4 py-2">{{ job.job_name }}</td>
                            <td class="px-4 py-2">
                                <span class="px-2 py-1 rounded text-sm 
                                    {% if job.status == 'completed' %}bg-green-100 text-green-800
                                    {% elif job.status == 'running' %}bg-blue-100 text-blue-800
                                    {% elif job.status == 'failed' %}bg-red-100 text-red-800
                                    {% else %}bg-gray-100 text-gray-800{% endif %}">
                                    {{ job.status }}
                                </span>
                            </td>
                            <td class="px-4 py-2">{{ job.products_scraped or 0 }}</td>
                            <td class="px-4 py-2">{{ job.started_at or 'Not started' }}</td>
                        </tr>
                        {% endfor %}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    
    <script>
        // WebSocket connection
        const socket = io();
        
        socket.on('connect', function() {
            console.log('Connected to dashboard');
        });
        
        socket.on('stats_update', function(data) {
            document.getElementById('total-products').textContent = data.total_products;
            document.getElementById('success-rate').textContent = data.success_rate + '%';
            document.getElementById('active-monitors').textContent = data.active_monitors;
        });
        
        socket.on('job_status', function(data) {
            console.log('Job status update:', data);
            // Update UI met job status
        });
        
        function startScraping() {
            fetch('/api/scraping/start', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: 'Manual Scraping Job',
                    max_pages_per_category: 2,
                    use_ml_enhancement: true
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Scraping job gestart!');
                } else {
                    alert('Error: ' + data.error);
                }
            });
        }
        
        function viewProducts() {
            window.open('/api/products', '_blank');
        }
        
        function exportData() {
            window.open('/api/export/products?format=json', '_blank');
        }
        
        // Request stats update elke 30 seconden
        setInterval(() => {
            socket.emit('request_stats');
        }, 30000);
    </script>
</body>
</html>
    """
    
    with open(templates_dir / "dashboard.html", "w", encoding="utf-8") as f:
        f.write(dashboard_html)
    
    logger.info("Dashboard templates aangemaakt")

def main():
    """
    Start de web dashboard
    """
    global scraper, price_monitor, ml_categorizer
    
    # Setup logging
    logging.basicConfig(level=logging.INFO)
    
    # Initialiseer services
    scraper = ZalandoScraper()
    price_monitor = RealTimePriceMonitor()
    ml_categorizer = MLProductCategorizer()
    
    # Laad ML modellen
    ml_categorizer.load_pretrained_models()
    
    # Maak templates
    create_dashboard_templates()
    
    # Initialiseer scheduler
    init_scheduler()
    
    # Start price monitoring
    price_monitor.start_monitoring()
    
    logger.info("=== FitFi Scraping Dashboard Gestart ===")
    logger.info("Dashboard beschikbaar op: http://localhost:5000")
    
    try:
        # Start Flask app
        socketio.run(app, host='0.0.0.0', port=5000, debug=False)
    except KeyboardInterrupt:
        logger.info("Dashboard gestopt door gebruiker")
    finally:
        if price_monitor:
            price_monitor.stop_monitoring()
        if scheduler:
            scheduler.shutdown()

if __name__ == "__main__":
    main()