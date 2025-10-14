/*
  # Add Stripe Test IDs to Products

  1. Updates
    - Add Stripe test product and price IDs to existing products
    - These are test mode IDs for development/testing

  2. Notes
    - Premium: monthly recurring subscription
    - Founder: one-time payment
    - Test IDs are safe to commit as they only work in Stripe test mode
*/

-- Update Premium product with test IDs
UPDATE stripe_products
SET 
  stripe_product_id = 'prod_test_premium',
  stripe_price_id = 'price_1QStCOJVeJj7wLmQq7p2vIYr'
WHERE interval = 'month' AND is_active = true;

-- Update Founder product with test IDs
UPDATE stripe_products
SET 
  stripe_product_id = 'prod_test_founder',
  stripe_price_id = 'price_1QStCgJVeJj7wLmQtMy7DqGB'
WHERE interval = 'one_time' AND is_active = true;
