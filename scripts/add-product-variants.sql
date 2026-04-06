-- Migration: Add Product Variants Support
-- This allows one product to have multiple color variants with individual stock tracking

-- Create Product Variants table
CREATE TABLE IF NOT EXISTS product_variants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  color TEXT NOT NULL,
  stock_quantity REAL NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE(product_id, color)
);

-- Update Sales table to track which variant was sold
ALTER TABLE sales ADD COLUMN variant_id INTEGER REFERENCES product_variants(id);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_variant_id ON sales(variant_id);

-- Note: For existing products without variants, you can create a default variant:
-- INSERT INTO product_variants (product_id, color, stock_quantity)
-- SELECT id, COALESCE(color, 'default'), stock_quantity FROM products WHERE id NOT IN (SELECT DISTINCT product_id FROM product_variants);
