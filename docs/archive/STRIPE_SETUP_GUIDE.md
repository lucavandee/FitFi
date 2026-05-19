# Stripe Setup Guide voor FitFi

## Probleem
De checkout faalt met "No such price" omdat de price IDs in de database niet bestaan in jouw Stripe account.

## Stap-voor-stap Oplossing

### 1. Voeg Stripe Secret Key toe aan Supabase

1. Ga naar [Stripe Dashboard - API Keys](https://dashboard.stripe.com/test/apikeys)
2. Kopieer je **Secret key** (begint met `sk_test_`)
3. Ga naar [Supabase Edge Function Secrets](https://supabase.com/dashboard/project/wojexzgjyhijuxzperhq/settings/functions)
4. Klik op "Add new secret"
5. Name: `STRIPE_SECRET_KEY`
6. Value: Plak je secret key
7. Klik "Save"

### 2. Maak Products en Prices aan in Stripe

#### Product 1: Premium Maandabonnement

1. Ga naar [Stripe Products](https://dashboard.stripe.com/test/products)
2. Klik "Add product"
3. Vul in:
   - **Name**: FitFi Premium
   - **Description**: Premium style recommendations
   - **Pricing model**: Standard pricing
   - **Price**: 9.99
   - **Currency**: EUR
   - **Billing period**: Monthly
4. Klik "Save product"
5. **BELANGRIJK**: Kopieer de **Price ID** (begint met `price_`, bijvoorbeeld `price_1ABC...`)

#### Product 2: Founder Edition (Eenmalig)

1. Klik "Add product"
2. Vul in:
   - **Name**: FitFi Founder
   - **Description**: One-time founder edition access
   - **Pricing model**: Standard pricing
   - **Price**: 149.00
   - **Currency**: EUR
   - **Billing period**: One time
3. Klik "Save product"
4. **BELANGRIJK**: Kopieer de **Price ID** (begint met `price_`, bijvoorbeeld `price_1XYZ...`)

### 3. Update de Database

Ga naar Supabase SQL Editor en voer dit uit (vervang de price IDs met jouw echte IDs):

```sql
-- Update Premium product
UPDATE stripe_products
SET stripe_price_id = 'price_JOUW_PREMIUM_PRICE_ID_HIER'
WHERE name = 'FitFi.ai Subscription';

-- Update Founder product
UPDATE stripe_products
SET stripe_price_id = 'price_JOUW_FOUNDER_PRICE_ID_HIER'
WHERE name = 'FitFi Subscription - Founders Edition';

-- Verifieer dat het gelukt is
SELECT name, stripe_price_id, price, interval FROM stripe_products;
```

### 4. Test de Checkout

1. Ga naar `/prijzen` in je app
2. Klik op "Start nu" bij Premium of Founder
3. Je wordt doorgestuurd naar Stripe Checkout
4. Gebruik test card: `4242 4242 4242 4242`
5. Expiry: Elke toekomstige datum
6. CVC: 123
7. Postcode: 12345

## Alternative: Via Admin Panel

1. Log in als admin
2. Ga naar `/admin/products`
3. Klik "Edit" bij elk product
4. Plak de Stripe Price IDs
5. Klik "Save"

## Verificatie Checklist

- [ ] Stripe Secret Key toegevoegd aan Supabase
- [ ] Premium product aangemaakt in Stripe (€9.99/maand)
- [ ] Founder product aangemaakt in Stripe (€149 eenmalig)
- [ ] Price IDs gekopieerd uit Stripe
- [ ] Database geüpdatet met echte Price IDs
- [ ] Checkout getest met test card

## Troubleshooting

### "Payment system not configured"
→ Stripe Secret Key niet ingesteld in Supabase

### "No such price: price_xxx"
→ Price ID in database bestaat niet in Stripe

### "Product not found or missing Stripe price ID"
→ Database record heeft geen stripe_price_id waarde

### Checkout werkt maar webhook faalt
→ Webhook secret moet ook worden ingesteld (komt later)
