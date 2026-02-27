'use client';

import { Sale } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { DetailsDialog } from '@/components/details-dialog';
import { useState } from 'react';
import { useLanguage } from '@/contexts/language-context';
import { displayPrice } from '@/lib/currency';

interface SalesTableProps {
  sales: Sale[];
  onRefresh: () => void;
}

export default function SalesTable({ sales, onRefresh }: SalesTableProps) {
  const { t, language } = useLanguage();
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleView = (sale: Sale) => {
    setSelectedSale(sale);
    setIsViewOpen(true);
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
            <th className="px-4 py-3 text-center font-semibold text-foreground">{t('view')}</th>
          </tr>
        </thead>
        <tbody>
          {sales.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                No sales records yet. Create one to get started.
              </td>
            </tr>
          ) : (
            sales.map((sale) => (
              <tr key={sale.id} className="border-b border-border hover:bg-muted/50">
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-foreground">{(sale as any).product_name || 'Product'}</p>
                    <p className="text-xs text-muted-foreground">{(sale as any).product_sku || 'SKU'}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-right text-foreground">{sale.quantity_sold}</td>
                <td className="px-4 py-3 text-right text-muted-foreground">
                  {displayPrice(sale.selling_price, language)}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-foreground">
                  {displayPrice(sale.total_amount, language)}
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-green-100 text-green-800">
                    {displayPrice(sale.profit_amount, language)}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {formatDate(sale.sale_date)}
                </td>
                <td className="px-4 py-3 text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleView(sale)}
                    title={t('view')}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <DetailsDialog
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title={t('details')}
      >
        {selectedSale && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Product</p>
              <p className="font-medium">{(selectedSale as any).product_name || selectedSale.product_id}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Quantity</p>
              <p className="font-medium">{selectedSale.quantity_sold}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Unit Price</p>
              <p className="font-medium">{displayPrice(selectedSale.selling_price, language)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Total Amount</p>
              <p className="font-medium">{displayPrice(selectedSale.total_amount, language)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Profit</p>
              <p className="font-medium">{displayPrice(selectedSale.profit_amount, language)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Date</p>
              <p className="font-medium">{formatDate(selectedSale.sale_date)}</p>
            </div>
            {selectedSale.notes && (
              <div className="col-span-2">
                <p className="text-muted-foreground">Notes</p>
                <p className="whitespace-pre-wrap">{selectedSale.notes}</p>
              </div>
            )}
          </div>
        )}
      </DetailsDialog>
    </div>
  );
}
