'use client';

import { Sale } from '@/lib/types';

interface SalesTableProps {
  sales: Sale[];
  onRefresh: () => void;
}

export default function SalesTable({ sales, onRefresh }: SalesTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="px-4 py-3 text-left font-semibold text-foreground">Product</th>
            <th className="px-4 py-3 text-right font-semibold text-foreground">Quantity</th>
            <th className="px-4 py-3 text-right font-semibold text-foreground">Unit Price</th>
            <th className="px-4 py-3 text-right font-semibold text-foreground">Total Amount</th>
            <th className="px-4 py-3 text-right font-semibold text-foreground">Profit</th>
            <th className="px-4 py-3 text-left font-semibold text-foreground">Date</th>
          </tr>
        </thead>
        <tbody>
          {sales.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                No sales records yet. Create one to get started.
              </td>
            </tr>
          ) : (
            sales.map((sale) => (
              <tr key={sale.id} className="border-b border-border hover:bg-muted/50">
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-foreground">{sale.product_name || 'Product'}</p>
                    <p className="text-xs text-muted-foreground">{sale.product_sku || 'SKU'}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-right text-foreground">{sale.quantity_sold}</td>
                <td className="px-4 py-3 text-right text-muted-foreground">
                  ${sale.selling_price.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-foreground">
                  ${sale.total_amount.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-green-100 text-green-800">
                    ${sale.profit_amount.toFixed(2)}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {formatDate(sale.sale_date)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
