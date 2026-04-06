# Multi-Color Product Variants System - Complete Guide

## Overview

Your shop now supports **multi-color product variants**! This means you can have ONE product with MULTIPLE colors, each color maintaining its own separate stock quantity.

### Example:
- **Product**: "Cotton T-Shirt"
- **SKU**: "TSHIRT-001"
- **Price**: 150 DH (same for all colors)
- **Colors**:
  - Red: 20 pieces in stock
  - Blue: 15 pieces in stock
  - White: 30 pieces in stock

---

## 🚀 Getting Started

### Step 1: Run Database Migration

**IMPORTANT**: Before using the new system, you must run the database migration to add the `product_variants` table.

Run this SQL script in your Supabase dashboard:

```sql
-- See file: scripts/add-product-variants.sql
```

Or manually execute:

```sql
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

ALTER TABLE sales ADD COLUMN variant_id INTEGER REFERENCES product_variants(id);

CREATE INDEX IF NOT EXISTS idx_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_variant_id ON sales(variant_id);
```

---

## 📦 How to Add Products with Multiple Colors

### Adding a New Product

1. Go to **Products** page
2. Click **"Add Product"** button
3. Fill in basic information:
   - Product Name (e.g., "Cotton T-Shirt")
   - SKU (e.g., "TSHIRT-001")
   - Cost Price (e.g., 80 DH)
   - Selling Price (e.g., 150 DH)
   - Measurement Unit (Piece or Meter)
   - Upload image (optional)

4. **Add Color Variants**:
   - You'll see a "Color Variants" section
   - By default, one color row is shown
   - Enter color name (e.g., "red", "blue", "#FF0000")
   - Enter stock quantity for that color
   - Click **"Add Color"** button to add more colors
   - Click trash icon to remove a color (must keep at least 1)

5. Click **"Save"**

### Example Color Inputs:
- Color names: `red`, `blue`, `white`, `black`, `green`
- Hex codes: `#FF0000`, `#0000FF`, `#FFFFFF`
- CSS colors: `crimson`, `navy`, `ivory`

---

## 🛒 How to Sell Products with Color Variants

### Recording a Sale

1. Go to **Sales** page or **Dashboard**
2. Click **"Add Sale"** or **"Record New Sale"**
3. **Select Product** from dropdown
   - Products are listed with their names
   
4. **Select Color** (NEW!)
   - After selecting a product, a new dropdown appears
   - Shows all available colors for that product
   - Each color shows:
     - Color indicator (colored circle)
     - Color name
     - Available stock for that color
   
5. **Enter Quantity**
   - The system automatically limits quantity to available stock for selected color
   
6. **Complete Sale**
   - Enter selling price (pre-filled with product price)
   - Select sale date
   - Add notes (optional)
   - Click **"Record Sale"**

### What Happens:
- Stock is deducted from the SPECIFIC color variant you selected
- Other colors remain unaffected
- Sale is recorded with the variant information

---

## 📊 Viewing Products with Variants

### In Products List:
- Total stock shown is the SUM of all color variants
- Example: Red (20) + Blue (15) + White (30) = **65 total**

### When Editing:
- All color variants are loaded
- You can:
  - Add new colors
  - Remove existing colors
  - Update stock for each color
  - Change color names

---

## 🔧 Technical Details

### Database Structure

**products** table (unchanged):
- Stores base product information
- `stock_quantity` is now calculated (sum of all variants)

**product_variants** table (NEW):
- `id`: Unique variant ID
- `product_id`: Links to parent product
- `color`: Color name or hex code
- `stock_quantity`: Stock for this specific color
- `created_at`, `updated_at`: Timestamps

**sales** table (updated):
- Added `variant_id`: Which color was sold (optional for backward compatibility)

### API Changes

**New Functions** (`app/actions.ts`):
```typescript
getProductVariants(productId: number)
addProductVariant(variant)
updateProductVariant(id, data)
deleteProductVariant(id)
```

**Updated Functions**:
- `getProducts()`: Now fetches variants and calculates total stock
- `addSale()`: Now handles variant-based stock deduction

---

## 🎨 Color Format Support

The system accepts multiple color formats:

1. **Color Names**: `red`, `blue`, `green`, `yellow`, `black`, `white`
2. **Hex Codes**: `#FF0000`, `#00FF00`, `#0000FF`
3. **CSS Colors**: `crimson`, `navy`, `teal`, `coral`

### Color Display:
- Small colored circles appear next to product names
- Helps visually distinguish between variants
- Shows in both product selection and sale dropdowns

---

## 📝 Best Practices

### Naming Colors:
- ✅ Use simple, clear names: "red", "blue", "dark-blue"
- ✅ Use hex codes for exact colors: "#FF5733"
- ❌ Avoid complex names: "reddish-blue-with-hints-of-purple"

### Managing Stock:
- Update stock quantities when receiving new inventory
- Each color is tracked independently
- Total product stock = sum of all color stocks

### SKU Strategy:
- Use ONE SKU per product (not per color)
- Example: "TSHIRT-001" for all colors of Cotton T-Shirt
- Colors are managed as variants, not separate products

---

## 🔄 Migrating Existing Products

If you have existing products without variants:

### Option 1: Automatic (Recommended)
The system automatically creates a single variant for existing products using their current `color` and `stock_quantity` fields.

### Option 2: Manual
1. Edit each existing product
2. The current color/stock will appear as the first variant
3. Add additional colors if needed
4. Save

---

## 🐛 Troubleshooting

### "Please select a color" error
- Make sure you selected a color from the dropdown after selecting the product
- Products with variants REQUIRE color selection

### Color not showing correctly
- Verify the color name is valid (try hex code instead)
- Check browser console for errors

### Stock not updating
- Ensure you selected the correct color variant
- Check that variant_id is being saved with the sale

### Migration issues
- Verify the SQL migration ran successfully
- Check Supabase logs for errors
- Ensure `product_variants` table exists

---

## 📱 Multi-Language Support

All UI elements support English, French, and Arabic:
- "Color Variants" / "Variantes de couleur" / "ألوان المنتج"
- "Select Color" / "Sélectionner une couleur" / "اختر اللون"
- "Add Color" / "Ajouter une couleur" / "إضافة لون"

---

## ✅ Summary

**Before**: One product = one color = one stock number
**Now**: One product = multiple colors = individual stock per color

This system gives you:
- ✅ Better inventory management
- ✅ Clearer stock tracking per color
- ✅ Easier sales process
- ✅ More accurate reporting
- ✅ Professional multi-variant support

---

## 🆘 Need Help?

If you encounter any issues:
1. Check this guide first
2. Verify database migration completed
3. Check browser console for errors
4. Review the SQL migration file: `scripts/add-product-variants.sql`

---

**Last Updated**: April 6, 2026
**Version**: 2.0 - Multi-Color Variants System
