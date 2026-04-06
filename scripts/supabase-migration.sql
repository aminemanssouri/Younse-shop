-- Migration: Add Product Variants Support for Supabase (PostgreSQL)
-- This allows one product to have multiple color variants with individual stock tracking

-- Create Product Variants table
CREATE TABLE IF NOT EXISTS product_variants (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT NOT NULL,
  color TEXT NOT NULL,
  stock_quantity NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE(product_id, color)
);

-- Update Sales table to track which variant was sold
ALTER TABLE sales ADD COLUMN IF NOT EXISTS variant_id BIGINT REFERENCES product_variants(id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_variant_id ON sales(variant_id);

-- Enable Row Level Security (RLS) if needed
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (adjust based on your auth setup)
CREATE POLICY "Enable read access for all users" ON product_variants
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON product_variants
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only" ON product_variants
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete for authenticated users only" ON product_variants
  FOR DELETE USING (true);
