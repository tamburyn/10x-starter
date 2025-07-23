-- Migration: Allow NULL values in products.buildable_units column
-- Description: Modifies the buildable_units column to allow NULL values and sets default to 0.0
-- Date: 2025-07-23

-- Remove NOT NULL constraint and set default value to 0.0
ALTER TABLE products 
ALTER COLUMN buildable_units DROP NOT NULL,
ALTER COLUMN buildable_units SET DEFAULT 0.0;

-- Update existing NULL values to 0.0 (if any)
UPDATE products 
SET buildable_units = 0.0 
WHERE buildable_units IS NULL;
