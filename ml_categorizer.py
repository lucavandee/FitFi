#!/usr/bin/env python3
"""
ML Product Categorizer - Advanced Classification
===============================================

Machine Learning module voor intelligente product categorisatie
en stijl-tag generatie op basis van product beschrijvingen en afbeeldingen.

Features:
- NLP-based product categorization
- Style tag generation
- Image analysis voor kleur/patroon detectie
- Sentiment analysis voor product reviews
- Trend detection algoritmes
"""

import re
import json
import logging
from typing import List, Dict, Any, Tuple
from datetime import datetime
import numpy as np

# Optionele ML imports
try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.naive_bayes import MultinomialNB
    from sklearn.pipeline import Pipeline
    import joblib
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False
    print("Scikit-learn niet beschikbaar. Gebruik pip install scikit-learn")

try:
    from transformers import pipeline
    TRANSFORMERS_AVAILABLE = True
except ImportError:
    TRANSFORMERS_AVAILABLE = False
    print("Transformers niet beschikbaar. Gebruik pip install transformers")

try:
    from PIL import Image
    import requests
    from io import BytesIO
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False
    print("PIL niet beschikbaar. Gebruik pip install Pillow")

logger = logging.getLogger(__name__)

class MLProductCategorizer:
    """
    Machine Learning Product Categorizer
    
    Gebruikt NLP en computer vision voor intelligente product classificatie
    """
    
    def __init__(self):
        self.category_model = None
        self.style_classifier = None
        self.sentiment_analyzer = None
        self.color_detector = None
        
        # Pre-trained categorieën
        self.categories = {
            'tops': ['shirt', 'blouse', 'trui', 'sweater', 'hoodie', 'vest', 'top'],
            'bottoms': ['broek', 'jeans', 'rok', 'short', 'legging', 'joggingbroek'],
            'footwear': ['schoen', 'sneaker', 'laars', 'pump', 'sandaal', 'slipper'],
            'outerwear': ['jas', 'coat', 'blazer', 'cardigan', 'vest', 'mantel'],
            'accessories': ['tas', 'riem', 'sjaal', 'hoed', 'handschoen', 'sieraad'],
            'dresses': ['jurk', 'dress', 'jumpsuit', 'overall'],
            'underwear': ['ondergoed', 'bh', 'slip', 'boxer', 'sokken'],
            'sportswear': ['sportkleding', 'trainingsbroek', 'sportbh', 'zwemkleding']
        }
        
        # Stijl keywords
        self.style_keywords = {
            'casual': ['casual', 'relaxed', 'comfortable', 'everyday', 'basic'],
            'formal': ['formal', 'business', 'elegant', 'sophisticated', 'classic'],
            'sporty': ['sport', 'athletic', 'active', 'performance', 'training'],
            'trendy': ['trendy', 'fashion', 'modern', 'contemporary', 'stylish'],
            'vintage': ['vintage', 'retro', 'classic', 'timeless', 'heritage'],
            'luxury': ['luxury', 'premium', 'designer', 'exclusive', 'high-end'],
            'minimalist': ['minimal', 'simple', 'clean', 'basic', 'essential'],
            'bohemian': ['boho', 'bohemian', 'free', 'artistic', 'creative']
        }
        
        # Kleur mapping
        self.color_mapping = {
            'zwart': '#000000', 'wit': '#FFFFFF', 'grijs': '#808080',
            'rood': '#FF0000', 'blauw': '#0000FF', 'groen': '#008000',
            'geel': '#FFFF00', 'oranje': '#FFA500', 'paars': '#800080',
            'roze': '#FFC0CB', 'bruin': '#A52A2A', 'beige': '#F5F5DC'
        }
        
        logger.info("ML Product Categorizer geïnitialiseerd")
    
    def train_category_model(self, training_data: List[Dict]) -> None:
        """
        Train het categorisatie model op basis van training data
        
        Args:
            training_data: List van dicts met 'text' en 'category' keys
        """
        if not SKLEARN_AVAILABLE:
            logger.warning("Scikit-learn niet beschikbaar voor model training")
            return
        
        try:
            # Prepareer training data
            texts = [item['text'] for item in training_data]
            categories = [item['category'] for item in training_data]
            
            # Maak pipeline met TF-IDF en Naive Bayes
            self.category_model = Pipeline([
                ('tfidf', TfidfVectorizer(max_features=5000, stop_words='english')),
                ('classifier', MultinomialNB())
            ])
            
            # Train model
            self.category_model.fit(texts, categories)
            
            # Save model
            joblib.dump(self.category_model, 'category_model.pkl')
            logger.info(f"Category model getraind op {len(training_data)} samples")
            
        except Exception as e:
            logger.error(f"Error bij model training: {e}")
    
    def load_pretrained_models(self) -> None:
        """
        Laad pre-trained modellen
        """
        try:
            # Laad category model
            if SKLEARN_AVAILABLE:
                try:
                    self.category_model = joblib.load('category_model.pkl')
                    logger.info("Pre-trained category model geladen")
                except FileNotFoundError:
                    logger.info("Geen pre-trained model gevonden, gebruik rule-based classificatie")
            
            # Laad sentiment analyzer
            if TRANSFORMERS_AVAILABLE:
                self.sentiment_analyzer = pipeline(
                    "sentiment-analysis",
                    model="nlptown/bert-base-multilingual-uncased-sentiment"
                )
                logger.info("Sentiment analyzer geladen")
                
        except Exception as e:
            logger.error(f"Error bij laden modellen: {e}")
    
    def categorize_product(self, product_data: Dict[str, Any]) -> str:
        """
        Categoriseer product op basis van naam en beschrijving
        
        Args:
            product_data: Product dictionary
            
        Returns:
            Voorspelde categorie
        """
        text = f"{product_data.get('name', '')} {product_data.get('description', '')}"
        text = text.lower()
        
        # Probeer ML model eerst
        if self.category_model and SKLEARN_AVAILABLE:
            try:
                prediction = self.category_model.predict([text])[0]
                confidence = max(self.category_model.predict_proba([text])[0])
                
                if confidence > 0.7:  # Hoge confidence threshold
                    logger.debug(f"ML categorisatie: {prediction} (confidence: {confidence:.2f})")
                    return prediction
            except Exception as e:
                logger.error(f"ML categorisatie error: {e}")
        
        # Fallback naar rule-based classificatie
        for category, keywords in self.categories.items():
            for keyword in keywords:
                if keyword in text:
                    logger.debug(f"Rule-based categorisatie: {category}")
                    return category
        
        return 'general'
    
    def generate_style_tags(self, product_data: Dict[str, Any]) -> List[str]:
        """
        Genereer stijl tags op basis van product informatie
        
        Args:
            product_data: Product dictionary
            
        Returns:
            List van stijl tags
        """
        text = f"{product_data.get('name', '')} {product_data.get('description', '')}"
        text = text.lower()
        
        tags = []
        
        # Zoek stijl keywords
        for style, keywords in self.style_keywords.items():
            for keyword in keywords:
                if keyword in text:
                    tags.append(style)
                    break
        
        # Voeg prijs-gebaseerde tags toe
        price = product_data.get('price', 0)
        if price > 200:
            tags.append('luxury')
        elif price < 30:
            tags.append('budget')
        
        # Voeg merk-gebaseerde tags toe
        brand = product_data.get('brand', '').lower()
        if brand in ['nike', 'adidas', 'puma']:
            tags.append('sporty')
        elif brand in ['zara', 'h&m']:
            tags.append('trendy')
        elif brand in ['cos', 'arket']:
            tags.append('minimalist')
        
        # Seizoen detectie
        if any(word in text for word in ['winter', 'warm', 'wool']):
            tags.append('winter')
        elif any(word in text for word in ['summer', 'light', 'cotton']):
            tags.append('summer')
        
        return list(set(tags))  # Remove duplicates
    
    def analyze_product_sentiment(self, product_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyseer sentiment van product reviews/beschrijving
        
        Args:
            product_data: Product dictionary
            
        Returns:
            Sentiment analysis resultaat
        """
        if not self.sentiment_analyzer:
            return {'sentiment': 'neutral', 'confidence': 0.5}
        
        try:
            text = product_data.get('description', '')
            if not text:
                return {'sentiment': 'neutral', 'confidence': 0.5}
            
            result = self.sentiment_analyzer(text[:512])  # Limit text length
            
            return {
                'sentiment': result[0]['label'].lower(),
                'confidence': result[0]['score']
            }
            
        except Exception as e:
            logger.error(f"Sentiment analysis error: {e}")
            return {'sentiment': 'neutral', 'confidence': 0.5}
    
    def detect_colors_from_image(self, image_url: str) -> List[str]:
        """
        Detecteer dominante kleuren uit product afbeelding
        
        Args:
            image_url: URL van product afbeelding
            
        Returns:
            List van gedetecteerde kleuren
        """
        if not PIL_AVAILABLE:
            return []
        
        try:
            # Download afbeelding
            response = requests.get(image_url, timeout=10)
            image = Image.open(BytesIO(response.content))
            
            # Resize voor snellere verwerking
            image = image.resize((150, 150))
            
            # Convert naar RGB
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Get pixel data
            pixels = list(image.getdata())
            
            # Simpele kleur clustering (kan worden verbeterd met K-means)
            color_counts = {}
            for pixel in pixels:
                # Round naar nearest color bucket
                r, g, b = pixel
                color_key = (r//50*50, g//50*50, b//50*50)
                color_counts[color_key] = color_counts.get(color_key, 0) + 1
            
            # Get top 3 kleuren
            top_colors = sorted(color_counts.items(), key=lambda x: x[1], reverse=True)[:3]
            
            # Map naar kleur namen
            detected_colors = []
            for (r, g, b), count in top_colors:
                color_name = self.rgb_to_color_name(r, g, b)
                if color_name:
                    detected_colors.append(color_name)
            
            return detected_colors
            
        except Exception as e:
            logger.error(f"Color detection error voor {image_url}: {e}")
            return []
    
    def rgb_to_color_name(self, r: int, g: int, b: int) -> str:
        """
        Convert RGB waarden naar kleur naam
        
        Args:
            r, g, b: RGB waarden
            
        Returns:
            Kleur naam
        """
        # Simpele kleur mapping (kan worden verbeterd)
        if r < 50 and g < 50 and b < 50:
            return 'zwart'
        elif r > 200 and g > 200 and b > 200:
            return 'wit'
        elif r > 150 and g < 100 and b < 100:
            return 'rood'
        elif r < 100 and g < 100 and b > 150:
            return 'blauw'
        elif r < 100 and g > 150 and b < 100:
            return 'groen'
        elif r > 150 and g > 150 and b < 100:
            return 'geel'
        elif r > 150 and g > 100 and b < 100:
            return 'oranje'
        elif abs(r - g) < 30 and abs(g - b) < 30:
            return 'grijs'
        else:
            return 'mixed'
    
    def enhance_product_data(self, product_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Verrijk product data met ML-generated informatie
        
        Args:
            product_data: Originele product data
            
        Returns:
            Verrijkte product data
        """
        enhanced_data = product_data.copy()
        
        try:
            # Categorisatie
            category = self.categorize_product(product_data)
            enhanced_data['ml_category'] = category
            
            # Stijl tags
            style_tags = self.generate_style_tags(product_data)
            enhanced_data['style_tags'] = style_tags
            
            # Sentiment analysis
            sentiment = self.analyze_product_sentiment(product_data)
            enhanced_data['sentiment'] = sentiment
            
            # Kleur detectie
            if product_data.get('image_url'):
                detected_colors = self.detect_colors_from_image(product_data['image_url'])
                if detected_colors:
                    enhanced_data['detected_colors'] = detected_colors
            
            # Trend score (simpele implementatie)
            trend_score = self.calculate_trend_score(product_data)
            enhanced_data['trend_score'] = trend_score
            
            logger.debug(f"Product verrijkt: {product_data.get('name', 'Unknown')}")
            
        except Exception as e:
            logger.error(f"Error bij product verrijking: {e}")
        
        return enhanced_data
    
    def calculate_trend_score(self, product_data: Dict[str, Any]) -> float:
        """
        Bereken trend score op basis van verschillende factoren
        
        Args:
            product_data: Product dictionary
            
        Returns:
            Trend score (0.0 - 1.0)
        """
        score = 0.5  # Base score
        
        # Review count factor
        review_count = product_data.get('review_count', 0)
        if review_count > 100:
            score += 0.2
        elif review_count > 50:
            score += 0.1
        
        # Rating factor
        rating = product_data.get('rating', 0)
        if rating > 4.5:
            score += 0.2
        elif rating > 4.0:
            score += 0.1
        
        # Price factor (mid-range vaak populair)
        price = product_data.get('price', 0)
        if 50 <= price <= 150:
            score += 0.1
        
        # Brand factor
        brand = product_data.get('brand', '').lower()
        trending_brands = ['zara', 'h&m', 'nike', 'adidas', 'cos']
        if brand in trending_brands:
            score += 0.1
        
        return min(score, 1.0)
    
    def batch_enhance_products(self, products: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Verrijk een batch van producten
        
        Args:
            products: List van product dictionaries
            
        Returns:
            List van verrijkte producten
        """
        enhanced_products = []
        
        for i, product in enumerate(products, 1):
            logger.info(f"Verrijking product {i}/{len(products)}: {product.get('name', 'Unknown')}")
            
            enhanced_product = self.enhance_product_data(product)
            enhanced_products.append(enhanced_product)
            
            # Progress logging
            if i % 10 == 0:
                logger.info(f"Verrijking voortgang: {i}/{len(products)} producten verwerkt")
        
        logger.info(f"Batch verrijking voltooid: {len(enhanced_products)} producten")
        return enhanced_products

def main():
    """
    Test functie voor ML categorizer
    """
    categorizer = MLProductCategorizer()
    categorizer.load_pretrained_models()
    
    # Test product
    test_product = {
        'name': 'Nike Air Max Sneakers',
        'description': 'Comfortable running shoes with air cushioning technology',
        'brand': 'Nike',
        'price': 120.0,
        'rating': 4.5,
        'review_count': 150,
        'image_url': 'https://example.com/image.jpg'
    }
    
    enhanced = categorizer.enhance_product_data(test_product)
    print(json.dumps(enhanced, indent=2))

if __name__ == "__main__":
    main()