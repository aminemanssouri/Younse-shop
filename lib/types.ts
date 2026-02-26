export interface Product {
  id: number;
  name: string;
  sku: string;
  stock_quantity: number;
  cost_price: number;
  selling_price: number;
  image_url?: string | null;
  measurement_unit?: string; // 'm' for meter or 'pce' for piece
  color?: string; // product color
  notes?: string; // product notes
  created_at: string;
  updated_at: string;
}

export interface Sale {
  id: number;
  product_id: number;
  quantity_sold: number;
  selling_price: number;
  total_amount: number;
  profit_amount: number;
  sale_date: string;
  notes?: string;
  created_at: string;
}

export interface CustomerDebt {
  id: number;
  customer_name: string;
  phone?: string;
  email?: string;
  total_debt: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SupplierDebt {
  id: number;
  supplier_name: string;
  contact_person?: string;
  phone?: string;
  total_debt: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DebtPayment {
  id: number;
  customer_debt_id?: number;
  supplier_debt_id?: number;
  amount: number;
  payment_date: string;
  payment_method?: string;
  notes?: string;
  created_at: string;
}

export interface DashboardMetrics {
  totalRevenue: number;
  totalProfit: number;
  totalCapitalInvested: number;
  totalCustomerDebt: number;
  totalSupplierDebt: number;
  totalProducts: number;
  lowStockProducts: number;
}

export interface SalesChartData {
  date: string;
  sales: number;
  profit: number;
}
