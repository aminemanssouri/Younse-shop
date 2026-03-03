'use server';

import { Product, Sale, CustomerDebt, SupplierDebt } from '@/lib/types';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

// PRODUCTS ACTIONS
export async function getProducts(): Promise<Product[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Product[];
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
    .select('*')
    .order('sale_date', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Sale[];
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
  if (product.stock_quantity < data.quantity_sold) throw new Error('Insufficient stock');
  
  const profitAmount = (data.selling_price - product.cost_price) * data.quantity_sold;

  const supabase = getSupabaseAdmin();

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

export async function deleteSale(id: number): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('sales').delete().eq('id', id);
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

  const totalRevenue = sales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0);
  const totalProfit = sales.reduce((sum, sale) => sum + (sale.profit_amount || 0), 0);
  const totalStockValue = products.reduce((sum, p) => sum + (p.stock_quantity * p.cost_price), 0);

  return {
    totalRevenue,
    totalProfit,
    totalProducts: products.length,
    totalStockValue,
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
