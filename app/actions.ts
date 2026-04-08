'use server';

import { Product, ProductVariant, Sale, CustomerDebt, SupplierDebt } from '@/lib/types';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

// PRODUCT VARIANTS ACTIONS
export async function getProductVariants(productId: number): Promise<ProductVariant[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('product_variants')
    .select('*')
    .eq('product_id', productId)
    .order('color', { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as ProductVariant[];
}

export async function addProductVariant(variant: Omit<ProductVariant, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('product_variants').insert(variant);
  if (error) throw new Error(error.message);
}

export async function updateProductVariant(id: number, data: Partial<Omit<ProductVariant, 'id' | 'created_at' | 'updated_at'>>): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('product_variants').update(data).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteProductVariant(id: number): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('product_variants').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// PRODUCTS ACTIONS
export async function getProducts(): Promise<Product[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  
  // Fetch variants for each product (with error handling for backward compatibility)
  const products = (data ?? []) as Product[];
  for (const product of products) {
    try {
      const variants = await getProductVariants(product.id);
      product.variants = variants;
      // Calculate total stock from variants if they exist
      if (variants.length > 0) {
        product.stock_quantity = variants.reduce((sum: number, v: ProductVariant) => sum + v.stock_quantity, 0);
      }
    } catch (err) {
      // If variants table doesn't exist yet (before migration), use legacy stock_quantity
      product.variants = [];
      // stock_quantity already exists in product data
    }
  }
  
  return products;
}

export async function getProduct(id: number): Promise<Product | undefined> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data ?? undefined) as Product | undefined;
}

export async function addProduct(data: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
  const supabase = getSupabaseAdmin();

  if (data.sku) {
    const { data: existing, error: existingError } = await supabase
      .from('products')
      .select('id')
      .eq('sku', data.sku)
      .limit(1);
    if (existingError) throw new Error(existingError.message);
    if ((existing ?? []).length > 0) throw new Error('SKU_ALREADY_EXISTS');
  }

  const { error } = await supabase.from('products').insert(data);
  if (error) throw new Error(error.message);
}

export async function updateProduct(id: number, data: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>): Promise<void> {
  const supabase = getSupabaseAdmin();

  if (data.sku) {
    const { data: existing, error: existingError } = await supabase
      .from('products')
      .select('id')
      .eq('sku', data.sku)
      .neq('id', id)
      .limit(1);
    if (existingError) throw new Error(existingError.message);
    if ((existing ?? []).length > 0) throw new Error('SKU_ALREADY_EXISTS');
  }

  const { error } = await supabase.from('products').update(data).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteProduct(id: number): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// SALES ACTIONS
export async function getSales(): Promise<Sale[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('sales')
    .select('*, products(name, sku)')
    .order('sale_date', { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((sale: any) => ({
    ...sale,
    product_name: sale.products?.name || '',
    product_sku: sale.products?.sku || '',
    products: undefined,
  })) as Sale[];
}

export async function getSale(id: number): Promise<Sale | undefined> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('sales')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data ?? undefined) as Sale | undefined;
}

export async function addSale(data: Omit<Sale, 'id' | 'created_at'>): Promise<void> {
  const product = await getProduct(data.product_id);
  if (!product) throw new Error('Product not found');
  
  const supabase = getSupabaseAdmin();
  
  // If variant_id is provided, update variant stock
  if (data.variant_id) {
    const { data: variantData, error: variantError } = await supabase
      .from('product_variants')
      .select('*')
      .eq('id', data.variant_id)
      .maybeSingle();
    
    if (variantError) throw new Error(variantError.message);
    if (!variantData) throw new Error('Variant not found');
    
    const variant = variantData as ProductVariant;
    if (variant.stock_quantity < data.quantity_sold) throw new Error('Insufficient stock for this color');
    
    const profitAmount = (data.selling_price - product.cost_price) * data.quantity_sold;

    // Insert sale
    const { error: insertError } = await supabase.from('sales').insert({
      ...data,
      profit_amount: profitAmount,
    });
    if (insertError) throw new Error(insertError.message);

    // Update variant stock
    const newVariantStock = variant.stock_quantity - data.quantity_sold;
    const { error: updateError } = await supabase
      .from('product_variants')
      .update({ stock_quantity: newVariantStock })
      .eq('id', data.variant_id);
    if (updateError) throw new Error(updateError.message);
  } else {
    // Legacy: no variant specified, use old logic
    if (product.stock_quantity < data.quantity_sold) throw new Error('Insufficient stock');
    
    const profitAmount = (data.selling_price - product.cost_price) * data.quantity_sold;

    const { error: insertError } = await supabase.from('sales').insert({
      ...data,
      profit_amount: profitAmount,
    });
    if (insertError) throw new Error(insertError.message);

    const newStock = product.stock_quantity - data.quantity_sold;
    const { error: updateError } = await supabase
      .from('products')
      .update({ stock_quantity: newStock })
      .eq('id', data.product_id);
    if (updateError) throw new Error(updateError.message);
  }
}

export async function deleteSale(id: number): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('sales').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function updateSale(
  id: number,
  data: Partial<Pick<Sale, 'status' | 'amount_paid' | 'notes'>>
): Promise<void> {
  const sale = await getSale(id);
  if (!sale) throw new Error('Sale not found');

  const supabase = getSupabaseAdmin();

  // Calculate remaining debt based on new amount_paid
  let amountPaid = data.amount_paid ?? sale.amount_paid;
  let remainingDebt = sale.total_amount - amountPaid;
  let status = data.status ?? sale.status;

  // Auto-update status if fully paid
  if (amountPaid >= sale.total_amount) {
    amountPaid = sale.total_amount;
    remainingDebt = 0;
    status = 'completed';
  }

  const { error } = await supabase
    .from('sales')
    .update({
      status,
      amount_paid: amountPaid,
      remaining_debt: remainingDebt,
      notes: data.notes ?? sale.notes,
    })
    .eq('id', id);

  if (error) throw new Error(error.message);
}

export async function cancelSale(id: number): Promise<void> {
  const sale = await getSale(id);
  if (!sale) throw new Error('Sale not found');

  const product = await getProduct(sale.product_id);
  if (!product) throw new Error('Product not found');

  const supabase = getSupabaseAdmin();

  const newStock = (product.stock_quantity || 0) + (sale.quantity_sold || 0);
  const { error: updateError } = await supabase
    .from('products')
    .update({ stock_quantity: newStock })
    .eq('id', sale.product_id);
  if (updateError) throw new Error(updateError.message);

  const { error: deleteError } = await supabase.from('sales').delete().eq('id', id);
  if (deleteError) throw new Error(deleteError.message);
}

// CUSTOMER DEBTS ACTIONS
export async function getCustomerDebts(): Promise<CustomerDebt[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('customer_debts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as CustomerDebt[];
}

export async function getCustomerDebt(id: number): Promise<CustomerDebt | undefined> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('customer_debts')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data ?? undefined) as CustomerDebt | undefined;
}

export async function addCustomerDebt(data: Omit<CustomerDebt, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('customer_debts').insert(data);
  if (error) throw new Error(error.message);
}

export async function updateCustomerDebt(id: number, data: Partial<Omit<CustomerDebt, 'id' | 'created_at' | 'updated_at'>>): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('customer_debts').update(data).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteCustomerDebt(id: number): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('customer_debts').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// SUPPLIER DEBTS ACTIONS
export async function getSupplierDebts(): Promise<SupplierDebt[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('supplier_debts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as SupplierDebt[];
}

export async function getSupplierDebt(id: number): Promise<SupplierDebt | undefined> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('supplier_debts')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data ?? undefined) as SupplierDebt | undefined;
}

export async function addSupplierDebt(data: Omit<SupplierDebt, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('supplier_debts').insert(data);
  if (error) throw new Error(error.message);
}

export async function updateSupplierDebt(id: number, data: Partial<Omit<SupplierDebt, 'id' | 'created_at' | 'updated_at'>>): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('supplier_debts').update(data).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteSupplierDebt(id: number): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('supplier_debts').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// DASHBOARD STATS
export async function getDashboardStats(): Promise<{
  totalRevenue: number;
  totalProfit: number;
  totalProducts: number;
  totalStockValue: number;
}> {
  const [products, sales] = await Promise.all([getProducts(), getSales()]);

  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth();
  const todayDay = today.getDate();

  const todaySales = sales.filter(sale => {
    const saleDate = new Date(sale.sale_date);
    return (
      saleDate.getFullYear() === todayYear &&
      saleDate.getMonth() === todayMonth &&
      saleDate.getDate() === todayDay
    );
  });

  const totalRevenue = todaySales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0);
  const totalProfit = todaySales.reduce((sum, sale) => sum + (sale.profit_amount || 0), 0);
  const totalStockValue = products.reduce((sum, p) => sum + (p.stock_quantity * p.cost_price), 0);

  return {
    totalRevenue,
    totalProfit,
    totalProducts: products.length,
    totalStockValue,
  };
}

export async function getDailySalesReport(): Promise<{
  date: string;
  sales: Array<{
    product_name: string;
    quantity_sold: number;
    selling_price: number;
    total_amount: number;
    profit_amount: number;
  }>;
  totalRevenue: number;
  totalProfit: number;
  totalCost: number;
}> {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  return getDailySalesReportByDate(todayStr);
}

export async function getDailySalesReportByDate(dateStr: string): Promise<{
  date: string;
  sales: Array<{
    product_name: string;
    quantity_sold: number;
    selling_price: number;
    total_amount: number;
    profit_amount: number;
    status: 'completed' | 'pending';
    amount_paid: number;
    remaining_debt: number;
  }>;
  totalRevenue: number;
  totalProfit: number;
  totalCost: number;
}> {
  const [products, sales] = await Promise.all([getProducts(), getSales()]);

  // Parse dateStr (YYYY-MM-DD) as UTC to avoid timezone issues
  const [year, month, day] = dateStr.split('-').map(Number);
  const targetYear = year;
  const targetMonth = month - 1; // JS months are 0-indexed
  const targetDay = day;

  const daySales = sales.filter(sale => {
    const saleDate = new Date(sale.sale_date);
    return (
      saleDate.getFullYear() === targetYear &&
      saleDate.getMonth() === targetMonth &&
      saleDate.getDate() === targetDay
    );
  });

  const productsMap = new Map(products.map(p => [p.id, p]));

  const salesWithDetails = daySales.map(sale => {
    const product = productsMap.get(sale.product_id);
    const amountPaid = sale.amount_paid ?? sale.total_amount ?? 0;
    return {
      product_name: product?.name || `Product ${sale.product_id}`,
      quantity_sold: sale.quantity_sold ?? 0,
      selling_price: sale.selling_price ?? 0,
      total_amount: sale.total_amount ?? 0,
      profit_amount: sale.profit_amount ?? 0,
      status: (sale.status || 'completed') as 'completed' | 'pending',
      amount_paid: amountPaid,
      remaining_debt: sale.remaining_debt ?? ((sale.total_amount - amountPaid) || 0),
    };
  });

  const totalRevenue = daySales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0);
  const totalProfit = daySales.reduce((sum, sale) => sum + (sale.profit_amount || 0), 0);
  const totalCost = totalRevenue - totalProfit;

  return {
    date: dateStr,
    sales: salesWithDetails,
    totalRevenue,
    totalProfit,
    totalCost,
  };
}

// NOTES ACTIONS
export async function getNotes(productId?: number) {
  const supabase = getSupabaseAdmin();
  let query = supabase.from('notes').select('*').order('created_at', { ascending: false });
  if (productId) query = query.eq('product_id', productId);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function addNote(data: { product_id?: number; content: string }) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('notes').insert(data);
  if (error) throw new Error(error.message);
}

export async function updateNote(id: number, content: string) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('notes').update({ content }).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteNote(id: number) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('notes').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
