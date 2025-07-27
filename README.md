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