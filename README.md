# 🧠 FitFi Zalando Scraper

Dit project is onderdeel van het FitFi-platform en haalt automatisch productdata van [Zalando.nl](https://www.zalando.nl) op. De data wordt verrijkt met stijltags en seizoenslogica, en vervolgens geüpload naar een Supabase-database voor gebruik in de FitFi style recommendation engine.

---

## ✨ Features

- ✅ Scraping van meerdere categorieën (T-shirts, jeans, sneakers, tassen)
- ✅ Ondersteuning voor mannen- en vrouwenmode
- ✅ Extractie van productinformatie (naam, prijs, beschrijving, image, affiliate link, enz.)
- ✅ Automatische categorisatie (top, bottom, footwear, accessory)
- ✅ Verrijking met stijltags en seizoensinformatie
- ✅ Opslag naar gestructureerd `.json` bestand
- ✅ Uploaden naar Supabase met één commando
- ✅ Automatisch dagelijks scraping via GitHub Actions

---

## 🚀 Getting Started

### 🔧 Prerequisites

- Node.js 18 of hoger
- npm of yarn

### 🛠 Installatie

```bash
git clone https://github.com/lucavandee/fitfi-zalando-scraper.git
cd fitfi-zalando-scraper
npm install

```

## 🤖 **Advanced ML & Analytics Features**

### **Machine Learning Product Categorizer**
```bash
# Installeer ML dependencies
pip install scikit-learn transformers torch pandas numpy Pillow

# Run ML categorizer
python ml_categorizer.py
```

**Features:**
- **NLP-based categorization** met TF-IDF en Naive Bayes
- **Sentiment analysis** van product reviews
- **Computer vision** voor kleur/patroon detectie
- **Style tag generation** op basis van beschrijvingen
- **Trend score calculation** met multiple factors

### **Real-time Price Monitor**
```bash
# Setup price monitoring
python price_monitor.py

# Configureer via monitor_config.json
```

**Features:**
- **Multi-threaded monitoring** van duizenden producten
- **Smart alerts** via email, Slack, webhooks
- **Price prediction** met machine learning
- **Trend analysis** en forecasting
- **SQLite database** voor price history

### **Web Dashboard Interface**
```bash
# Start web dashboard
python web_dashboard.py

# Open browser: http://localhost:5000
```

**Features:**
- **Real-time monitoring** van scraping jobs
- **Interactive charts** voor price analytics
- **WebSocket updates** voor live data
- **Job scheduling** met APScheduler
- **Export functionaliteiten** (JSON, CSV)
- **Alert management** interface

## 🚀 **Production Deployment**

### **Docker Setup**
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

# Install Playwright browsers
RUN playwright install chromium

EXPOSE 5000

CMD ["python", "web_dashboard.py"]
```

### **Kubernetes Deployment**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: fitfi-scraper
spec:
  replicas: 3
  selector:
    matchLabels:
      app: fitfi-scraper
  template:
    metadata:
      labels:
        app: fitfi-scraper
    spec:
      containers:
      - name: scraper
        image: fitfi/zalando-scraper:latest
        ports:
        - containerPort: 5000
        env:
        - name: SUPABASE_URL
          valueFrom:
            secretKeyRef:
              name: supabase-secret
              key: url
```

### **Monitoring & Alerting**
```bash
# Prometheus metrics endpoint
curl http://localhost:5000/metrics

# Grafana dashboard import
# Dashboard ID: 12345 (custom FitFi scraper dashboard)
```

## 📊 **Advanced Analytics**

### **Price Prediction API**
```python
# Voorspel prijstrend voor product
prediction = price_monitor.predictor.predict_price_trend('product-id', days_ahead=7)

# Output:
{
  "current_price": 89.99,
  "predicted_price": 79.99,
  "trend": "down",
  "change_percent": -11.1,
  "confidence": 0.85
}
```

### **ML Enhancement Pipeline**
```python
# Verrijk producten met ML
enhanced_products = ml_categorizer.batch_enhance_products(raw_products)

# Toegevoegde velden:
# - ml_category
# - style_tags
# - sentiment_score
# - detected_colors
# - trend_score
```

## 🔔 **Smart Alerting System**

### **Price Alerts**
```python
# Maak price alert
monitor.create_price_alert(
    product_id='nike-air-max-90',
    target_price=80.0,
    alert_type='below',  # 'below', 'above', 'change'
    notification_method='slack'  # 'email', 'webhook', 'slack'
)
```

### **Webhook Integration**
```json
{
  "alert_id": 123,
  "product_id": "nike-air-max-90",
  "current_price": 75.99,
  "target_price": 80.0,
  "alert_type": "below",
  "timestamp": "2025-01-27T10:30:00Z",
  "product_url": "https://zalando.nl/...",
  "savings": 4.01
}
```

## 🎯 **Business Intelligence**

### **Trend Analysis**
- **Seasonal patterns** detectie
- **Brand performance** tracking
- **Category growth** analysis
- **Price elasticity** studies
- **Competitor benchmarking**

### **Revenue Optimization**
- **Dynamic pricing** recommendations
- **Inventory forecasting** 
- **Demand prediction**
- **Profit margin** analysis
- **A/B testing** voor pricing strategies

### 🕷️ Zalando Product Scraper

Voor het automatisch ophalen van productdata van Zalando.nl:

```bash
# Installeer Python dependencies
pip install -r requirements.txt

# Installeer Playwright browsers (optioneel, voor JavaScript rendering)
playwright install chromium

# Run de scraper
python zalando_scraper.py

# Output: zalandoProducts.json met alle product data