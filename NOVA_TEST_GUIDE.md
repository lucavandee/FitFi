# Nova AI Stylist - Live Test Guide

## ✅ Setup Complete

**Database Status:**
- ✅ 50 products loaded in Supabase
- ✅ Categories: tops (12), bottoms (9), footwear (12), outerwear (7), accessories (6), dresses (4)
- ✅ Price range: €19.95 - €2999.95
- ✅ Smart filtering: archetype, undertone, budget

**Code Status:**
- ✅ Outfit generator queries Supabase
- ✅ Fallback to 5 hardcoded products if DB unavailable
- ✅ Nova function updated for async operations
- ✅ Build successful (5.30s)

---

## 🧪 Test Scenarios

### Test 1: Color Advice (User Context Required)

**Setup:**
1. Open browser DevTools → Application → Local Storage
2. Set user context:
   ```javascript
   localStorage.setItem('userContext', JSON.stringify({
     archetype: 'minimalist',
     undertone: 'cool',
     sizes: { tops: 'M', bottoms: '32', shoes: '42' }
   }));
   ```

**Test Query:**
```
"Welke kleuren passen bij mij?"
```

**Expected Response:**
- Explanation of cool undertone colors
- Recommendations: navy, charcoal, icy blue, silver, emerald
- Avoids: warm tones like orange, coral, golden yellow

**Verification:**
- Response mentions "cool undertone" ✅
- Lists specific cool colors ✅
- Explains why these colors work ✅

---

### Test 2: Casual Outfit Generation

**Test Query:**
```
"Stel een casual outfit samen"
```

**Expected Response:**
- 3-4 products from database
- Categories: top, bottom, footwear
- Casual tags prioritized
- Visual product cards with images

**Verification:**
- Products are NOT the 5 fallback items ✅
- Products match casual style ✅
- Price information visible ✅
- Affiliate links present ✅

**Sample Expected Products:**
- Uniqlo Turtleneck (€19.99)
- Weekday Mom Jeans (€69.99)
- Converse Canvas Sneakers (€69.95)

---

### Test 3: Work/Formal Outfit

**Test Query:**
```
"Stel een werkoutfit samen voor kantoor"
```

**Expected Response:**
- 4-5 products including accessory
- Categories: top, bottom, footwear, outerwear/accessory
- Formal/business tags prioritized

**Sample Expected Products:**
- Hugo Boss Blazer (€249.95)
- Tommy Hilfiger Chinos (€79.95)
- Ralph Lauren Oxford Shirt (€119.95)
- Tod's Leather Loafers (€449.95)

**Verification:**
- Products suitable for professional setting ✅
- More expensive/premium items ✅
- Classic styling ✅

---

### Test 4: Budget-Constrained Outfit

**Setup:**
```javascript
localStorage.setItem('userContext', JSON.stringify({
  archetype: 'casual_chic',
  budget: { min: 20, max: 100 }
}));
```

**Test Query:**
```
"Casual outfit onder €100"
```

**Expected Response:**
- 3-4 products
- Total price under €100
- Budget-friendly brands (H&M, Uniqlo, Zara)

**Sample Expected Products:**
- Uniqlo Turtleneck (€19.99)
- Zara Pleated Skirt (€39.95)
- H&M Knit Cardigan (€29.99)
- Total: ~€90 ✅

---

### Test 5: Luxury/High-End Outfit

**Setup:**
```javascript
localStorage.setItem('userContext', JSON.stringify({
  archetype: 'luxury_minimalist',
  undertone: 'neutral',
  budget: { min: 500, max: 3000 }
}));
```

**Test Query:**
```
"Luxury outfit voor speciaal event"
```

**Expected Response:**
- High-end products (€500+)
- Luxury brands: Max Mara, Bottega Veneta, Hermès
- Premium materials: cashmere, silk, leather

**Sample Expected Products:**
- Max Mara Wool Coat (€899.95)
- Bottega Veneta Chelsea Boots (€1299.95)
- Hermès Silk Scarf (€399.95)

---

### Test 6: Winter Outfit with Outerwear

**Test Query:**
```
"Stel een winter outfit samen"
```

**Expected Response:**
- 4 products including outerwear
- Categories: outerwear, top, bottom, footwear
- Winter-appropriate items

**Sample Expected Products:**
- COS Oversized Wool Coat (€189.95)
- Arket Cashmere Sweater (€159.95)
- Acne Studios Jeans (€229.95)
- Dr. Martens Ankle Boots (€169.95)

---

## 🔍 Debugging

### Check if Database Products are Used

**Browser Console:**
```javascript
// Watch network requests to Nova endpoint
// Look for Supabase query in server logs
```

**Expected:** If query returns 3+ unique products NOT in the fallback list, database is working!

**Fallback Products (should NOT appear):**
1. Oversized Wool Coat - COS (€189.95)
2. High-Waist Mom Jeans - Weekday (€69.99)
3. Silk Blouse - Massimo Dutti (€89.95)
4. Minimalist Sneakers - Veja (€120.00)
5. Leather Crossbody Bag - Mansur Gavriel (€295.00)

**Database Products (should appear):**
- Anything from Uniqlo, H&M, Zara, Lacoste, Champion, etc.
- Products NOT in the above fallback list

---

## ✅ Success Criteria

**Database Integration Working:**
- [ ] Outfit queries return 10+ different products across multiple tests
- [ ] No repetition of same 5 products
- [ ] Budget filtering works
- [ ] Archetype filtering shows style differences

**Color Advice Working:**
- [ ] Responds to "welke kleuren" queries
- [ ] Uses user undertone from context
- [ ] Provides specific color recommendations

**Product Quality:**
- [ ] All images load
- [ ] Prices display correctly
- [ ] Affiliate links work
- [ ] Sizes visible

---

## 📊 Test Results Template

```
Test 1 - Color Advice: ✅/❌
- Detected undertone: _______
- Recommended colors: _______

Test 2 - Casual Outfit: ✅/❌
- Products returned: _______
- Database used: YES/NO
- Style match: _______

Test 3 - Work Outfit: ✅/❌
- Products: _______
- Professional: YES/NO

Test 4 - Budget Outfit: ✅/❌
- Total price: €_______
- Within budget: YES/NO

Test 5 - Luxury Outfit: ✅/❌
- Products: _______
- Premium brands: YES/NO

Test 6 - Winter Outfit: ✅/❌
- Outerwear included: YES/NO
- Seasonal items: YES/NO
```

---

## 🚀 Next Steps After Testing

**If all tests pass:**
- Deploy to production
- Monitor user engagement
- Track product clicks
- Analyze outfit preferences

**If issues found:**
- Check Supabase connection logs
- Verify env variables
- Test fallback mechanism
- Review product filtering logic
